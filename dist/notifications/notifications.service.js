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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
let NotificationsService = class NotificationsService {
    constructor(db, notifQueue) {
        this.db = db;
        this.notifQueue = notifQueue;
    }
    async createNotification(dto) {
        const [notif] = await this.db.insert(schema.notifications).values({
            userId: dto.userId,
            titulo: dto.titulo,
            mensaje: dto.mensaje,
            tipo: dto.tipo,
            metadata: dto.metadata,
        }).returning();
        await this.notifQueue.add('send', {
            notificationId: notif?.id,
            ...dto,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
        return notif;
    }
    async getMyNotifications(userId, cursor, limit = 20) {
        const conditions = [(0, drizzle_orm_1.eq)(schema.notifications.userId, userId)];
        if (cursor)
            conditions.push((0, drizzle_orm_1.lt)(schema.notifications.createdAt, new Date(cursor)));
        const notifs = await this.db
            .select()
            .from(schema.notifications)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema.notifications.createdAt))
            .limit(limit + 1);
        const hasMore = notifs.length > limit;
        const items = hasMore ? notifs.slice(0, limit) : notifs;
        return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null };
    }
    async markAsRead(notifId, userId) {
        await this.db
            .update(schema.notifications)
            .set({ leida: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.notifications.id, notifId), (0, drizzle_orm_1.eq)(schema.notifications.userId, userId)));
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __param(1, (0, bullmq_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [Object, bullmq_2.Queue])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map