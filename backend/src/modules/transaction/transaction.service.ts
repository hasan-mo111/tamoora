// backend/src/modules/transaction/transaction.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { Transaction, TransactionType, TransactionStatus, NetworkType } from './transaction.entity';
import { User } from '../user/user.entity';
import { InvestmentRequest, RequestStatus } from '../investment-request/investment-request.entity';
import { BlockchainService } from './blockchain.service';
import { OxpayService } from './oxpay.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InvestmentRequest)
    private requestRepository: Repository<InvestmentRequest>,
    private blockchainService: BlockchainService,
    private oxpayService: OxpayService,
    private auditLogService: AuditLogService,
    private dataSource: DataSource,
  ) {}

  // ✅ إنشاء طلب إيداع يدوي (بلوكشين مباشر)
  async createDeposit(userId: string, amount: number, network: NetworkType = NetworkType.TRC20) {
    if (amount < 1) throw new BadRequestException('الحد الأدنى للإيداع هو $1');

    const depositAmount = new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    // التحقق من وجود معاملة PENDING بنفس المبلغ والشبكة
    const existingPending = await this.transactionRepository.findOne({
      where: {
        userId,
        amount: depositAmount,
        network,
        status: TransactionStatus.PENDING,
      },
    });

    if (existingPending) {
      return {
        transaction: existingPending,
        depositAddress: this.blockchainService.getDepositAddress(network),
        network,
      };
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ساعة

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: depositAmount,
      network,
      method: `USDT (${network})`,
      status: TransactionStatus.PENDING,
      expiresAt,
    });

    const savedTx = await this.transactionRepository.save(transaction);

    return {
      transaction: savedTx,
      depositAddress: this.blockchainService.getDepositAddress(network),
      network,
    };
  }

  // ✅ إنشاء طلب إيداع كاش (نقدي)
  async createCashDeposit(userId: string, amount: number, notes?: string) {
    if (amount < 1) throw new BadRequestException('الحد الأدنى للإيداع هو $1');

    const depositAmount = new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: depositAmount,
      method: 'كاش (نقدي)',
      network: undefined,
      status: TransactionStatus.PENDING,
      adminNotes: notes ? `طلب إيداع كاش: ${notes}` : 'طلب إيداع نقدي (كاش)',
    });

    const savedTx = await this.transactionRepository.save(transaction);

    return {
      success: true,
      message: 'تم إرسال طلب الإيداع النقدي للأدمن بنجاح. سيتم إضافة الرصيد إلى حسابك عند الموافقة.',
      transaction: savedTx,
    };
  }

  // ✅ التحقق من المعاملة عبر TxHash مع سد ثغرة الإيداع المزدوج والقفل المتشائم (Pessimistic Lock)
  async verifyDeposit(transactionId: string, txHash: string, userId: string, reqInfo?: { ip?: string }) {
    if (!txHash || !txHash.trim()) {
      throw new BadRequestException('رمز المعاملة TxHash مطلوب للتحقق');
    }

    const cleanTxHash = txHash.trim();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. قفل صف المعاملة المتشائم (FOR UPDATE)
      const transaction = await queryRunner.manager
        .createQueryBuilder(Transaction, 'tx')
        .setLock('pessimistic_write')
        .where('tx.id = :transactionId AND tx.userId = :userId AND tx.type = :type', {
          transactionId,
          userId,
          type: TransactionType.DEPOSIT,
        })
        .getOne();

      if (!transaction) {
        throw new NotFoundException('المعاملة غير موجودة أو لا تخص هذا المستخدم');
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('هذه المعاملة تمت معالجتها أو اعتمادها مسبقاً');
      }

      if (transaction.expiresAt && new Date() > transaction.expiresAt) {
        transaction.status = TransactionStatus.EXPIRED;
        await queryRunner.manager.save(transaction);
        await queryRunner.commitTransaction();
        throw new BadRequestException('انتهت صلاحية هذه المعاملة');
      }

      // 2. سد ثغرة الإيداع المزدوج: فحص أن TxHash غير مستخدم في أي معاملة في النظام لأي مستخدم وبأي حالة
      const existingTxWithHash = await queryRunner.manager
        .createQueryBuilder(Transaction, 'tx')
        .where('tx.txHash = :cleanTxHash', { cleanTxHash })
        .getOne();

      if (existingTxWithHash && existingTxWithHash.id !== transaction.id) {
        // تسجيل اختراق أمني في AuditLog
        await this.auditLogService.log({
          action: 'SECURITY_ALERT_TXHASH_REUSE_ATTEMPT',
          targetUserId: userId,
          oldValue: { attemptedTxHash: cleanTxHash, transactionId },
          newValue: { existingTransactionId: existingTxWithHash.id, existingUserId: existingTxWithHash.userId },
          reason: `محاولة إعادة استخدام رمز معاملة مسجل مسبقاً في النظام (TxHash: ${cleanTxHash})`,
          ipAddress: reqInfo?.ip,
        });

        throw new BadRequestException(
          'رمز المعاملة (TxHash) تم استخدامه واعتماده مسبقاً في النظام. لا يمكن استخدام المعاملة ذاتها لأكثر من عملية إيداع.',
        );
      }

      // 3. التحقق من المعاملة عبر البلوكشين
      const txDetails = await this.blockchainService.verifyTransaction(
        transaction.network || NetworkType.TRC20,
        cleanTxHash,
        Number(transaction.amount),
      );

      // 4. قفل صف المستخدم وتحديث الرصيد بدقة Decimal
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'u')
        .setLock('pessimistic_write')
        .where('u.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new NotFoundException('المستخدم غير موجود');
      }

      const oldBalance = Number(user.balance || 0);
      const newBalance = new Decimal(user.balance || 0)
        .plus(transaction.amount)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber();

      user.balance = newBalance;
      await queryRunner.manager.save(user);

      // 5. حفظ بيانات المعاملة
      transaction.txHash = cleanTxHash;
      transaction.fromAddress = txDetails.from;
      transaction.toAddress = txDetails.to;
      transaction.status = TransactionStatus.COMPLETED;
      const savedTx = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      // تسجيل العملية في Audit Log
      await this.auditLogService.log({
        action: 'DEPOSIT_VERIFIED',
        targetUserId: user.id,
        targetUserEmail: user.email,
        oldValue: { balance: oldBalance },
        newValue: { balance: newBalance, txHash: cleanTxHash, amount: transaction.amount },
        reason: `اعتماد إيداع تلقائي عبر TxHash (${transaction.network})`,
        ipAddress: reqInfo?.ip,
      });

      return {
        success: true,
        message: 'تم اعتماد الإيداع وإضافة الرصيد بنجاح',
        transaction: savedTx,
        userBalance: newBalance,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ جلب تفاصيل الأهلية للسحب (حد 80% أرباح صافية وإمكانية سحب رأس المال والأرباح كاملاً بعد 4 أشهر)
  async getWithdrawalEligibility(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // إجمالي الأرباح المستلمة (الصفقات + العمولات)
    const profitTxs = await this.transactionRepository.find({
      where: [
        { userId, type: TransactionType.PROFIT, status: TransactionStatus.COMPLETED },
        { userId, type: TransactionType.REFERRAL, status: TransactionStatus.COMPLETED },
      ],
    });
    const totalProfitEarned = profitTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const netProfit80Percent = Math.floor(totalProfitEarned * 0.8 * 100) / 100;

    // إجمالي المبالغ المسحوبة (سواء مكتملة أو قيد الانتظار)
    const withdrawTxs = await this.transactionRepository.find({
      where: [
        { userId, type: TransactionType.WITHDRAW, status: TransactionStatus.COMPLETED },
        { userId, type: TransactionType.WITHDRAW, status: TransactionStatus.PENDING },
      ],
    });
    const totalWithdrawn = withdrawTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    // المتبقي المتاح للسحب من الأرباح الصافية (80%)
    const netProfitWithdrawableRemaining = Math.max(0, Math.floor((netProfit80Percent - totalWithdrawn) * 100) / 100);

    // التحقق من وجود اشتراكات انقضى عليها 4 أشهر (120 يوماً)
    const approvedRequests = await this.requestRepository.find({
      where: { userId, status: RequestStatus.APPROVED },
    });

    const now = new Date().getTime();
    const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;
    const hasMaturedSubscription = approvedRequests.some(
      (req) => now - new Date(req.createdAt).getTime() >= FOUR_MONTHS_MS,
    );

    const balance = Number(user.balance || 0);
    let maxWithdrawable = 0;

    if (hasMaturedSubscription) {
      // بعد مضي 4 أشهر يحق له سحب رأس المال والأرباح كاملة (100%)
      maxWithdrawable = balance;
    } else {
      // أثناء فترة الاستثمار، يحق له سحب حتى 80% من قيمة الأرباح الصافية
      maxWithdrawable = Math.min(balance, netProfitWithdrawableRemaining);
    }

    return {
      balance,
      totalProfitEarned,
      netProfit80Percent,
      totalWithdrawn,
      netProfitWithdrawableRemaining,
      hasMaturedSubscription,
      maxWithdrawable,
    };
  }

  // ✅ طلب سحب مع دعم الشبكات الـ 3 (TRC20, ERC20, BEP20) وحماية تامة ضد التزامن (Race Conditions)
  async createWithdraw(
    userId: string,
    amount: number,
    walletAddress: string,
    network: NetworkType = NetworkType.TRC20,
    method: string = 'OXPAY (USDT)',
  ) {
    if (amount <= 0) {
      throw new BadRequestException('مبلغ السحب يجب أن يكون أكبر من 0');
    }

    // 1. التحقق من الشبكة
    const validNetworks = [NetworkType.TRC20, NetworkType.ERC20, NetworkType.BEP20];
    if (!validNetworks.includes(network)) {
      throw new BadRequestException('الشبكة المحددة غير مدعومة. يرجى اختيار TRC20 أو ERC20 أو BEP20.');
    }

    // 2. التحقق الدقيق من تنسيق العنوان بحسب الشبكة
    const cleanAddress = (walletAddress || '').trim();
    if (!cleanAddress) {
      throw new BadRequestException('عنوان المحفظة مطلوب');
    }

    if (network === NetworkType.TRC20) {
      const trc20Regex = /^T[1-9A-HJ-NP-za-km-z]{33}$/;
      if (!trc20Regex.test(cleanAddress)) {
        throw new BadRequestException('عنوان محفظة TRC20 غير صالح (يجب أن يبدأ بحرف T ويتكون من 34 خانة)');
      }
    } else if (network === NetworkType.ERC20 || network === NetworkType.BEP20) {
      const ethRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethRegex.test(cleanAddress)) {
        throw new BadRequestException(`عنوان محفظة ${network} غير صالح (يجب أن يبدأ بـ 0x ويتكون من 42 خانة ست عشرية)`);
      }
    }

    const withdrawAmount = new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    const eligibility = await this.getWithdrawalEligibility(userId);

    if (withdrawAmount > eligibility.maxWithdrawable) {
      if (eligibility.hasMaturedSubscription) {
        throw new BadRequestException(`مبلغ السحب المكتوب ($${withdrawAmount}) يتجاوز رصيدك الحالي ($${eligibility.balance}).`);
      } else if (eligibility.totalProfitEarned === 0) {
        throw new BadRequestException(
          'وفقاً لشروط المنصة، يحق للمشترك سحب حتى 80% من صافي الأرباح المحققة أثناء فترة الاشتراك. ليس لديك أرباح صافية متاحة للسحب حالياً (أو يمكنك سحب رأس المال والأرباح كاملة بعد انقضاء 4 أشهر على تاريخ الاشتراك).',
        );
      } else {
        throw new BadRequestException(
          `وفقاً لشروط المنصة، يحق لك سحب 80% من صافي الأرباح كحد أقصى أثناء فترة الاستثمار. الحد الأقصى المتاح لك للسحب حالياً هو $${eligibility.maxWithdrawable.toFixed(2)}.`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // قفل السطر الخاص بالمستخدم في قاعدة البيانات (SELECT FOR UPDATE)
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'u')
        .setLock('pessimistic_write')
        .where('u.id = :userId', { userId })
        .getOne();

      if (!user) throw new NotFoundException('المستخدم غير موجود');

      const currentBalance = new Decimal(user.balance || 0);

      if (currentBalance.lessThan(withdrawAmount)) {
        throw new BadRequestException('رصيدك غير كافٍ لإتمام عملية السحب');
      }

      // خصم الرصيد فوراً وحجزه لطلب السحب لمنع أي سحب مزدوج بالتزامن
      const newBalance = currentBalance.minus(withdrawAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
      user.balance = newBalance;
      await queryRunner.manager.save(user);

      // إنشاء المعاملة وحفظها
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.WITHDRAW,
        amount: withdrawAmount,
        method: method || 'OXPAY (USDT)',
        toAddress: cleanAddress,
        network: network || NetworkType.TRC20,
        status: TransactionStatus.PENDING,
        adminNotes: `طلب سحب عبر ${method || 'OXPAY'} (${network}) إلى المحفظة: ${cleanAddress}`,
      });

      const savedTx = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ موافقة الأدمن على السحب والتنفيذ الآلي عبر OxaPay وتسجيل Audit Log
  async approveWithdraw(
    transactionId: string,
    adminNotes: string = '',
    adminUser?: { id: string; email: string },
    ipAddress?: string,
    apiKey?: string,
  ) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction || transaction.type !== TransactionType.WITHDRAW) {
      throw new NotFoundException('طلب السحب غير موجود');
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('تمت معالجة هذا الطلب مسبقاً');
    }

    const user = await this.userRepository.findOne({ where: { id: transaction.userId } });

    const targetAddress = transaction.toAddress || transaction.method;
    const targetNetwork = transaction.network || NetworkType.TRC20;

    // تنفيذ السحب التلقائي عبر بوابة OxaPay على الشبكة المحددة (TRC20 / ERC20 / BEP20)
    const payoutResult = await this.oxpayService.createPayout({
      address: targetAddress,
      amount: Number(transaction.amount),
      currency: 'USDT',
      network: targetNetwork,
      description: `سحب طامورة #${transaction.id} (${targetNetwork})`,
      apiKey,
    });

    transaction.status = TransactionStatus.COMPLETED;
    transaction.txHash = payoutResult.txHash || `OXPAY_OUT_${Date.now()}`;
    transaction.trackId = payoutResult.trackId;
    transaction.adminNotes = adminNotes || `تم تنفيذ السحب بنجاح عبر OxaPay (${targetNetwork}) - TxHash: ${transaction.txHash}`;
    const savedTx = await this.transactionRepository.save(transaction);

    // تسجيل التدقيق
    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'APPROVE_WITHDRAW_OXAPAY',
      targetUserId: user?.id,
      targetUserEmail: user?.email,
      oldValue: { status: TransactionStatus.PENDING },
      newValue: { status: TransactionStatus.COMPLETED, amount: transaction.amount, network: targetNetwork, txHash: transaction.txHash },
      reason: transaction.adminNotes,
      ipAddress,
    });

    return savedTx;
  }

  // ✅ رفض الأدمن للسحب مع إرجاع المبلغ المحجوز للرصيد ذرياً
  async rejectWithdraw(
    transactionId: string,
    adminNotes: string = '',
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, { where: { id: transactionId } });
      if (!transaction || transaction.type !== TransactionType.WITHDRAW) {
        throw new NotFoundException('طلب السحب غير موجود');
      }
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('تمت معالجة هذا الطلب مسبقاً');
      }

      // إعادة المبلغ المحجوز لرصيد المستخدم بـ Pessimistic Lock و Decimal
      const user = await queryRunner.manager
        .createQueryBuilder(User, 'u')
        .setLock('pessimistic_write')
        .where('u.id = :userId', { userId: transaction.userId })
        .getOne();

      if (user) {
        const oldBalance = user.balance;
        const restoredBalance = new Decimal(user.balance || 0).plus(transaction.amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
        user.balance = restoredBalance;
        await queryRunner.manager.save(user);

        // تسجيل العملية في Audit Log
        await this.auditLogService.log({
          adminId: adminUser?.id,
          adminEmail: adminUser?.email,
          action: 'REJECT_WITHDRAW',
          targetUserId: user.id,
          targetUserEmail: user.email,
          oldValue: { status: TransactionStatus.PENDING, balance: oldBalance },
          newValue: { status: TransactionStatus.REJECTED, balance: restoredBalance },
          reason: adminNotes || 'تم رفض طلب السحب وإعادة الرصيد للحساب',
          ipAddress,
        });
      }

      transaction.status = TransactionStatus.REJECTED;
      transaction.adminNotes = adminNotes || 'تم رفض طلب السحب';
      const savedTx = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ موافقة الأدمن على طلب الإيداع (كاش أو كريبتو) وإضافة المبلغ للرصيد ذرياً
  async approveDeposit(
    transactionId: string,
    adminNotes: string = '',
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId, type: TransactionType.DEPOSIT },
      });

      if (!transaction) throw new NotFoundException('طلب الإيداع غير موجود');
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('تمت معالجة هذا الطلب مسبقاً');
      }

      const user = await queryRunner.manager
        .createQueryBuilder(User, 'u')
        .setLock('pessimistic_write')
        .where('u.id = :userId', { userId: transaction.userId })
        .getOne();

      if (!user) throw new NotFoundException('المستخدم غير موجود');

      const oldBalance = user.balance;
      const newBalance = new Decimal(user.balance || 0).plus(transaction.amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

      user.balance = newBalance;
      await queryRunner.manager.save(user);

      transaction.status = TransactionStatus.COMPLETED;
      if (adminNotes) transaction.adminNotes = adminNotes;
      const savedTx = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      await this.auditLogService.log({
        adminId: adminUser?.id,
        adminEmail: adminUser?.email,
        action: 'APPROVE_DEPOSIT',
        targetUserId: user.id,
        targetUserEmail: user.email,
        oldValue: { status: TransactionStatus.PENDING, balance: oldBalance },
        newValue: { status: TransactionStatus.COMPLETED, balance: newBalance, amount: transaction.amount },
        reason: adminNotes || 'موافقة الأدمن على طلب الإيداع وأودعت الأموال في الرصيد',
        ipAddress,
      });

      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ إلغاء طلب الإيداع من قبل المستخدم أو النظام وتعيين حالته كمرفوض
  async cancelDeposit(transactionId: string, userId?: string, reason: string = 'تم إلغاء الفاتورة من قبل المستخدم') {
    const whereClause: any = { id: transactionId, type: TransactionType.DEPOSIT };
    if (userId) {
      whereClause.userId = userId;
    }

    const transaction = await this.transactionRepository.findOne({ where: whereClause });
    if (!transaction) {
      throw new NotFoundException('طلب الإيداع غير موجود');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن إلغاء معاملة مكتملة بالفعل');
    }

    transaction.status = TransactionStatus.REJECTED;
    transaction.adminNotes = reason;
    const savedTx = await this.transactionRepository.save(transaction);

    return {
      success: true,
      message: 'تم إلغاء المعاملة وتحديث حالتها إلى مرفوض بنجاح',
      transaction: savedTx,
    };
  }

  // ✅ رفض الأدمن لطلب الإيداع
  async rejectDeposit(
    transactionId: string,
    adminNotes: string = '',
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, type: TransactionType.DEPOSIT },
    });

    if (!transaction) throw new NotFoundException('طلب الإيداع غير موجود');
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('تمت معالجة هذا الطلب مسبقاً');
    }

    transaction.status = TransactionStatus.REJECTED;
    if (adminNotes) transaction.adminNotes = adminNotes;
    const savedTx = await this.transactionRepository.save(transaction);

    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'REJECT_DEPOSIT',
      targetUserId: transaction.userId,
      oldValue: { status: TransactionStatus.PENDING },
      newValue: { status: TransactionStatus.REJECTED },
      reason: adminNotes || 'تم رفض طلب الإيداع',
      ipAddress,
    });

    return savedTx;
  }

  // ✅ إنشاء إيداع عبر بوابة OxaPay الإلكترونية مع ربط فريد
  async createOxpayDeposit(userId: string, amount: number, network: NetworkType = NetworkType.TRC20, currency: string = 'USDT') {
    if (amount < 1) throw new BadRequestException('الحد الأدنى للإيداع هو $1');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const depositAmount = new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ساعة

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: depositAmount,
      method: `OXPAY (USDT)`,
      network: network || NetworkType.TRC20,
      status: TransactionStatus.PENDING,
      adminNotes: `بوابة دفع OxaPay (${currency} - ${network})`,
      expiresAt,
    });

    const savedTx = await this.transactionRepository.save(transaction);

    // معرف فريد للطلب يربط المعاملة
    const uniqueOrderId = `${savedTx.id}_${Math.random().toString(36).substring(2, 7)}`;

    // إنشاء فاتورة الدفع في OxaPay
    const invoice = await this.oxpayService.createInvoice({
      orderId: uniqueOrderId,
      amount: depositAmount,
      currency,
      network: network || 'TRC20',
      description: `إيداع محفظة طامورة (${network}) - المستخدم #${userId.substring(0, 6)}`,
      customerEmail: user.email,
    });

    // تحديث بيانات الفاتورة في المعاملة
    savedTx.invoiceId = invoice.invoiceId;
    savedTx.trackId = invoice.trackId;
    savedTx.adminNotes = `OxaPay Invoice: ${invoice.invoiceId} | TrackId: ${invoice.trackId || 'N/A'} | Network: ${network}`;
    await this.transactionRepository.save(savedTx);

    return {
      success: true,
      transaction: savedTx,
      invoice: {
        ...invoice,
        orderId: savedTx.id, // Return original transaction id for client status checks
      },
    };
  }

  // ✅ معالجة الـ Webhook الوارد من OxaPay مع التحقق من التوقيع ومنع التكرار (Idempotency)
  async handleOxpayWebhook(body: any, signature?: string, ipAddress?: string) {
    const isValid = this.oxpayService.verifyWebhook(body, signature);
    if (!isValid) {
      await this.auditLogService.log({
        action: 'SECURITY_ALERT_INVALID_WEBHOOK_SIGNATURE',
        reason: 'محاولة إرسال Webhook بتوقيع غير صالح إلى بوابة OxaPay',
        oldValue: { signature },
        newValue: { body },
        ipAddress,
      });
      throw new BadRequestException('Invalid webhook signature');
    }

    const rawOrderId = body.merchant_order_id || body.orderId || body.order_id || '';
    const cleanOrderId = rawOrderId.includes('_') ? rawOrderId.split('_')[0] : rawOrderId;
    const invoiceId = body.invoice_id || body.invoiceId || body.trackId || body.track_id;
    const status = (body.status || '').toUpperCase();
    const paidAmount = Number(body.amount || body.paid_amount || 0);

    if (!cleanOrderId && !invoiceId) {
      throw new BadRequestException('Missing order identifier in webhook');
    }

    let transaction: Transaction | null = null;
    if (cleanOrderId) {
      transaction = await this.transactionRepository.findOne({ where: { id: cleanOrderId } });
    }
    if (!transaction && invoiceId) {
      transaction = await this.transactionRepository.findOne({
        where: [{ invoiceId: String(invoiceId) }, { trackId: String(invoiceId) }],
      });
    }

    if (!transaction) {
      this.logger.warn(`Transaction matching OxaPay order ${cleanOrderId} / ${invoiceId} not found`);
      return { success: true, message: 'Transaction not found or already archived' };
    }

    // تحقق من أن المعاملة مكتملة بالفعل (Idempotency)
    if (transaction.status === TransactionStatus.COMPLETED) {
      return { success: true, message: 'Transaction already completed (Idempotent)' };
    }

    if (status === 'PAID' || status === 'COMPLETED' || status === 'SUCCESS') {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const txToUpdate = await queryRunner.manager
          .createQueryBuilder(Transaction, 'tx')
          .setLock('pessimistic_write')
          .where('tx.id = :txId', { txId: transaction.id })
          .getOne();

        if (!txToUpdate || txToUpdate.status === TransactionStatus.COMPLETED) {
          await queryRunner.rollbackTransaction();
          return { success: true, message: 'Transaction already finalized' };
        }

        const user = await queryRunner.manager
          .createQueryBuilder(User, 'u')
          .setLock('pessimistic_write')
          .where('u.id = :userId', { userId: txToUpdate.userId })
          .getOne();

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const finalAmount = paidAmount > 0 ? paidAmount : txToUpdate.amount;
        const currentBalance = new Decimal(user.balance || 0);
        const addedAmount = new Decimal(finalAmount);
        const newBalance = currentBalance.plus(addedAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
        user.balance = newBalance;

        txToUpdate.status = TransactionStatus.COMPLETED;
        txToUpdate.txHash = body.tx_hash || body.txHash || body.transaction_hash || `OXAPAY_${invoiceId || txToUpdate.id}`;
        txToUpdate.adminNotes = `OxaPay Payment Confirmed: ${finalAmount} USDT (${txToUpdate.network || 'TRC20'}) | TrackId: ${invoiceId || 'N/A'}`;

        await queryRunner.manager.save(user);
        await queryRunner.manager.save(txToUpdate);

        await queryRunner.commitTransaction();

        await this.auditLogService.log({
          action: 'OXAPAY_DEPOSIT_COMPLETED',
          targetUserId: user.id,
          targetUserEmail: user.email,
          oldValue: { status: TransactionStatus.PENDING, balance: currentBalance.toNumber() },
          newValue: { status: TransactionStatus.COMPLETED, balance: newBalance, amount: finalAmount },
          reason: `OxaPay Webhook Auto-Approval - TrackId: ${invoiceId}`,
          ipAddress,
        });

        return { success: true, message: 'Deposit completed successfully via OxaPay' };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } else if (status === 'EXPIRED' || status === 'FAILED' || status === 'CANCELLED') {
      transaction.status = TransactionStatus.REJECTED;
      transaction.adminNotes = `OxaPay Status: ${status}`;
      await this.transactionRepository.save(transaction);
      return { success: true, message: `Transaction marked as ${status}` };
    }

    return { success: true, message: 'Webhook received' };
  }

  // ✅ فحص حالة المعاملة عبر OxaPay
  async checkOxpayStatus(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) throw new NotFoundException('المعاملة غير موجودة');

    // إذا كانت معلقة ولها trackId أو invoiceId، يمكن الاستعلام مباشرة من OxaPay
    if (transaction.status === TransactionStatus.PENDING && (transaction.trackId || transaction.invoiceId)) {
      const inquiry = await this.oxpayService.checkInvoiceStatus(transaction.trackId || transaction.invoiceId);
      if (inquiry.status === 'PAID' || inquiry.status === 'COMPLETED' || inquiry.status === 'SUCCESS') {
        await this.handleOxpayWebhook({
          merchant_order_id: transaction.id,
          invoice_id: transaction.invoiceId,
          track_id: transaction.trackId,
          status: 'PAID',
          amount: inquiry.paidAmount || transaction.amount,
          tx_hash: inquiry.txHash,
        });

        const refreshed = await this.transactionRepository.findOne({ where: { id: transactionId } });
        return {
          status: refreshed?.status || TransactionStatus.COMPLETED,
          amount: refreshed?.amount,
          method: refreshed?.method,
          network: refreshed?.network,
          createdAt: refreshed?.createdAt,
          expiresAt: refreshed?.expiresAt,
        };
      }
    }

    return {
      status: transaction.status,
      amount: transaction.amount,
      method: transaction.method,
      network: transaction.network,
      createdAt: transaction.createdAt,
      expiresAt: transaction.expiresAt,
    };
  }

  async getUserTransactions(userId: string) {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTransactions(status?: TransactionStatus) {
    const query = this.transactionRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.user', 'u')
      .orderBy('t.createdAt', 'DESC');

    if (status) {
      query.where('t.status = :status', { status });
    }
    return query.getMany();
  }
}

