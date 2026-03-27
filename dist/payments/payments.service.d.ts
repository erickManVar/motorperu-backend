import { ConfigService } from '@nestjs/config';
interface CulqiChargePayload {
    token: string;
    email: string;
    amount: number;
    description: string;
    currencyCode?: string;
}
export interface CulqiCharge {
    id: string;
    amount: number;
    currency_code: string;
    email: string;
    outcome: {
        type: string;
    };
}
export declare class PaymentsService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    createCharge(payload: CulqiChargePayload): Promise<CulqiCharge>;
    refundCharge(chargeId: string, amount?: number): Promise<unknown>;
    calculateCommission(amount: number, listingType: string): {
        comision: number;
        montoProveedor: number;
    };
}
export {};
