import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('project_proposals')
export class ProjectProposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId?: string; 

  @Column()
  title: string; // اسم الاستثمار / المشروع

  @Column({ nullable: true })
  duration?: string; // زمنه / مدته

  @Column({ nullable: true })
  size?: string; // حجمه / نطاقه

  @Column({ nullable: true })
  estimatedCost?: string; // كم يكلف تقديرياً

  @Column({ nullable: true })
  expectedReturn?: string; // كم العائد المتوقع

  @Column({ nullable: true })
  proposerName?: string;

  @Column({ nullable: true })
  proposerEmail?: string;

  @Column({ nullable: true })
  proposerPhone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
