import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { and, desc, eq, lt } from 'drizzle-orm';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { z } from 'zod';

export const CreateBookingSchema = z.object({
  listingId: z.string().uuid(),
  notas: z.string().max(1000).optional(),
  fechaServicio: z.string().datetime().optional(),
  tokenCulqi: z.string().optional(),
  email: z.string().email().optional(),
});

// Commission rates per listing type
const COMMISSION_RATES: Record<string, number> = {
  SERVICE: 0.20,
  PART: 0.10,
  CAR: 0.05,
};

// Auto-release after 7 days
const AUTO_RELEASE_DAYS = 7;

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(clientId: string, dto: z.infer<typeof CreateBookingSchema>) {
    const listing = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, dto.listingId))
      .limit(1);

    if (!listing[0]) throw new NotFoundException('Listing no encontrado');
    if (listing[0].estado !== 'ACTIVE') throw new BadRequestException('Listing no disponible');
    if (listing[0].sellerId === clientId) throw new BadRequestException('No puedes reservar tu propio listing');

    const monto = Number(listing[0].precio);
    const commissionRate = COMMISSION_RATES[listing[0].tipo] ?? 0.10;
    const comision = monto * commissionRate;
    const montoProveedor = monto - comision;

    // Process payment via Culqi if token provided
    let culqiChargeId: string | undefined;
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

    // Send notification to provider
    await this.notificationsService.createNotification({
      userId: listing[0].sellerId,
      titulo: 'Nueva reserva',
      mensaje: `Tienes una nueva reserva para: ${listing[0].titulo}`,
      tipo: 'BOOKING_CREATED',
      metadata: { bookingId },
    });

    return booking;
  }

  async findMyBookings(userId: string, cursor?: string, limit = 20) {
    const conditions = [eq(schema.bookings.clientId, userId)];
    if (cursor) conditions.push(lt(schema.bookings.createdAt, new Date(cursor)));

    const bookings = await this.db
      .select()
      .from(schema.bookings)
      .where(and(...conditions))
      .orderBy(desc(schema.bookings.createdAt))
      .limit(limit + 1);

    const hasMore = bookings.length > limit;
    const items = hasMore ? bookings.slice(0, limit) : bookings;

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null,
    };
  }

  async findProviderBookings(providerId: string, cursor?: string, limit = 20) {
    const conditions = [eq(schema.bookings.providerId, providerId)];
    if (cursor) conditions.push(lt(schema.bookings.createdAt, new Date(cursor)));

    const bookings = await this.db
      .select()
      .from(schema.bookings)
      .where(and(...conditions))
      .orderBy(desc(schema.bookings.createdAt))
      .limit(limit + 1);

    const hasMore = bookings.length > limit;
    const items = hasMore ? bookings.slice(0, limit) : bookings;

    return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null };
  }

  async findOne(id: string, userId: string) {
    const booking = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, id))
      .limit(1);

    if (!booking[0]) throw new NotFoundException('Reserva no encontrada');
    if (booking[0].clientId !== userId && booking[0].providerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }

    return booking[0];
  }

  async confirmCompletion(bookingId: string, clientId: string) {
    const booking = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, bookingId))
      .limit(1);

    if (!booking[0]) throw new NotFoundException('Reserva no encontrada');
    if (booking[0].clientId !== clientId) throw new ForbiddenException('Solo el cliente puede confirmar');
    if (booking[0].estado !== 'IN_PROGRESS' && booking[0].estado !== 'PAID') {
      throw new BadRequestException('La reserva no está en estado válido para confirmar');
    }

    const [updated] = await this.db
      .update(schema.bookings)
      .set({ estado: 'COMPLETED', updatedAt: new Date() })
      .where(eq(schema.bookings.id, bookingId))
      .returning();

    // Notify provider of payment release
    await this.notificationsService.createNotification({
      userId: booking[0].providerId,
      titulo: 'Pago liberado',
      mensaje: `Tu pago de S/. ${booking[0].montoProveedor} ha sido liberado`,
      tipo: 'PAYMENT_RELEASED',
      metadata: { bookingId },
    });

    return updated;
  }

  async openDispute(bookingId: string, clientId: string, razon: string) {
    const booking = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, bookingId))
      .limit(1);

    if (!booking[0]) throw new NotFoundException('Reserva no encontrada');
    if (booking[0].clientId !== clientId) throw new ForbiddenException('Solo el cliente puede abrir disputa');
    if (!['PAID', 'IN_PROGRESS'].includes(booking[0].estado)) {
      throw new BadRequestException('No se puede disputar en este estado');
    }

    const [updated] = await this.db
      .update(schema.bookings)
      .set({ estado: 'DISPUTED', disputaRazon: razon, updatedAt: new Date() })
      .where(eq(schema.bookings.id, bookingId))
      .returning();

    return updated;
  }

  async startService(bookingId: string, providerId: string) {
    const booking = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, bookingId))
      .limit(1);

    if (!booking[0]) throw new NotFoundException('Reserva no encontrada');
    if (booking[0].providerId !== providerId) throw new ForbiddenException('No autorizado');
    if (booking[0].estado !== 'PAID') throw new BadRequestException('La reserva debe estar pagada');

    const [updated] = await this.db
      .update(schema.bookings)
      .set({ estado: 'IN_PROGRESS', updatedAt: new Date() })
      .where(eq(schema.bookings.id, bookingId))
      .returning();

    return updated;
  }
}
