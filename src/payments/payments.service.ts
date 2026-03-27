import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
  outcome: { type: string };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.culqi.com/v2';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('CULQI_SECRET_KEY');
  }

  async createCharge(payload: CulqiChargePayload): Promise<CulqiCharge> {
    const amountCentimos = Math.round(payload.amount * 100);

    try {
      const response = await fetch(`${this.baseUrl}/charges`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountCentimos,
          currency_code: payload.currencyCode ?? 'PEN',
          email: payload.email,
          source_id: payload.token,
          description: payload.description,
          metadata: {
            platform: 'motorperu',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { merchant_message?: string };
        throw new BadRequestException(error.merchant_message ?? 'Error al procesar el pago');
      }

      return response.json() as Promise<CulqiCharge>;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Culqi charge failed', err);
      throw new BadRequestException('Error al conectar con el procesador de pagos');
    }
  }

  async refundCharge(chargeId: string, amount?: number): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          charge_id: chargeId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: 'solicitud_comprador',
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { merchant_message?: string };
        throw new BadRequestException(error.merchant_message ?? 'Error al procesar el reembolso');
      }

      return response.json();
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Culqi refund failed', err);
      throw new BadRequestException('Error al procesar el reembolso');
    }
  }

  calculateCommission(amount: number, listingType: string): { comision: number; montoProveedor: number } {
    const rates: Record<string, number> = {
      SERVICE: 0.20,
      PART: 0.10,
      CAR: 0.05,
    };
    const rate = rates[listingType] ?? 0.10;
    const comision = amount * rate;
    const montoProveedor = amount - comision;
    return { comision, montoProveedor };
  }
}
