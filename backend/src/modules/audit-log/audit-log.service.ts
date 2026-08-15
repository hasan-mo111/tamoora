import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface CreateAuditLogDto {
  adminId?: string;
  adminEmail?: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const logEntry = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(logEntry);
  }

  async findAll(limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByTargetUser(targetUserId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { targetUserId },
      order: { createdAt: 'DESC' },
    });
  }
}
