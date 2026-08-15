import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus, VerificationStatus } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service'; // ✅ أضف


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService, // ✅ أضف

  ) {}

  async register(dto: RegisterDto) {
    // التحقق من عدم وجود الإيميل مسبقاً
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // إنشاء كود إحالة عشوائي
    const referralCode = this.generateReferralCode();

    // البحث عن المحيل إذا كان كود الإحالة متوفراً
    let inviterId: string | undefined = undefined;
    if (dto.referralCode) {
      const trimmedCode = dto.referralCode.trim();
      const inviter = await this.userRepository.findOne({
        where: [
          { referralCode: trimmedCode },
          { id: trimmedCode },
        ],
      });
      if (inviter) {
        inviterId = inviter.id;
      } else {
        inviterId = trimmedCode;
      }
    }

    // إنشاء المستخدم
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
      balance: 0,
      referralCode,
      referredBy: inviterId,
    });



const savedUser = await this.userRepository.save(user);
    this.emailService.sendWelcomeEmail(savedUser.email, savedUser.firstName || 'المستثمر')
      .catch(err => console.error('Welcome email failed:', err.message));
    // إنشاء Token
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        phone: savedUser.phone,
        role: savedUser.role,
        balance: savedUser.balance,
        referralCode: savedUser.referralCode,
        verificationStatus: savedUser.verificationStatus,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('بيانات الدخول غير صحيحة');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('الحساب موقوف. تواصل مع الإدارة');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('بيانات الدخول غير صحيحة');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
        referralCode: user.referralCode,
        verificationStatus: user.verificationStatus,
      },
    };
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
   async setPin(userId: string, pin: string) {
    console.log('🔐 Setting PIN for user:', userId);
    
    if (!pin || !/^\d{6}$/.test(pin)) {
      throw new BadRequestException('رمز PIN يجب أن يتكون من 6 أرقام');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ✅ شفّر الـ PIN قبل الحفظ
    const hashedPin = await bcrypt.hash(pin, 10);
    user.pin = hashedPin;
    user.isPinVerified = true;
    
    return await this.userRepository.save(user);
  }

  async verifyPin(userId: string, pin: string) {
    console.log('🔐 Verifying PIN for user:', userId);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.pin) {
      throw new BadRequestException('PIN not set');
    }

    // ✅ استخدم bcrypt.compare للمقارنة
    const isPinValid = await bcrypt.compare(pin, user.pin);
    
    if (!isPinValid) {
      console.error('❌ PIN mismatch');
      throw new BadRequestException('الـ PIN غير صحيح');
    }

    console.log('✅ PIN verified successfully');
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    };
  }

  async changePassword(userId: string, oldPassword?: string, newPassword?: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    if (oldPassword) {
      const isOldValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldValid) {
        throw new BadRequestException('كلمة المرور القديمة غير صحيحة');
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}
