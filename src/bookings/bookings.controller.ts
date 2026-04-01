import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService, CreateBookingSchema } from './bookings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';

const DisputeSchema = z.object({
  razon: z.string().min(10).max(1000),
});

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateBookingSchema)) body: z.infer<typeof CreateBookingSchema>,
  ) {
    return this.bookingsService.create(user.id, body);
  }

  @Get('mine')
  getMyBookings(
    @CurrentUser() user: AuthUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
  ) {
    return this.bookingsService.findMyBookings(user.id, cursor, Number(limit));
  }

  @Get('provider')
  getProviderBookings(
    @CurrentUser() user: AuthUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
  ) {
    return this.bookingsService.findProviderBookings(user.id, cursor, Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookingsService.findOne(id, user.id);
  }

  @Patch(':id/start')
  startService(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookingsService.startService(id, user.id);
  }

  @Patch(':id/confirm')
  confirmCompletion(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.bookingsService.confirmCompletion(id, user.id);
  }

  @Patch(':id/dispute')
  openDispute(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(DisputeSchema)) body: z.infer<typeof DisputeSchema>,
  ) {
    return this.bookingsService.openDispute(id, user.id, body.razon);
  }
}
