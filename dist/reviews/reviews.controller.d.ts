import { ReviewsService, CreateReviewSchema } from './reviews.service';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    getListingReviews(listingId: string, cursor?: string): Promise<{
        id: string;
        rating: number;
        comentario: string | null;
        createdAt: Date;
        reviewer: {
            nombre: string;
            foto: string | null;
        };
    }[]>;
    create(user: AuthUser, body: z.infer<typeof CreateReviewSchema>): Promise<{
        id: string;
        createdAt: Date;
        listingId: string | null;
        rating: number;
        bookingId: string;
        reviewerId: string;
        reviewedId: string;
        comentario: string | null;
    }>;
}
