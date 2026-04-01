import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UsersService, UpdateProfileSchema } from './users.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';

const ChangeRoleSchema = z.object({
  role: z.enum(['SELLER', 'PROVIDER', 'BUYER']),
});

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @UsePipes(new ZodValidationPipe(UpdateProfileSchema))
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: z.infer<typeof UpdateProfileSchema>,
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Post('me/role')
  changeRole(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ChangeRoleSchema)) body: z.infer<typeof ChangeRoleSchema>,
  ) {
    return this.usersService.changeRole(user.id, body.role);
  }
}
