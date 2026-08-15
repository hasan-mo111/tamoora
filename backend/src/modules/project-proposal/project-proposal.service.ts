import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectProposal } from './project-proposal.entity';
import { InvestmentRequest, RequestStatus } from '../investment-request/investment-request.entity';

@Injectable()
export class ProjectProposalService {
  constructor(
    @InjectRepository(ProjectProposal)
    private proposalRepository: Repository<ProjectProposal>,
    @InjectRepository(InvestmentRequest)
    private requestRepository: Repository<InvestmentRequest>,
  ) {}

  async create(data: Partial<ProjectProposal>, userId?: string): Promise<ProjectProposal> {
    if (userId) {
      const activeInvestmentsCount = await this.requestRepository.count({
        where: {
          userId,
          status: RequestStatus.APPROVED,
        },
      });

      if (activeInvestmentsCount === 0) {
        throw new ForbiddenException(
          'عذراً، تقتصر إمكانية تقديم اقتراحات المشاريع الجديدة على الأعضاء المشتركين في صفقة استثمارية واحدة على الأقل.'
        );
      }
    }

    const proposal = this.proposalRepository.create({ ...data, userId });
    return this.proposalRepository.save(proposal);
  }

  async findAll(): Promise<ProjectProposal[]> {
    return this.proposalRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const proposal = await this.proposalRepository.findOne({ where: { id } });
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    await this.proposalRepository.remove(proposal);
  }
}
