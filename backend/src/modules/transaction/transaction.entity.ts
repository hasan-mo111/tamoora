// backend/src/modules/transaction/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  PROFIT = 'profit',
  INVESTMENT_PURCHASE = 'investment_purchase',
  REFUND = 'refund',
  REFERRAL = 'referral',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum NetworkType {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
}

@Entity('transactions')
@Index('IDX_TRANSACTION_TXHASH_UNIQUE', ['txHash'], { unique: true, where: '"txHash" IS NOT NULL' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  // ✅ حقول التحقق من المعاملة والشبكة
  @Column({ type: 'enum', enum: NetworkType, nullable: true })
  network: NetworkType;

  @Column({ nullable: true, type: 'varchar' })
  txHash: string;

  @Column({ nullable: true, type: 'varchar' })
  invoiceId: string;

  @Column({ nullable: true, type: 'varchar' })
  trackId: string;

  @Column({ nullable: true, type: 'varchar' })
  fromAddress: string;

  @Column({ nullable: true, type: 'varchar' })
  toAddress: string;

  @Column({ nullable: true, type: 'text' })
  adminNotes: string;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

