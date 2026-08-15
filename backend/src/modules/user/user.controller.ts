import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UserService } from './user.service';
import { User, UserStatus } from './user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

const uploadsDir = join(process.cwd(), 'uploads', 'identities');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const storage = diskStorage({
  destination: uploadsDir,
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase();
    callback(null, `id-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('يُسمح فقط بملفات JPG, PNG, WEBP'), false);
  }
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Routes الثابتة - أولاً دائماً
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get('admin-stats')
  @UseGuards(AdminGuard)
  async getAdminStats() {
    return this.userService.getAdminStats();
  }

  @Get('me')
  async getMe(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Get('referral-info')
  async getReferralInfo(@Req() req) {
    return this.userService.getReferralInfo(req.user.id);
  }

  @Get('verification-status')
  async getVerificationStatus(@Req() req) {
    return this.userService.getVerificationStatus(req.user.id);
  }

  @Get('identity-status')
  async getIdentityStatus(@Req() req) {
    return this.userService.getIdDocumentStatus(req.user.id);
  }

  @Get('contract-status')
  async getContractStatus(@Req() req) {
    return this.userService.getContractStatus(req.user.id);
  }

  // ============================================
  // ✅ نظام تسجيل الحضور اليومي
  // ============================================
  @Get('check-in-status')
  async getCheckInStatus(@Req() req) {
    return this.userService.getCheckInStatus(req.user.id);
  }

  @Post('check-in')
  async recordCheckIn(@Req() req) {
    return this.userService.recordDailyCheckIn(req.user.id);
  }

  @Post('send-email-code')
  async sendEmailCode(@Req() req) {
    return this.userService.sendEmailVerificationCode(req.user.id);
  }

  @Post('verify-email')
  async verifyEmail(@Req() req, @Body() body: { code: string }) {
    if (!body.code || body.code.length !== 6) {
      throw new BadRequestException('رمز التحقق يجب أن يكون 6 أرقام');
    }
    return this.userService.verifyEmailCode(req.user.id, body.code);
  }

  @Post('upload-identity')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'front', maxCount: 1 },
        { name: 'back', maxCount: 1 },
      ],
      { storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  async uploadIdentity(
    @Req() req,
    @UploadedFiles() files: any,
  ) {
    if (!files?.front?.[0] || !files?.back?.[0]) {
      throw new BadRequestException('يجب رفع الصورتين الأمامية والخلفية');
    }
    const frontPath = `/uploads/identities/${files.front[0].filename}`;
    const backPath = `/uploads/identities/${files.back[0].filename}`;
    return this.userService.uploadIdDocument(req.user.id, frontPath, backPath);
  }

  @Post('sign-contract')
  async signContract(
    @Req() req,
    @Body() body: { signature: string; version?: string },
  ) {
    if (!body.signature) {
      throw new BadRequestException('التوقيع مطلوب');
    }
    return this.userService.signContract(
      req.user.id,
      body.signature,
      body.version || 'v1.0',
    );
  }

  @Post(':id/approve-identity')
  @UseGuards(AdminGuard)
  async approveIdentity(@Param('id') id: string, @Req() req) {
    return this.userService.approveIdDocument(id, req.user, req.ip);
  }

  @Post(':id/reject-identity')
  @UseGuards(AdminGuard)
  async rejectIdentity(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { reason: string },
  ) {
    if (!body.reason) {
      throw new BadRequestException('يجب ذكر سبب الرفض');
    }
    return this.userService.rejectIdDocument(id, body.reason, req.user, req.ip);
  }

  @Post(':id/update-balance')
  @UseGuards(AdminGuard)
  async updateBalance(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { balance: number; reason: string },
  ) {
    if (body.balance === undefined || body.balance === null) {
      throw new BadRequestException('الرصيد المطلوب إدخاله غير موجود');
    }
    if (!body.reason) {
      throw new BadRequestException('يجب تقديم سبب لتعديل الرصيد');
    }
    return this.userService.updateUserBalance(
      id,
      body.balance,
      body.reason,
      req.user,
      req.ip,
    );
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Partial<User>,
  ) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string, @Req() req) {
    return this.userService.remove(id, req.user?.id);
  }

  // Route المتغير - آخراً دائماً
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
