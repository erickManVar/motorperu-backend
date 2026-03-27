import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { z } from 'zod';
export declare const CreateReviewSchema: z.ZodObject<{
    bookingId: z.ZodString;
    rating: z.ZodNumber;
    comentario: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rating: number;
    bookingId: string;
    comentario?: string | undefined;
}, {
    rating: number;
    bookingId: string;
    comentario?: string | undefined;
}>;
export declare class ReviewsService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    create(reviewerId: string, dto: z.infer<typeof CreateReviewSchema>): Promise<{
        id: string;
        createdAt: Date;
        listingId: string | null;
        rating: number;
        bookingId: string;
        reviewerId: string;
        reviewedId: string;
        comentario: string | null;
    }>;
    getListingReviews(listingId: string, cursor?: string, limit?: number): Promise<{
        id: string;
        rating: number;
        comentario: string | null;
        createdAt: Date;
        reviewer: {
            nombre: string;
            foto: string | null;
        };
    }[]>;
    private updateProviderRating;
}
