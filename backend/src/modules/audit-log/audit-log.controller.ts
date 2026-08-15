import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getLogs(@Query('limit') limit?: number) {
    return this.auditLogService.findAll(limit ? Number(limit) : 100);
  }

  @Get('user')
  async getUserLogs(@Query('userId') userId: string) {
    return this.auditLogService.findByTargetUser(userId);
  }
}
