import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { avg, count, desc, eq } from 'drizzle-orm';
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

    // Use transaction + unique constraint instead of SELECT check (prevents race condition)
    return this.db.transaction(async (tx) => {
      try {
        const [review] = await tx.insert(schema.reviews).values({
          bookingId: dto.bookingId,
          reviewerId,
          reviewedId: booking[0].providerId,
          listingId: booking[0].listingId,
          rating: dto.rating,
          comentario: dto.comentario,
        }).returning();

        // Update provider's average rating within the same transaction
        const result = await tx
          .select({ avg: avg(schema.reviews.rating), count: count() })
          .from(schema.reviews)
          .where(eq(schema.reviews.reviewedId, booking[0].providerId));

        const avgRating = result[0]?.avg ?? '0';
        const totalReviews = result[0]?.count ?? 0;

        await tx
          .update(schema.driverProfiles)
          .set({ rating: String(avgRating), totalReviews })
          .where(eq(schema.driverProfiles.userId, booking[0].providerId));

        await tx
          .update(schema.towingProfiles)
          .set({ rating: String(avgRating), totalReviews })
          .where(eq(schema.towingProfiles.userId, booking[0].providerId));

        return review;
      } catch (error: any) {
        // Unique constraint violation on bookingId = duplicate review
        if (error?.code === '23505') {
          throw new ConflictException('Ya dejaste una reseña para esta reserva');
        }
        throw error;
      }
    });
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
}
