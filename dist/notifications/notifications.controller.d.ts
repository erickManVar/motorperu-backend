import { NotificationsService } from './notifications.service';
import { AuthUser } from '../auth/auth.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(user: AuthUser, cursor?: string, limit?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            userId: string;
            tipo: string;
            titulo: string;
            mensaje: string;
            leida: boolean | null;
            metadata: unknown;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    markAsRead(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
}
