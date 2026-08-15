import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { User } from './modules/user/user.entity';
import { DailyCheckIn } from './modules/user/daily-checkin.entity';
import { Investment } from './modules/investment/investment.entity';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { InvestmentRequestModule } from './modules/investment-request/investment-request.module';
import { InvestmentRequest } from './modules/investment-request/investment-request.entity';
import { Transaction } from './modules/transaction/transaction.entity';
import { EmailModule } from './modules/email/email.module';
import { ProjectProposal } from './modules/project-proposal/project-proposal.entity';
import { ProjectProposalModule } from './modules/project-proposal/project-proposal.module';
import { AuditLog } from './modules/audit-log/audit-log.entity';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    InvestmentRequestModule,
    ProjectProposalModule,
    TransactionModule,
    EmailModule,
    AuditLogModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false,
            },
            entities: [User, DailyCheckIn, Investment, InvestmentRequest, Transaction, ProjectProposal, AuditLog],
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          entities: [User, DailyCheckIn, Investment, InvestmentRequest, Transaction, ProjectProposal, AuditLog],
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // ✅ دعم Railway REDIS_URL
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          return { redis: redisUrl };
        }
        return {
          redis: {
            host: configService.get('REDIS_HOST'),
            port: +configService.get('REDIS_PORT'),
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    InvestmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
