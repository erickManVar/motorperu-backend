import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { and, desc, eq, lt } from 'drizzle-orm';

interface CreateNotificationDto {
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    @InjectQueue('notifications') private notifQueue: Queue,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    const [notif] = await this.db.insert(schema.notifications).values({
      userId: dto.userId,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      tipo: dto.tipo,
      metadata: dto.metadata,
    }).returning();

    // Queue for email/push
    await this.notifQueue.add('send', {
      notificationId: notif?.id,
      ...dto,
    }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

    return notif;
  }

  async getMyNotifications(userId: string, cursor?: string, limit = 20) {
    const conditions = [eq(schema.notifications.userId, userId)];
    if (cursor) conditions.push(lt(schema.notifications.createdAt, new Date(cursor)));

    const notifs = await this.db
      .select()
      .from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit + 1);

    const hasMore = notifs.length > limit;
    const items = hasMore ? notifs.slice(0, limit) : notifs;
    return { items, hasMore, nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null };
  }

  async markAsRead(notifId: string, userId: string) {
    await this.db
      .update(schema.notifications)
      .set({ leida: true })
      .where(and(eq(schema.notifications.id, notifId), eq(schema.notifications.userId, userId)));
    return { success: true };
  }
}
