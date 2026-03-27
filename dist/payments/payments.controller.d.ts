import { PaymentsService } from './payments.service';
import { z } from 'zod';
declare const CreateChargeSchema: z.ZodObject<{
    token: z.ZodString;
    email: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    email: string;
    amount: number;
    description: string;
}, {
    token: string;
    email: string;
    amount: number;
    description: string;
}>;
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createCharge(body: z.infer<typeof CreateChargeSchema>): Promise<import("./payments.service").CulqiCharge>;
}
export {};
