import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { Investment, InvestmentType, InvestmentStatus } from './investment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GuestGuard } from '../../common/guards/guest.guard';

@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, GuestGuard)
  async findAll(@Query('status') status?: InvestmentStatus) {
    return this.investmentService.findAll(status);
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(@Req() req: any) {
    return this.investmentService.getUserSubscriptions(req.user.id);
  }

  @Get('available')
  async getAvailable() {
    return this.investmentService.getAvailableInvestments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, GuestGuard)
  async create(@Body() data: Partial<Investment>) {
    return this.investmentService.create(data);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, GuestGuard)
  async approveProject(@Param('id') id: string) {
    return this.investmentService.approveProject(id);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @Param('id') id: string,
    @Body() body: { shares?: number; contractSignature?: string; contractSignerName?: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.investmentService.subscribe(
      id,
      userId,
      body?.shares || 1,
      body?.contractSignature,
      body?.contractSignerName,
    );
  }

  @Post(':id/distribute-profit')
  @UseGuards(JwtAuthGuard)
  async distributeProfit(
    @Param('id') id: string,
    @Body('profitPercentage') profitPercentage: number,
    @Req() req: any,
  ) {
    return this.investmentService.distributeProfit(
      id,
      Number(profitPercentage),
      req.user,
      req.ip,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, GuestGuard)
  async update(@Param('id') id: string, @Body() data: Partial<Investment>) {
    return this.investmentService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, GuestGuard)
  async delete(@Param('id') id: string) {
    return this.investmentService.delete(id);
  }
}