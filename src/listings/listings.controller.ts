import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthUser } from '../auth/auth.service';
import {
  CreateCarListingSchema,
  CreatePartListingSchema,
  CreateServiceListingSchema,
  UpdateListingSchema,
  ListingsQuerySchema,
} from './listings.schemas';
import { SetMetadata } from '@nestjs/common';

const Public = () => SetMetadata('isPublic', true);

@Controller('listings')
@UseGuards(AuthGuard, RolesGuard)
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Get()
  @Public()
  findAll(
    @Query(new ZodValidationPipe(ListingsQuerySchema)) query: ReturnType<typeof ListingsQuerySchema.parse>,
  ) {
    return this.listingsService.findAll(query);
  }

  @Get('mine')
  getMyListings(
    @CurrentUser() user: AuthUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 20,
  ) {
    return this.listingsService.getMyListings(user.id, cursor, Number(limit));
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Post('cars')
  @Roles('SELLER', 'ADMIN')
  createCar(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateCarListingSchema)) body: ReturnType<typeof CreateCarListingSchema.parse>,
  ) {
    return this.listingsService.createCar(user.id, body);
  }

  @Post('parts')
  @Roles('SELLER', 'ADMIN')
  createPart(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreatePartListingSchema)) body: ReturnType<typeof CreatePartListingSchema.parse>,
  ) {
    return this.listingsService.createPart(user.id, body);
  }

  @Post('services')
  @Roles('PROVIDER', 'ADMIN')
  createService(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateServiceListingSchema)) body: ReturnType<typeof CreateServiceListingSchema.parse>,
  ) {
    return this.listingsService.createService(user.id, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateListingSchema)) body: ReturnType<typeof UpdateListingSchema.parse>,
  ) {
    return this.listingsService.update(id, user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.listingsService.remove(id, user.id, user.role);
  }
}
