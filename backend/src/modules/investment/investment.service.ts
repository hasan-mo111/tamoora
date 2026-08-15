import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { Investment, InvestmentType, InvestmentStatus } from './investment.entity';
import { User } from '../user/user.entity';
import { DailyCheckIn } from '../user/daily-checkin.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transaction/transaction.entity';
import { InvestmentRequest, RequestStatus } from '../investment-request/investment-request.entity';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class InvestmentService implements OnModuleInit {
  private readonly logger = new Logger(InvestmentService.name);
  private settlementInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DailyCheckIn)
    private checkInRepository: Repository<DailyCheckIn>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(InvestmentRequest)
    private requestRepository: Repository<InvestmentRequest>,
    private auditLogService: AuditLogService,
    private dataSource: DataSource,
  ) {}

  onModuleInit() {
    // ⏱️ فحص دوري كل 30 ثانية لتوزيع الأرباح تباعاً لكل مستثمر عند اكتمال مدته
    this.settlementInterval = setInterval(async () => {
      try {
        await this.settleAllMaturedProfits();
      } catch (err) {
        this.logger.error('Error during scheduled profit maturity settlement:', err);
      }
    }, 30000);
  }

  async findAll(status?: InvestmentStatus): Promise<Investment[]> {
    const query = this.investmentRepository.createQueryBuilder('investment');
    if (status) {
      query.where('investment.status = :status', { status });
    }
    return query.orderBy('investment.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Investment> {
    const investment = await this.investmentRepository.findOne({ where: { id } });
    if (!investment) {
      throw new NotFoundException('Investment not found');
    }
    return investment;
  }

  async create(data: Partial<Investment>): Promise<Investment> {
    if (data.type === InvestmentType.QUARTERLY && data.adminApproved === undefined) {
      data.adminApproved = false;
    }
    const investment = this.investmentRepository.create(data);
    return this.investmentRepository.save(investment);
  }

  async approveProject(id: string): Promise<Investment> {
    const investment = await this.findOne(id);
    investment.adminApproved = true;
    return this.investmentRepository.save(investment);
  }

  async update(id: string, data: Partial<Investment>): Promise<Investment> {
    const investment = await this.findOne(id);
    Object.assign(investment, data);
    return this.investmentRepository.save(investment);
  }

  // ✅ إلغاء/حذف مشروع وإعادة كامل أموال المشتركين (125% شاملة راس المال والعمولة) تلقائياً
  async delete(id: string): Promise<{ success: boolean; message: string; refundedUsersCount: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const investment = await queryRunner.manager.findOne(Investment, { where: { id } });
      if (!investment) throw new NotFoundException('الاستثمار غير موجود');

      // إعادة الأموال والعمولات (125%) تتم فقط للمشاريع الأخرى وفقط إذا تم الإلغاء قبل البدأ (adminApproved === false)
      const shouldRefund = investment.type === InvestmentType.QUARTERLY && investment.adminApproved === false;

      let refundedUsersCount = 0;

      if (shouldRefund) {
        // جلب جميع طلبات الاشتراك لهذا الاستثمار
        const approvedRequests = await queryRunner.manager.find(InvestmentRequest, {
          where: {
            investmentId: id,
            status: RequestStatus.APPROVED,
          },
        });

        for (const req of approvedRequests) {
          const user = await queryRunner.manager
            .createQueryBuilder(User, 'u')
            .setLock('pessimistic_write')
            .where('u.id = :userId', { userId: req.userId })
            .getOne();

          if (user) {
            const shares = req.numberOfShares || 1;
            const capitalAmount = new Decimal(investment.capital).times(shares);
            const refundTotal = capitalAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

            const newBalance = new Decimal(user.balance || 0).plus(refundTotal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
            user.balance = newBalance;
            await queryRunner.manager.save(user);

            // تسجيل معاملة استرداد أموال
            const refundTx = queryRunner.manager.create(Transaction, {
              userId: user.id,
              type: TransactionType.REFUND,
              amount: refundTotal,
              status: TransactionStatus.COMPLETED,
              method: `إعادة رأس مال الاستثمار (100%) بعد إلغاء المشروع قبل البدء #${investment.id}`,
              adminNotes: `تم استرداد رأس المال $${capitalAmount.toNumber()} بالكامل تلقائياً قبل انطلاق المشروع.`,
            });
            await queryRunner.manager.save(refundTx);

            refundedUsersCount++;
          }
        }
      }

      await queryRunner.manager.remove(Investment, investment);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: refundedUsersCount > 0 
          ? `تم حذف المشروع وإعادة كامل رأس مال ${refundedUsersCount} مشترك إلى أرصدتهم بنجاح.`
          : 'تم حذف المشروع بنجاح.',
        refundedUsersCount,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getAvailableInvestments(): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { 
        status: InvestmentStatus.ACTIVE,
        availableShares: MoreThan(0),
      },
      order: { capital: 'ASC' },
    });
  }

  // ✅ الاشتراك المباشر بالصفقة مع خصم 100% من قيمة الصفقة (رأس المال فقط)
  async subscribe(
    investmentId: string,
    userId: string,
    numberOfShares: number = 1,
    contractSignature?: string,
    contractSignerName?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const investment = await queryRunner.manager.findOne(Investment, { where: { id: investmentId } });
      if (!investment) throw new NotFoundException('الاستثمار غير موجود');
      if (investment.status !== InvestmentStatus.ACTIVE) throw new BadRequestException('هذا الاستثمار غير نشط حالياً');
      if (investment.availableShares < numberOfShares) throw new BadRequestException('عدد الأسهم المتاحة غير كافٍ');

      // التحقق من توقيع العقد للمشاريع التشغيلية
      if (investment.type === InvestmentType.QUARTERLY && !contractSignature) {
        throw new BadRequestException('يتطلب الاشتراك في المشاريع التشغيلية توقيع العقد الإلكتروني أولاً');
      }

      const user = await queryRunner.manager
        .createQueryBuilder(User, 'u')
        .setLock('pessimistic_write')
        .where('u.id = :userId', { userId })
        .getOne();

      if (!user) throw new NotFoundException('المستخدم غير موجود');

      const capitalAmount = new Decimal(investment.capital).times(numberOfShares);
      const totalRequired = capitalAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP); // 100% فقط (رأس المال)

      const userBalance = new Decimal(user.balance || 0);

      if (userBalance.lessThan(totalRequired)) {
        throw new BadRequestException(
          `رصيدك المتاح ($${userBalance.toFixed(2)}) غير كافٍ للاشتراك. المبلغ المطلوب هو ($${totalRequired.toFixed(2)}) للاكتتاب في ${numberOfShares} سهم.`
        );
      }

      // التحقق مما إذا كانت هذه أول صفقة للمستخدم
      const previousApprovedRequests = await queryRunner.manager.count(InvestmentRequest, {
        where: {
          userId: user.id,
          status: RequestStatus.APPROVED,
        },
      });
      const isFirstInvestment = previousApprovedRequests === 0;

      // خصم قيمة رأس المال 100% فقط من رصيد المشترك
      const newBalance = userBalance.minus(totalRequired).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
      user.balance = newBalance;
      await queryRunner.manager.save(user);

      // تحديث الأسهم المتاحة
      investment.availableShares -= numberOfShares;
      await queryRunner.manager.save(investment);

      // إنشاء طلب استثمار مقبول فوراً مع حفظ بيانات العقد الإلكتروني إن وجدت
      const request = queryRunner.manager.create(InvestmentRequest, {
        investmentId: investment.id,
        userId: user.id,
        userEmail: user.email,
        numberOfShares,
        status: RequestStatus.APPROVED,
        isContractSigned: !!contractSignature,
        contractSignedAt: contractSignature ? new Date() : null,
        contractSignerName: contractSignerName || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email),
        contractSignature: contractSignature || null,
        message: `اشتراك في صفقة #${investment.id} عدد أسهم: ${numberOfShares}`,
      });
      await queryRunner.manager.save(request);

      // تسجيل معاملة شراء الأسهم (رأس المال 100%)
      const purchaseTx = queryRunner.manager.create(Transaction, {
        userId: user.id,
        type: TransactionType.INVESTMENT_PURCHASE,
        amount: capitalAmount.toNumber(),
        status: TransactionStatus.COMPLETED,
        method: `شراء ${numberOfShares} سهم من صفقة #${investment.id}`,
        adminNotes: `اكتتاب استثماري - رأس المال $${capitalAmount.toFixed(2)}`,
      });
      await queryRunner.manager.save(purchaseTx);

      // ✅ صرف عمولات الإحالة لـ 4 مستويات إذا كانت هذه أول صفقة للمستثمر
      if (isFirstInvestment) {
        await this.processReferralCommissions(queryRunner, user, capitalAmount);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `تم الاشتراك بالصفقة بنجاح وتم خصم قيمة الصفقة ($${capitalAmount.toFixed(2)}) من رصيدك.`,
        newBalance,
        investment,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // حساب المخطط الزمني للخطة مع احتساب أيام الحضور والغياب (تأخير العداد في حال عدم الحضور)
  private async calculateSubscriptionTimeline(
    req: InvestmentRequest,
    investment: Investment,
    userCheckIns?: DailyCheckIn[],
  ) {
    const subCreatedTime = new Date(req.createdAt).getTime();
    const timerStartTime = subCreatedTime + 24 * 60 * 60 * 1000; // يبدأ العداد بعد 24 ساعة بالضبط

    let baseDurationDays = 7;
    if (investment.type === InvestmentType.MONTHLY) baseDurationDays = 30;
    if (investment.type === InvestmentType.QUARTERLY) baseDurationDays = (investment.durationMonths || 3) * 30;

    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    let checkIns = userCheckIns;
    if (!checkIns) {
      checkIns = await this.checkInRepository.find({
        where: { userId: req.userId },
      });
    }

    const checkInDatesSet = new Set(checkIns.map((c) => c.date));
    const hasCheckedInToday = checkInDatesSet.has(todayStr);

    let missedDays = 0;
    let attendedDays = 0;

    // إذا بدأ العداد فعلياً (بعد مرور الـ 24 ساعة التحضيرية):
    if (now > timerStartTime) {
      // نحسب كل يوم تقويمي كامل انقضى قبل اليوم الحالي
      const iter = new Date(timerStartTime);
      iter.setUTCHours(0, 0, 0, 0);

      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(23, 59, 59, 999);

      while (iter.getTime() <= yesterday.getTime()) {
        const dateStr = iter.toISOString().split('T')[0];
        if (checkInDatesSet.has(dateStr)) {
          attendedDays++;
        } else {
          missedDays++; // يوم غياب يضاف إلى مدة الخطة
        }
        iter.setUTCDate(iter.getUTCDate() + 1);
      }
    }

    // المدة الفعلية بالأيام بعد إضافة أيام الغياب المسجلة
    const effectiveDurationDays = baseDurationDays + missedDays;
    const endTime = timerStartTime + effectiveDurationDays * 24 * 60 * 60 * 1000;

    const isDelayPeriod = now < timerStartTime;
    const delayRemainingMs = Math.max(0, timerStartTime - now);

    const isTimerRunning = investment.adminApproved && now >= timerStartTime && now < endTime;
    const timerRemainingMs = Math.max(0, endTime - now);

    const isReadyForProfit = investment.adminApproved && now >= endTime;

    return {
      subCreatedTime,
      timerStartTime,
      endTime,
      baseDurationDays,
      effectiveDurationDays,
      missedDays,
      attendedDays,
      hasCheckedInToday,
      isDelayPeriod,
      delayRemainingMs,
      isTimerRunning,
      timerRemainingMs,
      isReadyForProfit,
    };
  }

  // ✅ تسوية واستحقاق الأرباح تباعاً لكل المشتركين الذين حققوا مدة الاستثمار
  async settleAllMaturedProfits(specificInvestmentId?: string) {
    const investmentsQuery = this.investmentRepository.createQueryBuilder('inv')
      .where('inv.status = :status', { status: InvestmentStatus.ACTIVE })
      .andWhere('inv.declaredProfitPercentage > 0');

    if (specificInvestmentId) {
      investmentsQuery.andWhere('inv.id = :id', { id: specificInvestmentId });
    }

    const investments = await investmentsQuery.getMany();
    if (investments.length === 0) return { settledCount: 0, totalProfitAmount: 0 };

    let totalSettledCount = 0;
    let grandTotalProfit = new Decimal(0);
    const now = Date.now();

    for (const investment of investments) {
      if (!investment.declaredProfitPercentage || investment.declaredProfitPercentage <= 0) continue;

      const approvedRequests = await this.requestRepository.find({
        where: {
          investmentId: investment.id,
          status: RequestStatus.APPROVED,
          isExitRequested: false,
          isCapitalRefunded: false,
        },
      });

      for (const req of approvedRequests) {
        const timeline = await this.calculateSubscriptionTimeline(req, investment);

        // هل اكتملت مدة الخطة لهذا المستثمر؟
        if (now < timeline.endTime) {
          continue; // لا يستلم حتى يحين موعد استلامه للربح
        }

        // هل استلم الربح الخاص بهذه الدورة المعلنة بالفعل؟
        if (req.lastProfitPaidAt && investment.lastProfitDistributedAt) {
          if (new Date(req.lastProfitPaidAt).getTime() >= new Date(investment.lastProfitDistributedAt).getTime()) {
            continue; // تم الصرف له مسبقاً
          }
        }

        // تنفيذ الصرف للمستثمر المؤهل في معاملة آمنة
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const user = await queryRunner.manager
            .createQueryBuilder(User, 'u')
            .setLock('pessimistic_write')
            .where('u.id = :userId', { userId: req.userId })
            .getOne();

          if (user) {
            const shares = req.numberOfShares || 1;
            const investedCapital = new Decimal(investment.capital).times(shares);
            const profitAmount = investedCapital
              .times(investment.declaredProfitPercentage)
              .dividedBy(100)
              .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

            const newBalance = new Decimal(user.balance || 0)
              .plus(profitAmount)
              .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
              .toNumber();

            user.balance = newBalance;
            await queryRunner.manager.save(User, user);

            // تسجيل معاملة استحقاق الربح
            const profitTx = queryRunner.manager.create(Transaction, {
              userId: user.id,
              type: TransactionType.PROFIT,
              amount: profitAmount.toNumber(),
              status: TransactionStatus.COMPLETED,
              method: `توزيع أرباح صفقة #${investment.id.substring(0, 8)} (${investment.declaredProfitPercentage}%)`,
              adminNotes: `استحقاق أرباح مكتملة الفترة بنسبة ${investment.declaredProfitPercentage}% على رأس مال $${investedCapital.toFixed(2)}`,
            });
            await queryRunner.manager.save(Transaction, profitTx);

            // تحديث طلب الاشتراك لمنع التكرار
            req.lastProfitPaidAt = new Date();
            req.lastProfitPercentagePaid = investment.declaredProfitPercentage;
            req.totalProfitEarned = new Decimal(req.totalProfitEarned || 0)
              .plus(profitAmount)
              .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
              .toNumber();
            await queryRunner.manager.save(InvestmentRequest, req);

            await queryRunner.commitTransaction();

            totalSettledCount++;
            grandTotalProfit = grandTotalProfit.plus(profitAmount);
          } else {
            await queryRunner.rollbackTransaction();
          }
        } catch (err) {
          await queryRunner.rollbackTransaction();
          this.logger.error(`Failed to settle matured profit for request ${req.id}:`, err);
        } finally {
          await queryRunner.release();
        }
      }
    }

    return {
      settledCount: totalSettledCount,
      totalProfitAmount: grandTotalProfit.toNumber(),
    };
  }

  // ✅ تسوية أرباح مستخدم محدد عند استعراض اشتراكاته
  async settleUserMaturedProfits(userId: string) {
    const requests = await this.requestRepository.find({
      where: {
        userId,
        status: RequestStatus.APPROVED,
        isExitRequested: false,
        isCapitalRefunded: false,
      },
    });

    const now = Date.now();

    for (const req of requests) {
      const investment = await this.investmentRepository.findOne({ where: { id: req.investmentId } });
      if (!investment || !investment.declaredProfitPercentage || investment.declaredProfitPercentage <= 0) {
        continue;
      }

      const timeline = await this.calculateSubscriptionTimeline(req, investment);

      if (now < timeline.endTime) continue;

      if (req.lastProfitPaidAt && investment.lastProfitDistributedAt) {
        if (new Date(req.lastProfitPaidAt).getTime() >= new Date(investment.lastProfitDistributedAt).getTime()) {
          continue;
        }
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const user = await queryRunner.manager
          .createQueryBuilder(User, 'u')
          .setLock('pessimistic_write')
          .where('u.id = :userId', { userId })
          .getOne();

        if (user) {
          const shares = req.numberOfShares || 1;
          const investedCapital = new Decimal(investment.capital).times(shares);
          const profitAmount = investedCapital
            .times(investment.declaredProfitPercentage)
            .dividedBy(100)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

          user.balance = new Decimal(user.balance || 0)
            .plus(profitAmount)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
            .toNumber();
          await queryRunner.manager.save(User, user);

          const profitTx = queryRunner.manager.create(Transaction, {
            userId: user.id,
            type: TransactionType.PROFIT,
            amount: profitAmount.toNumber(),
            status: TransactionStatus.COMPLETED,
            method: `توزيع أرباح صفقة #${investment.id.substring(0, 8)} (${investment.declaredProfitPercentage}%)`,
            adminNotes: `استحقاق أرباح مكتملة الفترة بنسبة ${investment.declaredProfitPercentage}% على رأس مال $${investedCapital.toFixed(2)}`,
          });
          await queryRunner.manager.save(Transaction, profitTx);

          req.lastProfitPaidAt = new Date();
          req.lastProfitPercentagePaid = investment.declaredProfitPercentage;
          req.totalProfitEarned = new Decimal(req.totalProfitEarned || 0)
            .plus(profitAmount)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
            .toNumber();
          await queryRunner.manager.save(InvestmentRequest, req);

          await queryRunner.commitTransaction();
        } else {
          await queryRunner.rollbackTransaction();
        }
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
  }

  // ✅ توزيع الأرباح: يحدد الأدمن النسبة وتوزع تباعاً على كل من يحقق الفترة حسب موعد اشتراكه
  async distributeProfit(
    investmentId: string,
    profitPercentage: number,
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ) {
    if (profitPercentage <= 0) {
      throw new BadRequestException('نسبة الربح يجب أن تكون قيمة موجبة أكبر من صفر');
    }

    const investment = await this.investmentRepository.findOne({ where: { id: investmentId } });
    if (!investment) throw new NotFoundException('الاستثمار غير موجود');

    // تسجيل وتأكيد نسبة الربح المحددة من قبل الإدارة
    investment.declaredProfitPercentage = profitPercentage;
    investment.lastProfitDistributedAt = new Date();
    await this.investmentRepository.save(investment);

    // جلب جميع طلبات الاشتراك المقبولة
    const approvedRequests = await this.requestRepository.find({
      where: {
        investmentId,
        status: RequestStatus.APPROVED,
        isExitRequested: false,
        isCapitalRefunded: false,
      },
    });

    const now = Date.now();
    let durationDays = 7;
    if (investment.type === InvestmentType.MONTHLY) durationDays = 30;
    if (investment.type === InvestmentType.QUARTERLY) durationDays = (investment.durationMonths || 3) * 30;

    let matureCount = 0;
    let pendingScheduledCount = 0;

    for (const req of approvedRequests) {
      const subCreatedTime = new Date(req.createdAt).getTime();
      const timerStartTime = subCreatedTime + 24 * 60 * 60 * 1000;
      const endTime = timerStartTime + durationDays * 24 * 60 * 60 * 1000;
      if (now >= endTime) {
        matureCount++;
      } else {
        pendingScheduledCount++;
      }
    }

    // تشغيل دورة التسوية الفورية للمشتركين الذين اكتملت فترتهم فعلياً
    const settlementResult = await this.settleAllMaturedProfits(investmentId);

    // تسجيل Audit Log
    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'PROFIT_DISTRIBUTION_CONFIRMED',
      newValue: {
        investmentId,
        profitPercentage,
        totalDistributedImmediately: settlementResult.totalProfitAmount,
        paidImmediatelyCount: settlementResult.settledCount,
        scheduledPendingCount: pendingScheduledCount,
        totalSubscribers: approvedRequests.length,
      },
      reason: `اعتماد نسبة ربح ${profitPercentage}%: تم الصرف فوراً لـ ${settlementResult.settledCount} مستثمر حققوا الفترة، والباقي (${pendingScheduledCount}) ستصلهم أرباحهم تباعاً عند حلول موعد استحقاقهم`,
      ipAddress,
    });

    return {
      success: true,
      message: `تم اعتماد وتأكيد نسبة الربح (${profitPercentage}%): تم الإيداع فوراً لـ ${settlementResult.settledCount} مستثمر مكتملي الفترة، وجدولة ${pendingScheduledCount} مستثمر للاستلام تباعاً بمجرد اكتمال فتراتهم الزمنية.`,
      totalDistributedProfit: settlementResult.totalProfitAmount,
      subscribersCount: approvedRequests.length,
      paidImmediatelyCount: settlementResult.settledCount,
      scheduledPendingCount: pendingScheduledCount,
      profitPercentage,
    };
  }

  // ✅ جلب الاشتراكات الخاصة بمستخدم محدد مع تفاصيل العداد والتوقيتات
  async getUserSubscriptions(userId: string) {
    // تشغيل فحص سريع لتسوية أي أرباح مستحقة فوراً لهذا المستخدم
    await this.settleUserMaturedProfits(userId);

    const requests = await this.requestRepository.find({
      where: {
        userId,
        status: RequestStatus.APPROVED,
      },
      order: { createdAt: 'DESC' },
    });

    const userCheckIns = await this.checkInRepository.find({
      where: { userId },
    });

    const now = new Date().getTime();

    const subscriptionsWithTimers = await Promise.all(
      requests.map(async (req) => {
        const investment = await this.investmentRepository.findOne({ where: { id: req.investmentId } });
        if (!investment) return null;

        const timeline = await this.calculateSubscriptionTimeline(req, investment, userCheckIns);
        const subCreatedTime = timeline.subCreatedTime;

        const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;
        const fourMonthUnlockDate = new Date(subCreatedTime + FOUR_MONTHS_MS);
        const canExitNow = now - subCreatedTime >= FOUR_MONTHS_MS;
        const daysUntilUnlock = Math.max(0, Math.ceil((subCreatedTime + FOUR_MONTHS_MS - now) / (1000 * 60 * 60 * 24)));

        return {
          id: req.id,
          investmentId: investment.id,
          type: investment.type,
          capital: investment.capital,
          fee: investment.fee,
          profit: investment.profit,
          numberOfShares: req.numberOfShares || 1,
          subscriptionDate: req.createdAt,
          timerStartTime: new Date(timeline.timerStartTime),
          endTime: new Date(timeline.endTime),
          adminApproved: investment.adminApproved,
          baseDurationDays: timeline.baseDurationDays,
          effectiveDurationDays: timeline.effectiveDurationDays,
          missedDays: timeline.missedDays,
          attendedDays: timeline.attendedDays,
          hasCheckedInToday: timeline.hasCheckedInToday,
          isDelayPeriod: timeline.isDelayPeriod,
          delayRemainingMs: timeline.delayRemainingMs,
          isTimerRunning: timeline.isTimerRunning,
          timerRemainingMs: timeline.timerRemainingMs,
          isReadyForProfit: timeline.isReadyForProfit,
          isExitRequested: req.isExitRequested || false,
          exitRequestedAt: req.exitRequestedAt,
          exitReason: req.exitReason,
          isCapitalRefunded: req.isCapitalRefunded || false,
          capitalRefundedAt: req.capitalRefundedAt,
          fourMonthUnlockDate,
          canExitNow,
          daysUntilUnlock,
        };
      })
    );

    return subscriptionsWithTimers.filter(Boolean);
  }

  // ✅ معالجة عمولات الإحالة المتعددة المراتب (4 مستويات) للصفقة الأولى فقط
  // مع تطبيق شرط: "إذا دعا أي شخص أكثر من شخص، يأخذ فقط على أول مستثمر يدعيه ويقبل"
  private async processReferralCommissions(
    queryRunner: any,
    investor: User,
    capitalAmount: Decimal,
  ) {
    const levels = [
      { level: 1, rate: new Decimal('0.000175'), percentStr: '0.0175%' },
      { level: 2, rate: new Decimal('0.0000875'), percentStr: '0.00875%' },
      { level: 3, rate: new Decimal('0.0000375'), percentStr: '0.00375%' },
      { level: 4, rate: new Decimal('0.000025'), percentStr: '0.0025% شهرياً' },
    ];

    let currentInviteeId = investor.id;
    let currentReferredBy = investor.referredBy;

    for (let i = 0; i < levels.length; i++) {
      if (!currentReferredBy) break;

      const inviter = await queryRunner.manager.findOne(User, {
        where: [
          { id: currentReferredBy },
          { referralCode: currentReferredBy },
        ],
      });

      if (!inviter) break;

      // شرط النظام: يحصل الداعي على العمولة فقط على أول مستثمر قام بدعوته ودخل صفقة بنجاح
      const isEligibleFirstReferral =
        !inviter.hasConvertedFirstReferral ||
        inviter.firstConvertedReferralId === currentInviteeId;

      if (!isEligibleFirstReferral) {
        // إذا كان الداعي قد استلم عمولة إحالة سابقة لمستثمر آخر، يتم إيقاف السلسلة لهذا الفرع
        break;
      }

      const rewardAmount = capitalAmount
        .times(levels[i].rate)
        .toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

      if (rewardAmount.greaterThan(0)) {
        const lockedInviter = await queryRunner.manager
          .createQueryBuilder(User, 'u')
          .setLock('pessimistic_write')
          .where('u.id = :id', { id: inviter.id })
          .getOne();

        if (lockedInviter) {
          lockedInviter.balance = new Decimal(lockedInviter.balance || 0)
            .plus(rewardAmount)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
            .toNumber();

          lockedInviter.hasConvertedFirstReferral = true;
          if (!lockedInviter.firstConvertedReferralId) {
            lockedInviter.firstConvertedReferralId = currentInviteeId;
          }

          await queryRunner.manager.save(User, lockedInviter);

          const methodDesc = levels[i].level === 4
            ? `عمولة إحالة المستوى 4 (0.0025% شهرياً بشكل ثابت)`
            : `عمولة إحالة المستوى ${levels[i].level} (${levels[i].percentStr})`;

          const refTx = queryRunner.manager.create(Transaction, {
            userId: lockedInviter.id,
            type: TransactionType.REFERRAL,
            amount: rewardAmount.toNumber(),
            status: TransactionStatus.COMPLETED,
            method: methodDesc,
            adminNotes: `تم إيداع عمولة إحالة المستوى ${levels[i].level} بنسبة ${levels[i].percentStr} من أول صفقة للمستثمر ${investor.email} (قيمة رأس المال $${capitalAmount.toFixed(2)})`,
          });

          await queryRunner.manager.save(Transaction, refTx);
        }
      }

      currentInviteeId = inviter.id;
      currentReferredBy = inviter.referredBy;
    }
  }
}
