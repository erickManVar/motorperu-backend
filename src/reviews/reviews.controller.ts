import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewsService, CreateReviewSchema } from './reviews.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
import { SetMetadata } from '@nestjs/common';

const Public = () => SetMetadata('isPublic', true);

@Controller('reviews')
@UseGuards(AuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('listing/:listingId')
  @Public()
  getListingReviews(
    @Param('listingId') listingId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.reviewsService.getListingReviews(listingId, cursor);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateReviewSchema)) body: z.infer<typeof CreateReviewSchema>,
  ) {
    return this.reviewsService.create(user.id, body);
  }
}
