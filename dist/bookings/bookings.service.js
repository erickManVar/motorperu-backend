"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = exports.CreateBookingSchema = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const payments_service_1 = require("../payments/payments.service");
const notifications_service_1 = require("../notifications/notifications.service");
const zod_1 = require("zod");
exports.CreateBookingSchema = zod_1.z.object({
    listingId: zod_1.z.string().uuid(),
    notas: zod_1.z.string().max(1000).optional(),
    fechaServicio: zod_1.z.string().datetime().optional(),
    tokenCulqi: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
});
const COMMISSION_RATES = {
    SERVICE: 0.20,
    PART: 0.10,
    CAR: 0.05,
};
const AUTO_RELEASE_DAYS = 7;
let BookingsService = class BookingsService {
    constructor(db, paymentsService, notificationsService) {
        this.db = db;
        this.paymentsService = paymentsService;
        this.notificationsService = notificationsService;
    }
    async create(clientId, dto) {
        const listing = await this.db
            .select()
            .from(schema.listings)
            .where((0, drizzle_orm_1.eq)(schema.listings.id, dto.listingId))
            .limit(1);
        if (!listing[0])
            throw new common_1.NotFoundException('Listing no encontrado');
        if (listing[0].estado !== 'ACTIVE')
            throw new common_1.BadRequestException('Listing no disponible');
        if (listing[0].sellerId === clientId)
            throw new common_1.BadRequestException('No puedes reservar tu propio listing');
        const monto = Number(listing[0].precio);
        const commissionRate = COMMISSION_RATES[listing[0].tipo] ?? 0.10;
        const comision = monto * commissionRate;
        const montoProveedor = monto - comision;
        let culqiChargeId;
        if (dto.tokenCulqi && dto.email) {
            const charge = await this.paymentsService.createCharge({
                token: dto.tokenCulqi,
                email: dto.email,
                amount: monto,
                description: listing[0].titulo,
            });
            culqiChargeId = charge.id;
        }
        const autoReleaseAt = new Date();
        autoReleaseAt.setDate(autoReleaseAt.getDate() + AUTO_RELEASE_DAYS);
        const bookingId = crypto.randomUUID();
        const [booking] = await this.db.insert(schema.bookings).values({
            id: bookingId,
            clientId,
            listingId: dto.listingId,
            providerId: listing[0].sellerId,
            monto: String(monto),
            comision: String(comision),
            montoProveedor: String(montoProveedor),
            estado: culqiChargeId ? 'PAID' : 'PENDING_PAYMENT',
            culqiChargeId,
            notas: dto.notas,
            fechaServicio: dto.fechaServicio ? new Date(dto.fechaServicio) : undefined,
            autoReleaseAt,
        }).returning();
        await this.notificationsService.createNotification({
            userId: listing[0].sellerId,
            titulo: 'Nueva reserva',
            mensaje: `Tienes una nueva reserva para: ${listing[0].titulo}`,
            tipo: 'BOOKING_CREATED',
            metadata: { bookingId },
        });
        return booking;
    }
    async findMyBookings(userId, cursor, limit = 20) {
        const conditions = [(0, drizzle_orm_1.eq)(schema.bookings.clientId, userId)];
        if (cursor)
            conditions.push((0, drizzle_orm_1.lt)(schema.bookings.createdAt, new Date(cursor)));
        const bookings = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema.bookings.createdAt))
            .limit(limit + 1);
        const hasMore = bookings.length > limit;
        const items = hasMore ? bookings.slice(0, limit) : bookings;
        return {
            items,
            hasMore,
            nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null,
        };
    }
    async findProviderBookings(providerId, cursor, limit = 20) {
        const conditions = [(0, drizzle_orm_1.eq)(schema.bookings.providerId, providerId)];
        if (cursor)
            conditions.push((0, drizzle_orm_1.lt)(schema.bookings.createdAt, new Date(cursor)));
        const bookings = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema.bookings.createdAt))
            .limit(limit + 1);
        const hasMore = bookings.length > limit;
        const items = hasMore ? bookings.slice(0, limit) : bookings;
        return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null };
    }
    async findOne(id, userId) {
        const booking = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, id))
            .limit(1);
        if (!booking[0])
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (booking[0].clientId !== userId && booking[0].providerId !== userId) {
            throw new common_1.ForbiddenException('No tienes acceso a esta reserva');
        }
        return booking[0];
    }
    async confirmCompletion(bookingId, clientId) {
        const booking = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId))
            .limit(1);
        if (!booking[0])
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (booking[0].clientId !== clientId)
            throw new common_1.ForbiddenException('Solo el cliente puede confirmar');
        if (booking[0].estado !== 'IN_PROGRESS' && booking[0].estado !== 'PAID') {
            throw new common_1.BadRequestException('La reserva no está en estado válido para confirmar');
        }
        const [updated] = await this.db
            .update(schema.bookings)
            .set({ estado: 'COMPLETED', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId))
            .returning();
        await this.notificationsService.createNotification({
            userId: booking[0].providerId,
            titulo: 'Pago liberado',
            mensaje: `Tu pago de S/. ${booking[0].montoProveedor} ha sido liberado`,
            tipo: 'PAYMENT_RELEASED',
            metadata: { bookingId },
        });
        return updated;
    }
    async openDispute(bookingId, clientId, razon) {
        const booking = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId))
            .limit(1);
        if (!booking[0])
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (booking[0].clientId !== clientId)
            throw new common_1.ForbiddenException('Solo el cliente puede abrir disputa');
        if (!['PAID', 'IN_PROGRESS'].includes(booking[0].estado)) {
            throw new common_1.BadRequestException('No se puede disputar en este estado');
        }
        const [updated] = await this.db
            .update(schema.bookings)
            .set({ estado: 'DISPUTED', disputaRazon: razon, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId))
            .returning();
        return updated;
    }
    async startService(bookingId, providerId) {
        const booking = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId))
            .limit(1);
        if (!booking[0])
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (booking[0].providerId !== providerId)
            throw new common_1.ForbiddenException('No autorizado');
        if (booking[0].estado !== 'PAID')
            throw new common_1.BadRequestException('La reserva debe estar pagada');
        const [updated] = await this.db
            .update(schema.bookings)
            .set({ estado: 'IN_PROGRESS', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId))
            .returning();
        return updated;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, payments_service_1.PaymentsService,
        notifications_service_1.NotificationsService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map