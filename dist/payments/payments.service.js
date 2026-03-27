"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.baseUrl = 'https://api.culqi.com/v2';
        this.apiKey = this.configService.getOrThrow('CULQI_SECRET_KEY');
    }
    async createCharge(payload) {
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
                const error = await response.json();
                throw new common_1.BadRequestException(error.merchant_message ?? 'Error al procesar el pago');
            }
            return response.json();
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            this.logger.error('Culqi charge failed', err);
            throw new common_1.BadRequestException('Error al conectar con el procesador de pagos');
        }
    }
    async refundCharge(chargeId, amount) {
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
                const error = await response.json();
                throw new common_1.BadRequestException(error.merchant_message ?? 'Error al procesar el reembolso');
            }
            return response.json();
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            this.logger.error('Culqi refund failed', err);
            throw new common_1.BadRequestException('Error al procesar el reembolso');
        }
    }
    calculateCommission(amount, listingType) {
        const rates = {
            SERVICE: 0.20,
            PART: 0.10,
            CAR: 0.05,
        };
        const rate = rates[listingType] ?? 0.10;
        const comision = amount * rate;
        const montoProveedor = amount - comision;
        return { comision, montoProveedor };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map