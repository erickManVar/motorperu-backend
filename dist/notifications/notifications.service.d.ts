import { Queue } from 'bullmq';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
interface CreateNotificationDto {
    userId: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    metadata?: Record<string, unknown>;
}
export declare class NotificationsService {
    private db;
    private notifQueue;
    constructor(db: PostgresJsDatabase<typeof schema>, notifQueue: Queue);
    createNotification(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        titulo: string;
        mensaje: string;
        tipo: string;
        leida: boolean | null;
        metadata: unknown;
    }>;
    getMyNotifications(userId: string, cursor?: string, limit?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            userId: string;
            titulo: string;
            mensaje: string;
            tipo: string;
            leida: boolean | null;
            metadata: unknown;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    markAsRead(notifId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
export {};
