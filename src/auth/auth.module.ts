import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],

  providers: [
    AuthService,
    {
      provide: 'JWT_ACCESS_SECRET',
      useFactory: (config: ConfigService) =>
        config.get<string>('JWT_ACCESS_SECRET'),
      inject: [ConfigService],
    },
    {
      provide: 'JWT_REFRESH_SECRET',
      useFactory: (config: ConfigService) =>
        config.get<string>('JWT_REFRESH_SECRET'),
      inject: [ConfigService],
    },
    {
      provide: 'JWT_ACCESS_EXPIRES_IN',
      useFactory: (config: ConfigService) =>
        config.get<string>('JWT_ACCESS_EXPIRES_IN'),
      inject: [ConfigService],
    },
    {
      provide: 'JWT_REFRESH_EXPIRES_IN',
      useFactory: (config: ConfigService) =>
        config.get<string>('JWT_REFRESH_EXPIRES_IN'),
      inject: [ConfigService],
    },
    {
      provide: 'SALT_OR_ROUNDS',
      useFactory: (config: ConfigService) =>
        config.get<string>('SALT_OR_ROUNDS'),
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
