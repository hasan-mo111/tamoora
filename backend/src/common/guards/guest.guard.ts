import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class GuestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // إذا كان المستخدم ضيفاً، ارفض الوصول
    if (user && user.role === 'guest') {
      throw new ForbiddenException('يجب تسجيل الدخول للوصول إلى هذا المورد');
    }

    return true;
  }
}