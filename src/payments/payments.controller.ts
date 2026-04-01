import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const CreateChargeSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  amount: z.number().positive(),
  description: z.string(),
});

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('charge')
  createCharge(
    @Body(new ZodValidationPipe(CreateChargeSchema)) body: z.infer<typeof CreateChargeSchema>,
  ) {
    return this.paymentsService.createCharge(body);
  }
}
