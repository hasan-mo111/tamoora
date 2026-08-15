import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  IDENTITY_VERIFIED = 'identity_verified',
  FULLY_VERIFIED = 'fully_verified',
}

// ✅ جديد: حالة وثيقة الهوية
export enum IdDocumentStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true, type: 'varchar' })
  pin: string;

  @Column({ default: false })
  isPinVerified: boolean;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  referredBy: string;

  @Column({ default: false })
  hasConvertedFirstReferral: boolean;

  @Column({ nullable: true, type: 'varchar' })
  firstConvertedReferralId: string | null;
  // ============================================
  // ✅ حقول جديدة — التحقق من البريد الإلكتروني
  // ============================================

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  emailVerificationCode: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpires: Date | null;

  // ============================================
  // ✅ حقول جديدة — التحقق من الهوية (KYC)
  // ============================================

  @Column({ nullable: true, type: 'varchar' })
  idDocumentFront: string | null;

  @Column({ nullable: true, type: 'varchar' })
  idDocumentBack: string | null;

  @Column({ type: 'enum', enum: IdDocumentStatus, default: IdDocumentStatus.NONE })
  idDocumentStatus: IdDocumentStatus;

  @Column({ nullable: true, type: 'varchar' })
  idDocumentRejectReason: string | null;

  // ============================================
  // ✅ حقول جديدة — التوقيع الإلكتروني للعقد
  // ============================================

  @Column({ default: false })
  contractSigned: boolean;

  @Column({ nullable: true, type: 'text' })
  contractSignature: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  contractSignedAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  contractVersion: string | null;

  // ============================================
  // ✅ حقول جديدة — نظام الحضور اليومي
  // ============================================

  @Column({ nullable: true, type: 'varchar', length: 10 })
  lastCheckInDate: string | null;

  @Column({ default: 0 })
  checkInStreak: number;

  @Column({ default: 0 })
  totalCheckIns: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// موجود مسبقاً — لا تغيير
export enum NetworkType {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
}
