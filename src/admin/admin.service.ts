import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, count, sql } from 'drizzle-orm';
import * as schema from '../database/schema';

@Injectable()
export class AdminService {
  constructor(@Inject('DRIZZLE') private db: PostgresJsDatabase<typeof schema>) {}

  async getPendingVerifications() {
    return this.db.query.providerVerifications.findMany({
      where: eq(schema.providerVerifications.estado, 'PENDING'),
      with: { user: { columns: { passwordHash: false } } },
    });
  }

  async approveProvider(userId: string) {
    await this.db
      .update(schema.providerVerifications)
      .set({ estado: 'VERIFIED' })
      .where(eq(schema.providerVerifications.userId, userId));
    return { message: 'Provider verified' };
  }

  async suspendProvider(userId: string) {
    await this.db
      .update(schema.providerVerifications)
      .set({ estado: 'SUSPENDED' })
      .where(eq(schema.providerVerifications.userId, userId));
    return { message: 'Provider suspended' };
  }

  async getDisputedBookings() {
    return this.db.query.bookings.findMany({
      where: eq(schema.bookings.estado, 'DISPUTED'),
      with: { client: { columns: { passwordHash: false } }, listing: true },
    });
  }

  async resolveDispute(bookingId: string, releaseToClient: boolean) {
    const estado = releaseToClient ? 'REFUNDED' : 'COMPLETED';
    await this.db
      .update(schema.bookings)
      .set({ estado: estado as any })
      .where(eq(schema.bookings.id, bookingId));
    return { message: `Dispute resolved: ${estado}` };
  }

  async getStats() {
    const [[userCount], [listingCount], [bookingStats]] = await Promise.all([
      this.db.select({ value: count() }).from(schema.users),
      this.db.select({ value: count() }).from(schema.listings),
      this.db
        .select({
          total: count(),
          completed: sql<number>`COUNT(CASE WHEN ${schema.bookings.estado} = 'COMPLETED' THEN 1 END)`,
          revenue: sql<string>`COALESCE(SUM(CASE WHEN ${schema.bookings.estado} = 'COMPLETED' THEN ${schema.bookings.comision} ELSE 0 END), 0)`,
        })
        .from(schema.bookings),
    ]);

    return {
      totalUsers: userCount.value,
      totalListings: listingCount.value,
      totalBookings: bookingStats.total,
      completedBookings: bookingStats.completed,
      totalRevenue: Number(bookingStats.revenue),
    };
  }
}
