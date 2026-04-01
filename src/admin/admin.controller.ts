import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const ResolveDisputeSchema = z.object({
  releaseToClient: z.boolean(),
});

@Controller('admin')
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
  resolveDispute(
    @Param('bookingId') id: string,
    @Body(new ZodValidationPipe(ResolveDisputeSchema)) body: z.infer<typeof ResolveDisputeSchema>,
  ) {
    return this.adminService.resolveDispute(id, body.releaseToClient);
  }
}
