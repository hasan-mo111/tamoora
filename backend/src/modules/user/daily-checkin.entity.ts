import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('daily_checkins')
@Unique(['userId', 'date'])
export class DailyCheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 10 })
  date: string; // صيغة YYYY-MM-DD

  @CreateDateColumn()
  createdAt: Date;
}
