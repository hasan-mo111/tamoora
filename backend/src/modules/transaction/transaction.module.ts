// backend/src/modules/transaction/transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../user/user.entity';
import { InvestmentRequest } from '../investment-request/investment-request.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BlockchainService } from './blockchain.service';
import { OxpayService } from './oxpay.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User, InvestmentRequest]), AuditLogModule],
  providers: [TransactionService, BlockchainService, OxpayService],
  controllers: [TransactionController],
  exports: [TransactionService, OxpayService],
})
export class TransactionModule {}
