import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { and, avg, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

export const CreateReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comentario: z.string().max(2000).optional(),
});

@Injectable()
export class ReviewsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async create(reviewerId: string, dto: z.infer<typeof CreateReviewSchema>) {
    const booking = await this.db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, dto.bookingId))
      .limit(1);

    if (!booking[0]) throw new NotFoundException('Reserva no encontrada');
    if (booking[0].clientId !== reviewerId) throw new ForbiddenException('Solo el cliente puede dejar reseña');
    if (booking[0].estado !== 'COMPLETED') throw new BadRequestException('Solo puedes reseñar servicios completados');

    const existing = await this.db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.bookingId, dto.bookingId))
      .limit(1);

    if (existing[0]) throw new BadRequestException('Ya dejaste una reseña para esta reserva');

    const [review] = await this.db.insert(schema.reviews).values({
      bookingId: dto.bookingId,
      reviewerId,
      reviewedId: booking[0].providerId,
      listingId: booking[0].listingId,
      rating: dto.rating,
      comentario: dto.comentario,
    }).returning();

    // Update provider's average rating
    await this.updateProviderRating(booking[0].providerId);

    return review;
  }

  async getListingReviews(listingId: string, cursor?: string, limit = 20) {
    const reviews = await this.db
      .select({
        id: schema.reviews.id,
        rating: schema.reviews.rating,
        comentario: schema.reviews.comentario,
        createdAt: schema.reviews.createdAt,
        reviewer: { nombre: schema.users.nombre, foto: schema.users.foto },
      })
      .from(schema.reviews)
      .innerJoin(schema.users, eq(schema.users.id, schema.reviews.reviewerId))
      .where(eq(schema.reviews.listingId, listingId))
      .orderBy(desc(schema.reviews.createdAt))
      .limit(limit);

    return reviews;
  }

  private async updateProviderRating(providerId: string) {
    const result = await this.db
      .select({ avg: avg(schema.reviews.rating), count: count() })
      .from(schema.reviews)
      .where(eq(schema.reviews.reviewedId, providerId));

    const avgRating = result[0]?.avg ?? '0';
    const totalReviews = result[0]?.count ?? 0;

    // Update driver profile if exists
    await this.db
      .update(schema.driverProfiles)
      .set({ rating: String(avgRating), totalReviews })
      .where(eq(schema.driverProfiles.userId, providerId));

    // Update towing profile if exists
    await this.db
      .update(schema.towingProfiles)
      .set({ rating: String(avgRating), totalReviews })
      .where(eq(schema.towingProfiles.userId, providerId));
  }
}
