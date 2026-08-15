import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from './investment.entity';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { User } from '../user/user.entity';
import { DailyCheckIn } from '../user/daily-checkin.entity';
import { Transaction } from '../transaction/transaction.entity';
import { InvestmentRequest } from '../investment-request/investment-request.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment, User, DailyCheckIn, Transaction, InvestmentRequest]),
    AuditLogModule,
  ],
  providers: [InvestmentService],
  controllers: [InvestmentController],
  exports: [InvestmentService],
})
export class InvestmentModule {}