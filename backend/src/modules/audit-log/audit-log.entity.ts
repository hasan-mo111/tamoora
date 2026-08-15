import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  adminId: string;

  @Column({ nullable: true })
  adminEmail: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetUserId: string;

  @Column({ nullable: true })
  targetUserEmail: string;

  @Column({ type: 'json', nullable: true })
  oldValue: any;

  @Column({ type: 'json', nullable: true })
  newValue: any;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
