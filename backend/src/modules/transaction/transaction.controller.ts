import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { NetworkType } from './transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // ✅ 1. إنشاء طلب إيداع جديد (يستخدم network بدلاً من method)
  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  async createDeposit(
    @Req() req,
    @Body() body: { amount: number; network: NetworkType }
  ) {
    return this.transactionService.createDeposit(req.user.id, body.amount, body.network);
  }

  // ✅ 1.1 إنشاء طلب إيداع كاش (نقدي)
  @Post('cash-deposit')
  @UseGuards(JwtAuthGuard)
  async createCashDeposit(
    @Req() req,
    @Body() body: { amount: number; notes?: string }
  ) {
    return this.transactionService.createCashDeposit(req.user.id, body.amount, body.notes);
  }

  // ✅ 1.2 إنشاء فاتورة إيداع عبر OxaPay
  @Post(['oxpay/deposit', 'oxpay/create-invoice'])
  @UseGuards(JwtAuthGuard)
  async createOxpayDeposit(
    @Req() req,
    @Body() body: { amount: number; network?: NetworkType; currency?: string }
  ) {
    return this.transactionService.createOxpayDeposit(
      req.user.id,
      body.amount,
      body.network || NetworkType.TRC20,
      body.currency || 'USD'
    );
  }

  // ✅ 1.3 معالجة Webhook الخاص بـ OxaPay
  @Post('oxpay/webhook')
  async handleOxpayWebhook(
    @Req() req,
    @Body() body: any
  ) {
    const signature =
      req.headers['hmac'] ||
      req.headers['x-signature'] ||
      req.headers['x-oxpay-signature'] ||
      req.headers['signature'] ||
      (body && (body.hmac || body.signature));

    return this.transactionService.handleOxpayWebhook(body, signature, req.ip);
  }

  // ✅ 1.4 التحقق من حالة معاملة OxaPay
  @Get('oxpay/status/:id')
  @UseGuards(JwtAuthGuard)
  async checkOxpayStatus(@Param('id') id: string) {
    return this.transactionService.checkOxpayStatus(id);
  }

  // ✅ 1.5 إلغاء طلب الإيداع وتغيير حالته إلى مرفوض (Rejected)
  @Post([':id/cancel-deposit', ':id/cancel', 'cancel-deposit/:id'])
  @UseGuards(JwtAuthGuard)
  async cancelDeposit(
    @Param('id') id: string,
    @Req() req,
    @Body() body?: { reason?: string }
  ) {
    return this.transactionService.cancelDeposit(id, req.user.id, body?.reason);
  }

  // ✅ 2. التحقق من المعاملة عبر TxHash مع منع الإيداع المزدوج وتسجيل التدقيق
  @Post('verify-deposit')
  @UseGuards(JwtAuthGuard)
  async verifyDeposit(
    @Req() req,
    @Body() body: { transactionId: string; txHash: string }
  ) {
    return this.transactionService.verifyDeposit(
      body.transactionId,
      body.txHash,
      req.user.id,
      { ip: req.ip }
    );
  }

  // ✅ 3. طلب سحب
  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  async createWithdraw(
    @Req() req,
    @Body() body: { amount: number; walletAddress: string; network?: NetworkType; method?: string }
  ) {
    return this.transactionService.createWithdraw(
      req.user.id,
      body.amount,
      body.walletAddress,
      body.network || NetworkType.TRC20,
      body.method || 'OXPAY (USDT)'
    );
  }

  // ✅ 3.1 جلب أصل وأهلية السحب (80% من صافي الأرباح أو 100% بعد 4 أشهر)
  @Get('withdrawal-eligibility')
  @UseGuards(JwtAuthGuard)
  async getWithdrawalEligibility(@Req() req) {
    return this.transactionService.getWithdrawalEligibility(req.user.id);
  }

  // ✅ 4. جلب معاملات المستخدم الحالي
  @Get('my-transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@Req() req) {
    return this.transactionService.getUserTransactions(req.user.id);
  }

  // ✅ 5. جلب جميع المعاملات (للأدمن فقط)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTransactions(@Query('status') status?: any) {
    return this.transactionService.getAllTransactions(status);
  }

  // ✅ 6. موافقة الأدمن على السحب
  @Post(':id/approve-withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveWithdraw(
    @Param('id') id: string,
    @Req() req,
    @Body() body?: { notes?: string; apiKey?: string }
  ) {
    return this.transactionService.approveWithdraw(id, body?.notes, req.user, req.ip, body?.apiKey);
  }

  // ✅ 6.1 موافقة الأدمن على الإيداع (كاش أو كريبتو)
  @Post(':id/approve-deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveDeposit(
    @Param('id') id: string,
    @Req() req,
    @Body() body?: { notes?: string }
  ) {
    return this.transactionService.approveDeposit(id, body?.notes, req.user, req.ip);
  }

  // ✅ 7. رفض الأدمن للسحب
  @Post(':id/reject-withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectWithdraw(
    @Param('id') id: string,
    @Req() req,
    @Body() body?: { notes?: string }
  ) {
    return this.transactionService.rejectWithdraw(id, body?.notes, req.user, req.ip);
  }

  // ✅ 7.1 رفض الأدمن للإيداع
  @Post(':id/reject-deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectDeposit(
    @Param('id') id: string,
    @Req() req,
    @Body() body?: { notes?: string }
  ) {
    return this.transactionService.rejectDeposit(id, body?.notes, req.user, req.ip);
  }
}
