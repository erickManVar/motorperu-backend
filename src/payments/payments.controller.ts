import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const CreateChargeSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  amount: z.number().positive(),
  description: z.string(),
});

@Controller('payments')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('charge')
  createCharge(
    @Body(new ZodValidationPipe(CreateChargeSchema)) body: z.infer<typeof CreateChargeSchema>,
  ) {
    return this.paymentsService.createCharge(body);
  }
}
