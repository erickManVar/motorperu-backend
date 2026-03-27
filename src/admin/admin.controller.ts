import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  @Get('verifications/pending')
  getPending() { return this.adminService.getPendingVerifications(); }

  @Patch('verifications/:userId/approve')
  approve(@Param('userId') userId: string) { return this.adminService.approveProvider(userId); }

  @Patch('verifications/:userId/suspend')
  suspend(@Param('userId') userId: string) { return this.adminService.suspendProvider(userId); }

  @Get('disputes')
  getDisputes() { return this.adminService.getDisputedBookings(); }

  @Patch('disputes/:bookingId/resolve')
  resolveDispute(@Param('bookingId') id: string, @Body() body: { releaseToClient: boolean }) {
    return this.adminService.resolveDispute(id, body.releaseToClient);
  }
}
