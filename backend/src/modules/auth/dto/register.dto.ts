import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'الاسم مطلوب' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'الكنية مطلوبة' })
  lastName: string;

  @IsString()
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: 'رقم الهاتف غير صالح',
  })
  phone: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}