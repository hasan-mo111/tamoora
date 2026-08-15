import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../modules/user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    const admin = await userService.createAdmin(
      'admin@tamoura.com',
      'Admin@123456',
    );
    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('ID:', admin.id);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }

  await app.close();
  process.exit(0);
}

bootstrap();