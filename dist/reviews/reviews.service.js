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
exports.ReviewsService = exports.CreateReviewSchema = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
exports.CreateReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comentario: zod_1.z.string().max(2000).optional(),
});
let ReviewsService = class ReviewsService {
    constructor(db) {
        this.db = db;
    }
    async create(reviewerId, dto) {
        const booking = await this.db
            .select()
            .from(schema.bookings)
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, dto.bookingId))
            .limit(1);
        if (!booking[0])
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (booking[0].clientId !== reviewerId)
            throw new common_1.ForbiddenException('Solo el cliente puede dejar reseña');
        if (booking[0].estado !== 'COMPLETED')
            throw new common_1.BadRequestException('Solo puedes reseñar servicios completados');
        const existing = await this.db
            .select()
            .from(schema.reviews)
            .where((0, drizzle_orm_1.eq)(schema.reviews.bookingId, dto.bookingId))
            .limit(1);
        if (existing[0])
            throw new common_1.BadRequestException('Ya dejaste una reseña para esta reserva');
        const [review] = await this.db.insert(schema.reviews).values({
            bookingId: dto.bookingId,
            reviewerId,
            reviewedId: booking[0].providerId,
            listingId: booking[0].listingId,
            rating: dto.rating,
            comentario: dto.comentario,
        }).returning();
        await this.updateProviderRating(booking[0].providerId);
        return review;
    }
    async getListingReviews(listingId, cursor, limit = 20) {
        const reviews = await this.db
            .select({
            id: schema.reviews.id,
            rating: schema.reviews.rating,
            comentario: schema.reviews.comentario,
            createdAt: schema.reviews.createdAt,
            reviewer: { nombre: schema.users.nombre, foto: schema.users.foto },
        })
            .from(schema.reviews)
            .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.users.id, schema.reviews.reviewerId))
            .where((0, drizzle_orm_1.eq)(schema.reviews.listingId, listingId))
            .orderBy((0, drizzle_orm_1.desc)(schema.reviews.createdAt))
            .limit(limit);
        return reviews;
    }
    async updateProviderRating(providerId) {
        const result = await this.db
            .select({ avg: (0, drizzle_orm_1.avg)(schema.reviews.rating), count: (0, drizzle_orm_1.count)() })
            .from(schema.reviews)
            .where((0, drizzle_orm_1.eq)(schema.reviews.reviewedId, providerId));
        const avgRating = result[0]?.avg ?? '0';
        const totalReviews = result[0]?.count ?? 0;
        await this.db
            .update(schema.driverProfiles)
            .set({ rating: String(avgRating), totalReviews })
            .where((0, drizzle_orm_1.eq)(schema.driverProfiles.userId, providerId));
        await this.db
            .update(schema.towingProfiles)
            .set({ rating: String(avgRating), totalReviews })
            .where((0, drizzle_orm_1.eq)(schema.towingProfiles.userId, providerId));
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map