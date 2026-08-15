import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { InvestmentRequest, RequestStatus } from './investment-request.entity';
import { User } from '../user/user.entity';
import { Investment } from '../investment/investment.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transaction/transaction.entity';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class InvestmentRequestService {
  constructor(
    @InjectRepository(InvestmentRequest)
    private requestRepository: Repository<InvestmentRequest>,
    private auditLogService: AuditLogService,
    private dataSource: DataSource,
  ) {}

  async create(data: Partial<InvestmentRequest>): Promise<InvestmentRequest> {
    const request = this.requestRepository.create(data);
    return this.requestRepository.save(request);
  }

  async findAll(status?: RequestStatus): Promise<InvestmentRequest[]> {
    const query = this.requestRepository.createQueryBuilder('request');
    if (status) {
      query.where('request.status = :status', { status });
    }
    query.orderBy('request.createdAt', 'DESC');
    return query.getMany();
  }

  async findMyRequests(userId: string, status?: RequestStatus): Promise<InvestmentRequest[]> {
    await this.checkAndRefundMaturedExits(userId);

    const query = this.requestRepository.createQueryBuilder('request');
    query.where('request.userId = :userId', { userId });
    if (status) {
      query.andWhere('request.status = :status', { status });
    }
    query.orderBy('request.createdAt', 'DESC');
    return query.getMany();
  }

  // ✅ طلب انسحاب من الاشتراك (قبل أو بعد مضي 4 أشهر)
  async requestExit(requestId: string, userId: string, exitReason?: string) {
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('طلب الاشتراك غير موجود');
    if (request.userId !== userId) throw new BadRequestException('ليس لديك صلاحية على هذا الاشتراك');
    if (request.status !== RequestStatus.APPROVED) throw new BadRequestException('هذا الاشتراك غير نشط');
    if (request.isExitRequested && request.isCapitalRefunded) {
      throw new BadRequestException('تم الانسحاب من هذا الاشتراك واسترداد رأس المال بالكامل مسبقاً');
    }

    const now = new Date().getTime();
    const createdTime = new Date(request.createdAt).getTime();
    const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;
    const unlockDate = new Date(createdTime + FOUR_MONTHS_MS);
    const daysElapsed = (now - createdTime) / (1000 * 60 * 60 * 24);
    const isMatured = daysElapsed >= 120;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const investment = await queryRunner.manager.findOne(Investment, { where: { id: request.investmentId } });
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user || !investment) throw new NotFoundException('البيانات غير مكتملة');

      const shares = request.numberOfShares || 1;
      const capitalTotal = new Decimal(investment.capital).times(shares).times(1.25).toNumber(); // 100% capital + 25% fee

      if (isMatured) {
        // مضى 4 أشهر: انسحاب كامل مع إرجاع رأس المال والأرباح 100%
        request.isExitRequested = true;
        request.exitRequestedAt = new Date();
        request.exitReason = exitReason || 'انسحاب مكتمل بعد مضي 4 أشهر';
        request.isCapitalRefunded = true;
        request.capitalRefundedAt = new Date();
        await queryRunner.manager.save(request);

        const oldBalance = user.balance;
        user.balance = new Decimal(user.balance || 0).plus(capitalTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
        await queryRunner.manager.save(user);

        const refundTx = queryRunner.manager.create(Transaction, {
          userId,
          type: TransactionType.REFUND,
          amount: capitalTotal,
          status: TransactionStatus.COMPLETED,
          method: `استرداد رأس المال الكامل ($${capitalTotal}) بعد مضي 4 أشهر - صفقة #${investment.id}`,
          adminNotes: `انسحاب كامل مكتمل بعد 4 أشهر من تاريخ الاشتراك ${new Date(request.createdAt).toLocaleDateString('ar-SA')}`,
        });
        await queryRunner.manager.save(refundTx);

        await queryRunner.commitTransaction();

        await this.auditLogService.log({
          targetUserId: userId,
          targetUserEmail: user.email,
          action: 'INVESTMENT_EXIT_MATURED',
          oldValue: { balance: oldBalance },
          newValue: { balance: user.balance, capitalReturned: capitalTotal, investmentId: investment.id },
          reason: 'انسحاب مكتمل واسترداد رأس المال بعد مضي 4 أشهر',
        });

        return {
          success: true,
          isMatured: true,
          capitalReturned: capitalTotal,
          message: `تم تنفيذ الانسحاب بنجاح! مضى أكثر من 4 أشهر على اشتراكك، وتم إعادة رأس المال والأرباح بالكامل ($${capitalTotal}) إلى رصيدك.`,
        };
      } else {
        // قبل مضي 4 أشهر: تتوقف الأرباح فوراً ولا يعاد رأس المال إلا بعد مضي 4 أشهر
        if (request.isExitRequested) {
          throw new BadRequestException(
            `لقد قدمت طلب انسحاب لهذه الصفقة مسبقاً، والأرباح متوقفة. سيتم إعادة رأس المال تلقائياً بتاريخ ${unlockDate.toISOString().split('T')[0]} (بعد مضي 4 أشهر).`,
          );
        }

        request.isExitRequested = true;
        request.exitRequestedAt = new Date();
        request.exitReason = exitReason || 'رسالة طلب انسحاب مبكر قبل مضي 4 أشهر';
        await queryRunner.manager.save(request);

        await queryRunner.commitTransaction();

        await this.auditLogService.log({
          targetUserId: userId,
          targetUserEmail: user.email,
          action: 'INVESTMENT_EXIT_REQUESTED_EARLY',
          newValue: { requestId: request.id, investmentId: investment.id, unlockDate },
          reason: 'طلب انسحاب قبل مضي 4 أشهر - توقفت الأرباح وسيحرر رأس المال بعد 4 أشهر',
        });

        return {
          success: true,
          isMatured: false,
          unlockDate: unlockDate.toISOString().split('T')[0],
          message: `تم تسجيل طلب الانسحاب بنجاح. توقفت الأرباح على هذه الصفقة اعتباراً من اليوم، وسيتم تحرير رأس المال ($${capitalTotal}) وإعادته تلقائياً إلى رصيدك بتاريخ ${unlockDate.toISOString().split('T')[0]} (فور انقضاء 4 أشهر على تاريخ الاشتراك).`,
        };
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ فحص تلقائي لتحرير رأس المال للاشتراكات التي طُلِب فيها الانسحاب وانقضى عليها 4 أشهر
  async checkAndRefundMaturedExits(userId?: string) {
    const now = new Date();
    const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;

    const query = this.requestRepository.createQueryBuilder('req')
      .where('req.isExitRequested = :isExitRequested', { isExitRequested: true })
      .andWhere('req.isCapitalRefunded = :isCapitalRefunded', { isCapitalRefunded: false })
      .andWhere('req.status = :status', { status: RequestStatus.APPROVED });

    if (userId) {
      query.andWhere('req.userId = :userId', { userId });
    }

    const pendingRefundRequests = await query.getMany();

    for (const req of pendingRefundRequests) {
      const createdTime = new Date(req.createdAt).getTime();
      if (now.getTime() - createdTime >= FOUR_MONTHS_MS) {
        // انقضت 4 أشهر! تحرير رأس المال
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const user = await queryRunner.manager.findOne(User, { where: { id: req.userId } });
          const investment = await queryRunner.manager.findOne(Investment, { where: { id: req.investmentId } });

          if (user && investment) {
            const shares = req.numberOfShares || 1;
            const capitalTotal = new Decimal(investment.capital).times(shares).times(1.25).toNumber();

            user.balance = new Decimal(user.balance || 0).plus(capitalTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
            await queryRunner.manager.save(user);

            req.isCapitalRefunded = true;
            req.capitalRefundedAt = new Date();
            await queryRunner.manager.save(req);

            const refundTx = queryRunner.manager.create(Transaction, {
              userId: req.userId,
              type: TransactionType.REFUND,
              amount: capitalTotal,
              status: TransactionStatus.COMPLETED,
              method: `تحرير رأس المال التلقائي ($${capitalTotal}) بعد انقضاء 4 أشهر - صفقة #${investment.id}`,
              adminNotes: `تم رد رأس المال تلقائياً للمستثمر بعد اكتمال 4 أشهر من تاريخ الاشتراك ${new Date(req.createdAt).toLocaleDateString('ar-SA')}`,
            });
            await queryRunner.manager.save(refundTx);
          }

          await queryRunner.commitTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
          console.error('Error auto refunding matured exit:', err);
        } finally {
          await queryRunner.release();
        }
      }
    }
  }



  async approve(id: string, adminUser?: { id: string; email: string }, ipAddress?: string): Promise<InvestmentRequest> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Investment request not found');
    }
    request.status = RequestStatus.APPROVED;
    const saved = await this.requestRepository.save(request);

    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'APPROVE_INVESTMENT_REQUEST',
      targetUserId: request.userId,
      targetUserEmail: request.userEmail,
      oldValue: { status: RequestStatus.PENDING },
      newValue: { status: RequestStatus.APPROVED, investmentId: request.investmentId, numberOfShares: request.numberOfShares },
      ipAddress,
    });

    return saved;
  }

  async reject(id: string, adminUser?: { id: string; email: string }, ipAddress?: string): Promise<InvestmentRequest> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Investment request not found');
    }
    request.status = RequestStatus.REJECTED;
    const saved = await this.requestRepository.save(request);

    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'REJECT_INVESTMENT_REQUEST',
      targetUserId: request.userId,
      targetUserEmail: request.userEmail,
      oldValue: { status: RequestStatus.PENDING },
      newValue: { status: RequestStatus.REJECTED, investmentId: request.investmentId, numberOfShares: request.numberOfShares },
      ipAddress,
    });

    return saved;
  }
}
