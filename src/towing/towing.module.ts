import { Module } from '@nestjs/common';
import { TowingController } from './towing.controller';
import { TowingService } from './towing.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TowingController],
  providers: [TowingService],
  exports: [TowingService],
})
export class TowingModule {}
