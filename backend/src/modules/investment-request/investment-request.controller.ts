import { Controller, Get, Post, Body, Param, UseGuards, Query, Req } from '@nestjs/common';
import { InvestmentRequestService } from './investment-request.service';
import { InvestmentRequest, RequestStatus } from './investment-request.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('investment-requests')
export class InvestmentRequestController {
  constructor(private readonly requestService: InvestmentRequestService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: Partial<InvestmentRequest>) {
    return this.requestService.create(data);
  }

  // ✅ Endpoint جديد: جلب طلبات المستخدم الحالي فقط
  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  async getMyRequests(@Req() req, @Query('status') status?: RequestStatus) {
    return this.requestService.findMyRequests(req.user.id, status);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('status') status?: RequestStatus) {
    return this.requestService.findAll(status);
  }

  @Post(':id/request-exit')
  @UseGuards(JwtAuthGuard)
  async requestExit(@Param('id') id: string, @Req() req, @Body() body: { reason?: string }) {
    return this.requestService.requestExit(id, req.user.id, body.reason);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(@Param('id') id: string, @Req() req) {
    return this.requestService.approve(id, req.user, req.ip);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(@Param('id') id: string, @Req() req) {
    return this.requestService.reject(id, req.user, req.ip);
  }
}