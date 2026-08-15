import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InvestmentType {
  WEEKLY = 'weekly',
  DAILY = 'daily',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum InvestmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InvestmentType })
  type: InvestmentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capital: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fee: number;

  @Column({ type: 'text' })
  profit: string;

  @Column({ type: 'int' })
  totalShares: number;

  @Column({ type: 'int' })
  availableShares: number;

  @Column({ type: 'enum', enum: InvestmentStatus, default: InvestmentStatus.ACTIVE })
  status: InvestmentStatus;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'int', default: 12 })
  durationMonths: number;

  @Column({ nullable: true, type: 'int', default: 50 })
  investorContributionPercent: number;

  @Column({ nullable: true, type: 'text' })
  customContractTemplate: string;

  @Column({ nullable: true, type: 'decimal', precision: 5, scale: 2 })
  declaredProfitPercentage: number;

  @Column({ nullable: true, type: 'timestamp' })
  lastProfitDistributedAt: Date;

  @Column({ default: true })
  adminApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}