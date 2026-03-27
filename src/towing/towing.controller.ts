import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TowingService, CreateTowingProfileSchema, RequestTowingSchema } from './towing.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
import { SetMetadata } from '@nestjs/common';

const Public = () => SetMetadata('isPublic', true);

@Controller('towing')
@UseGuards(AuthGuard, RolesGuard)
export class TowingController {
  constructor(private towingService: TowingService) {}

  @Get('available')
  @Public()
  findAvailable(
    @Query('distrito') distrito: string,
    @Query('tipo') tipo: string,
  ) {
    return this.towingService.findAvailableInDistrict(distrito, tipo);
  }

  @Get('profile')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.towingService.getMyProfile(user.id);
  }

  @Post('profile')
  createOrUpdateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateTowingProfileSchema)) body: z.infer<typeof CreateTowingProfileSchema>,
  ) {
    return this.towingService.createOrUpdateProfile(user.id, body);
  }
}
