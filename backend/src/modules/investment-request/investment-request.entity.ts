import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('investment_requests')
export class InvestmentRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  investmentId: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  numberOfShares?: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ nullable: true })
  adminNotes: string;

  @Column({ default: false })
  isExitRequested: boolean;

  @Column({ type: 'timestamp', nullable: true })
  exitRequestedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  exitReason: string | null;

  @Column({ default: false })
  isCapitalRefunded: boolean;

  @Column({ type: 'timestamp', nullable: true })
  capitalRefundedAt: Date | null;

  @Column({ default: false })
  isContractSigned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  contractSignedAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  contractSignerName: string;

  @Column({ nullable: true, type: 'text' })
  contractSignature: string;

  @Column({ type: 'timestamp', nullable: true })
  lastProfitPaidAt: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalProfitEarned: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  lastProfitPercentagePaid: number | null;

  @Column({ default: 0 })
  missedCheckInDays: number;

  @CreateDateColumn()
  createdAt: Date;
}