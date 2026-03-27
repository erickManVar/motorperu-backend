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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../database/schema"));
let AdminService = class AdminService {
    constructor(db) {
        this.db = db;
    }
    async getPendingVerifications() {
        return this.db.query.providerVerifications.findMany({
            where: (0, drizzle_orm_1.eq)(schema.providerVerifications.estado, 'PENDING'),
            with: { user: { columns: { passwordHash: false } } },
        });
    }
    async approveProvider(userId) {
        await this.db
            .update(schema.providerVerifications)
            .set({ estado: 'VERIFIED' })
            .where((0, drizzle_orm_1.eq)(schema.providerVerifications.userId, userId));
        return { message: 'Provider verified' };
    }
    async suspendProvider(userId) {
        await this.db
            .update(schema.providerVerifications)
            .set({ estado: 'SUSPENDED' })
            .where((0, drizzle_orm_1.eq)(schema.providerVerifications.userId, userId));
        return { message: 'Provider suspended' };
    }
    async getDisputedBookings() {
        return this.db.query.bookings.findMany({
            where: (0, drizzle_orm_1.eq)(schema.bookings.estado, 'DISPUTED'),
            with: { client: { columns: { passwordHash: false } }, listing: true },
        });
    }
    async resolveDispute(bookingId, releaseToClient) {
        const estado = releaseToClient ? 'REFUNDED' : 'COMPLETED';
        await this.db
            .update(schema.bookings)
            .set({ estado: estado })
            .where((0, drizzle_orm_1.eq)(schema.bookings.id, bookingId));
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE')),
    __metadata("design:paramtypes", [Object])
], AdminService);
//# sourceMappingURL=admin.service.js.map