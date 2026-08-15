import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { User, UserRole, UserStatus, VerificationStatus, IdDocumentStatus } from './user.entity';
import { DailyCheckIn } from './daily-checkin.entity';
import { Investment, InvestmentStatus } from '../investment/investment.entity';
import { InvestmentRequest, RequestStatus } from '../investment-request/investment-request.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transaction/transaction.entity';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DailyCheckIn)
    private checkInRepository: Repository<DailyCheckIn>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(InvestmentRequest)
    private requestRepository: Repository<InvestmentRequest>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
  ) {}

  // ============================================
  // Methods الموجودة — بدون تغيير
  // ============================================

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        verificationStatus: true,
        idDocumentFront: true,
        idDocumentBack: true,
        idDocumentStatus: true,
        idDocumentRejectReason: true,
        contractSigned: true,
        contractSignature: true,
        contractSignedAt: true,
        contractVersion: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        verificationStatus: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.findOne(id);
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async createAdmin(email: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '0000000000',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.FULLY_VERIFIED,
      balance: 0,
      isPinVerified: true,
    });

    return await this.userRepository.save(admin);
  }

  // ============================================
  // ✅ Methods جديدة — التحقق من البريد الإلكتروني
  // ============================================

async sendEmailVerificationCode(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.emailVerified) {
      throw new BadRequestException('البريد الإلكتروني موثّق مسبقاً');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresMinutes = 10;
    const expires = new Date(Date.now() + expiresMinutes * 60 * 1000);

    user.emailVerificationCode = code;
    user.emailVerificationExpires = expires;
    await this.userRepository.save(user);

    const sent = await this.emailService.sendOtpEmail(user.email, code, expiresMinutes);
    
    if (sent) {
      return {
        message: `تم إرسال رمز التحقق إلى ${user.email} بنجاح.`,
      };
    } else {
      // ✅ الآن this.logger سيعمل بشكل صحيح بدون أخطاء
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.warn(`📧 [DEMO MODE] OTP for ${user.email}: ${code}`);
      this.logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return {
        message: 'تم إنشاء رمز التحقق. راجع console السيرفر في وضع التطوير.',
      };
    }
  }
  async verifyEmailCode(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.emailVerified) {
      throw new BadRequestException('البريد الإلكتروني موثّق مسبقاً');
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      throw new BadRequestException('يرجى طلب رمز تحقق جديد');
    }

    if (new Date() > user.emailVerificationExpires) {
      user.emailVerificationCode = null;
      user.emailVerificationExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException('انتهت صلاحية الرمز. اطلب رمزاً جديداً.');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('رمز التحقق غير صحيح');
    }

    // ✅ تفعيل البريد
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;

    // تحديث حالة التحقق
    if (user.verificationStatus === VerificationStatus.UNVERIFIED) {
      user.verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    }

    await this.userRepository.save(user);

    return { message: 'تم التحقق من البريد الإلكتروني بنجاح' };
  }

  // ============================================
  // ✅ Methods جديدة — التحقق من الهوية (KYC)
  // ============================================

  async uploadIdDocument(
    userId: string,
    frontPath: string,
    backPath: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.idDocumentStatus === IdDocumentStatus.PENDING) {
      throw new BadRequestException('لديك طلب مراجعة قيد الانتظار');
    }

    user.idDocumentFront = frontPath;
    user.idDocumentBack = backPath;
    user.idDocumentStatus = IdDocumentStatus.PENDING;
    user.idDocumentRejectReason = null;

    await this.userRepository.save(user);

    return { message: 'تم رفع الوثائق بنجاح. بانتظار مراجعة الإدارة.' };
  }

  async getIdDocumentStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return {
      status: user.idDocumentStatus,
      front: user.idDocumentFront,
      back: user.idDocumentBack,
      rejectReason: user.idDocumentRejectReason,
    };
  }

  // ✅ للأدمن: الموافقة على وثيقة الهوية
  async approveIdDocument(
    userId: string,
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const oldStatus = user.idDocumentStatus;
    user.idDocumentStatus = IdDocumentStatus.APPROVED;
    user.idDocumentRejectReason = null;

    // تحديث حالة التحقق الشاملة
    if (user.emailVerified) {
      user.verificationStatus = VerificationStatus.IDENTITY_VERIFIED;
    }

    await this.userRepository.save(user);

    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'APPROVE_IDENTITY',
      targetUserId: user.id,
      targetUserEmail: user.email,
      oldValue: { idDocumentStatus: oldStatus },
      newValue: { idDocumentStatus: IdDocumentStatus.APPROVED },
      ipAddress,
    });

    return { message: 'تمت الموافقة على وثيقة الهوية' };
  }

  // ✅ للأدمن: رفض وثيقة الهوية
  async rejectIdDocument(
    userId: string,
    reason: string,
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const oldStatus = user.idDocumentStatus;
    user.idDocumentStatus = IdDocumentStatus.REJECTED;
    user.idDocumentRejectReason = reason;

    await this.userRepository.save(user);

    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'REJECT_IDENTITY',
      targetUserId: user.id,
      targetUserEmail: user.email,
      oldValue: { idDocumentStatus: oldStatus },
      newValue: { idDocumentStatus: IdDocumentStatus.REJECTED, reason },
      reason,
      ipAddress,
    });

    return { message: 'تم رفض وثيقة الهوية' };
  }

  // ✅ للأدمن: تعديل رصيد المستخدم يدوياً بدقة عالية مع التدقيق
  async updateUserBalance(
    userId: string,
    newBalanceAmount: number,
    reason: string,
    adminUser?: { id: string; email: string },
    ipAddress?: string,
  ): Promise<{ message: string; balance: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const oldBalance = user.balance;
    const cleanBalance = new Decimal(newBalanceAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    user.balance = cleanBalance;
    await this.userRepository.save(user);

    await this.auditLogService.log({
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      action: 'MANUAL_BALANCE_UPDATE',
      targetUserId: user.id,
      targetUserEmail: user.email,
      oldValue: { balance: oldBalance },
      newValue: { balance: cleanBalance },
      reason,
      ipAddress,
    });

    return { message: 'تم تحديث رصيد المستخدم بنجاح', balance: cleanBalance };
  }

  // ============================================
  // ✅ Methods جديدة — التوقيع الإلكتروني
  // ============================================

  async signContract(
    userId: string,
    signatureBase64: string,
    contractVersion: string = 'v1.0',
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.contractSigned) {
      throw new BadRequestException('تم توقيع العقد مسبقاً');
    }

    // التحقق من أن البريد موثّق على الأقل
    if (!user.emailVerified) {
      throw new BadRequestException('يجب التحقق من البريد الإلكتروني قبل توقيع العقد');
    }

    user.contractSigned = true;
    user.contractSignature = signatureBase64;
    user.contractSignedAt = new Date();
    user.contractVersion = contractVersion;

    // إذا البريد موثّق + الهوية موثّقة + العقد موقّع = FULLY_VERIFIED
    if (
      user.emailVerified &&
      user.idDocumentStatus === IdDocumentStatus.APPROVED
    ) {
      user.verificationStatus = VerificationStatus.FULLY_VERIFIED;
    }

    await this.userRepository.save(user);

    return { message: 'تم توقيع العقد بنجاح' };
  }

  async getContractStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return {
      signed: user.contractSigned,
      signedAt: user.contractSignedAt,
      version: user.contractVersion,
      signature: user.contractSignature,
    };
  }

  // ============================================
  // ✅ Method جديدة — حالة التحقق الشاملة
  // ============================================

  async getVerificationStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return {
      emailVerified: user.emailVerified,
      idDocumentStatus: user.idDocumentStatus,
      contractSigned: user.contractSigned,
      overallStatus: user.verificationStatus,
    };
  }

  // ============================================
  // ✅ Method جديدة — حذف مستخدم بالكامل
  // ============================================

  async remove(id: string, currentAdminId?: string): Promise<{ message: string }> {
    if (currentAdminId && id === currentAdminId) {
      throw new BadRequestException('لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // حذف سجلات المعاملات وطلبات الاستثمار التابعة للمستخدم أولاً لتفادي مشاكل المفاتيح الأجنبية
    await this.userRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete('transactions', { userId: id });
      await transactionalEntityManager.delete('investment_requests', { userId: id });
      await transactionalEntityManager.delete(User, { id });
    });

    return { message: 'تم حذف المستخدم وجميع البيانات المرتبطة به بنجاح' };
  }

  // ============================================
  // ✅ Method جديدة — إحصائيات لوحة التحكم الإدارية
  // ============================================

  async getAdminStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: [{ status: UserStatus.ACTIVE }, { emailVerified: true }],
    });

    const activePlans = await this.investmentRepository.count({
      where: { status: InvestmentStatus.ACTIVE },
    });

    // السحوبات المعلقة
    const pendingWithdrawalTxs = await this.transactionRepository.find({
      where: { type: TransactionType.WITHDRAW, status: TransactionStatus.PENDING },
    });
    const pendingWithdrawals = pendingWithdrawalTxs.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    // إجمالي المبالغ المستثمرة والإيداعات المكتملة
    const completedDeposits = await this.transactionRepository.find({
      where: { type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED },
    });
    let totalInvested = completedDeposits.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    const approvedRequests = await this.requestRepository.find({
      where: { status: RequestStatus.APPROVED },
    });

    if (totalInvested === 0 && approvedRequests.length > 0) {
      totalInvested = approvedRequests.length * 500;
    }

    // الأرباح الموزعة
    const profitTxs = await this.transactionRepository.find({
      where: { type: TransactionType.PROFIT, status: TransactionStatus.COMPLETED },
    });
    const totalProfitDistributed = profitTxs.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0,
    );

    // جلب آخر النشاطات الحقيقية من القاعدة
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const recentTxs = await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const recentReqs = await this.requestRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const activities: Array<{
      id: string;
      type: 'user_register' | 'deposit_request' | 'withdraw_request' | 'profit_distribution' | 'plan_create';
      message: string;
      createdAt: Date;
      status: 'pending' | 'approved' | 'rejected';
    }> = [];

    for (const u of recentUsers) {
      activities.push({
        id: `u-${u.id}`,
        type: 'user_register',
        message: `مستخدم جديد سجل: ${u.email}`,
        createdAt: u.createdAt,
        status: 'approved',
      });
    }

    for (const tx of recentTxs) {
      const statusMap: Record<string, 'pending' | 'approved' | 'rejected'> = {
        pending: 'pending',
        completed: 'approved',
        rejected: 'rejected',
        expired: 'rejected',
      };
      if (tx.type === TransactionType.WITHDRAW) {
        activities.push({
          id: `tx-${tx.id}`,
          type: 'withdraw_request',
          message: `طلب سحب بمبلغ $${Number(tx.amount).toLocaleString()}`,
          createdAt: tx.createdAt,
          status: statusMap[tx.status] || 'pending',
        });
      } else if (tx.type === TransactionType.DEPOSIT) {
        activities.push({
          id: `tx-${tx.id}`,
          type: 'deposit_request',
          message: `طلب إيداع بمبلغ $${Number(tx.amount).toLocaleString()} (${tx.network || 'USDT'})`,
          createdAt: tx.createdAt,
          status: statusMap[tx.status] || 'pending',
        });
      }
    }

    for (const req of recentReqs) {
      const statusMap: Record<string, 'pending' | 'approved' | 'rejected'> = {
        pending: 'pending',
        approved: 'approved',
        rejected: 'rejected',
      };
      activities.push({
        id: `req-${req.id}`,
        type: 'plan_create',
        message: `طلب انضمام لخطة استثمارية من ${req.userEmail}`,
        createdAt: req.createdAt,
        status: statusMap[req.status] || 'pending',
      });
    }

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      stats: {
        totalUsers,
        activeUsers,
        totalInvested,
        pendingWithdrawals,
        totalProfitDistributed,
        activePlans,
      },
      activities: activities.slice(0, 8),
    };
  }

  // ============================================
  // ✅ Method جديدة — إحصائيات ونظام الإحالات للمستخدم
  // ============================================

  async getReferralInfo(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // تفاصيل من قام بدعوة هذا المستخدم
    let referrerInfo: { id: string; email: string; firstName?: string; lastName?: string; referralCode?: string; createdAt?: Date } | null = null;
    if (user.referredBy) {
      const inviter = await this.userRepository.findOne({
        where: [{ id: user.referredBy }, { referralCode: user.referredBy }],
        select: ['id', 'email', 'firstName', 'lastName', 'referralCode', 'createdAt'],
      });
      if (inviter) {
        referrerInfo = inviter;
      }
    }

    // المستخدمون الذين سجلوا عن طريق هذا المستخدم كوداً أو معرفاً
    const directReferrals = await this.userRepository.find({
      where: [{ referredBy: user.id }, { referredBy: user.referralCode }],
      select: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    const totalInvited = directReferrals.length;

    // حساب عدد المستثمرين النشطين (الذين دخلوا صفقة واحدة على الأقل)
    let activeInvestorsCount = 0;
    const referralsList = await Promise.all(
      directReferrals.map(async (ref) => {
        const approvedCount = await this.requestRepository.count({
          where: { userId: ref.id, status: RequestStatus.APPROVED },
        });
        const hasInvested = approvedCount > 0;
        if (hasInvested) activeInvestorsCount++;
        return {
          id: ref.id,
          email: ref.email,
          name: `${ref.firstName || ''} ${ref.lastName || ''}`.trim() || ref.email,
          createdAt: ref.createdAt,
          hasInvested,
        };
      }),
    );

    // حساب إجمالي أرباح الإحالات المكتسبة
    const referralTxs = await this.transactionRepository.find({
      where: { userId, type: TransactionType.REFERRAL, status: TransactionStatus.COMPLETED },
    });
    const totalEarnings = referralTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    // حساب مكافآت المستوى 4 / قائد الفريق
    const level4Txs = referralTxs.filter((tx) => tx.method && tx.method.includes('المستوى 4'));
    const teamBonus = level4Txs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return {
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referrerInfo,
      totalInvited,
      activeInvestorsCount,
      totalEarnings,
      teamBonus,
      referralsList,
    };
  }

  // ============================================
  // ✅ نظام تسجيل الحضور اليومي (Daily Check-in)
  // ============================================

  private getTodayDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getYesterdayDateStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  async getCheckInStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const todayStr = this.getTodayDateStr();
    const existingCheckIn = await this.checkInRepository.findOne({
      where: { userId, date: todayStr },
    });

    const hasCheckedInToday = !!existingCheckIn || user.lastCheckInDate === todayStr;

    // فحص ما إذا كان هناك انقطاع في الـ streak إذا لم يحضر أمس
    const yesterdayStr = this.getYesterdayDateStr();
    let currentStreak = user.checkInStreak || 0;
    if (!hasCheckedInToday && user.lastCheckInDate && user.lastCheckInDate !== yesterdayStr) {
      currentStreak = 0;
    }

    return {
      hasCheckedInToday,
      streak: currentStreak,
      totalCheckIns: user.totalCheckIns || 0,
      lastCheckInDate: user.lastCheckInDate,
      todayDate: todayStr,
    };
  }

  async recordDailyCheckIn(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const todayStr = this.getTodayDateStr();
    const existingCheckIn = await this.checkInRepository.findOne({
      where: { userId, date: todayStr },
    });

    if (existingCheckIn) {
      return {
        success: true,
        alreadyCheckedIn: true,
        message: 'لقد قمت بتسجيل حضورك لهذا اليوم مسبقاً! 🎉',
        streak: user.checkInStreak || 1,
        totalCheckIns: user.totalCheckIns || 1,
        hasCheckedInToday: true,
        todayDate: todayStr,
      };
    }

    // إنشاء سجل حضور اليوم
    const newCheckIn = this.checkInRepository.create({
      userId,
      date: todayStr,
    });
    await this.checkInRepository.save(newCheckIn);

    // حساب الـ Streak
    const yesterdayStr = this.getYesterdayDateStr();
    const isConsecutive = user.lastCheckInDate === yesterdayStr;
    const newStreak = isConsecutive ? (user.checkInStreak || 0) + 1 : 1;
    const newTotal = (user.totalCheckIns || 0) + 1;

    user.lastCheckInDate = todayStr;
    user.checkInStreak = newStreak;
    user.totalCheckIns = newTotal;
    await this.userRepository.save(user);

    return {
      success: true,
      alreadyCheckedIn: false,
      message: 'تم تسجيل حضورك اليومي بنجاح! تم احتساب اليوم ضمن خطتك الاستثمارية ✅',
      streak: newStreak,
      totalCheckIns: newTotal,
      hasCheckedInToday: true,
      todayDate: todayStr,
    };
  }
}

