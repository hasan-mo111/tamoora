import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ProjectProposalService } from './project-proposal.service';
import { ProjectProposal } from './project-proposal.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('project-proposals')
export class ProjectProposalController {
  constructor(private readonly proposalService: ProjectProposalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: Partial<ProjectProposal>, @Req() req: any) {
    return this.proposalService.create(data, req.user?.id);
  }

  @Get()
  async findAll() {
    return this.proposalService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.proposalService.remove(id);
    return { success: true, message: 'Proposal deleted' };
  }
}
