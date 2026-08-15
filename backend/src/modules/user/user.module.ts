import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DailyCheckIn } from './daily-checkin.entity';
import { Investment } from '../investment/investment.entity';
import { InvestmentRequest } from '../investment-request/investment-request.entity';
import { Transaction } from '../transaction/transaction.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DailyCheckIn, Investment, InvestmentRequest, Transaction]),
    AuditLogModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
