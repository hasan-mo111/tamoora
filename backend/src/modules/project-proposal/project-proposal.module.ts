import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectProposal } from './project-proposal.entity';
import { InvestmentRequest } from '../investment-request/investment-request.entity';
import { ProjectProposalService } from './project-proposal.service';
import { ProjectProposalController } from './project-proposal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectProposal, InvestmentRequest])],
  controllers: [ProjectProposalController],
  providers: [ProjectProposalService],
  exports: [ProjectProposalService],
})
export class ProjectProposalModule {}
