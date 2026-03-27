import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DriversService, CreateDriverProfileSchema, RequestDriverSchema } from './drivers.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
import { SetMetadata } from '@nestjs/common';

const Public = () => SetMetadata('isPublic', true);

@Controller('drivers')
@UseGuards(AuthGuard, RolesGuard)
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Get('available')
  @Public()
  findAvailable(@Query('distrito') distrito: string) {
    return this.driversService.findAvailableDrivers(distrito ?? '');
  }

  @Get('profile')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.driversService.getMyProfile(user.id);
  }

  @Post('profile')
  createOrUpdateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateDriverProfileSchema)) body: z.infer<typeof CreateDriverProfileSchema>,
  ) {
    return this.driversService.createOrUpdateProfile(user.id, body);
  }

  @Patch('availability')
  toggleAvailability(@CurrentUser() user: AuthUser) {
    return this.driversService.toggleAvailability(user.id);
  }
}
