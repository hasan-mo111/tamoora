import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentRequest } from './investment-request.entity';
import { InvestmentRequestService } from './investment-request.service';
import { InvestmentRequestController } from './investment-request.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentRequest]), AuditLogModule],
  providers: [InvestmentRequestService],
  controllers: [InvestmentRequestController],
  exports: [InvestmentRequestService],
})
export class InvestmentRequestModule {}