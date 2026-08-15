import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserService } from './modules/user/user.service';
import { join } from 'path';

async function bootstrap() {
  // ✅ تغيير النوع لـ NestExpressApplication لدعم useStaticAssets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ تقديم ملفات الـ uploads بشكل آمن
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // CORS — بدون تغيير
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://tamoura-platform.vercel.app',  // ✅ أضف هذا صراحةً
    process.env.FRONTEND_URL,
    /\.vercel\.app$/,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(o => {
        if (typeof o === 'string') return o === origin;
        if (o instanceof RegExp) return o.test(origin);
        return false;
      });
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-cryptomous-signature'],
  });

  // ✅ إنشاء الأدمن — بدون تغيير
  try {
    const userService = app.get(UserService);
    await userService.createAdmin('admin@tamoura.com', 'Admin@123456');
    console.log('✅ Admin account created or already exists');
  } catch (error) {
    console.log('ℹ️ Admin already exists:', error.message);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on port: ${port}`);
}
bootstrap();
