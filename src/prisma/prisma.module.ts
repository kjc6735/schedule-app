import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'DATABASE_URL',
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        return databaseUrl;
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
