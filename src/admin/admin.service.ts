import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../database/schema';

@Injectable()
export class AdminService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

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
    const [users, listings, bookings] = await Promise.all([
      this.db.select().from(schema.users),
      this.db.select().from(schema.listings),
      this.db.select().from(schema.bookings),
    ]);
    const completed = bookings.filter(b => b.estado === 'COMPLETED');
    const revenue = completed.reduce((sum, b) => sum + Number(b.comision || 0), 0);
    return {
      totalUsers: users.length,
      totalListings: listings.length,
      totalBookings: bookings.length,
      completedBookings: completed.length,
      totalRevenue: revenue,
    };
  }
}
