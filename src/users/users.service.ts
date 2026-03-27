import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  telefono: z.string().regex(/^\+51\d{9}$/, 'Telefono debe ser formato +51XXXXXXXXX').optional(),
  foto: z.string().url().optional(),
});

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async getProfile(userId: string) {
    const user = await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        nombre: schema.users.nombre,
        telefono: schema.users.telefono,
        foto: schema.users.foto,
        role: schema.users.role,
        emailVerified: schema.users.emailVerified,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user[0]) throw new NotFoundException('Usuario no encontrado');
    return user[0];
  }

  async updateProfile(userId: string, data: z.infer<typeof UpdateProfileSchema>) {
    const updated = await this.db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        nombre: schema.users.nombre,
        telefono: schema.users.telefono,
        foto: schema.users.foto,
        role: schema.users.role,
      });

    if (!updated[0]) throw new NotFoundException('Usuario no encontrado');
    return updated[0];
  }

  async changeRole(userId: string, newRole: 'SELLER' | 'PROVIDER' | 'BUYER') {
    const updated = await this.db
      .update(schema.users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning({ id: schema.users.id, role: schema.users.role });

    if (!updated[0]) throw new NotFoundException('Usuario no encontrado');
    return updated[0];
  }
}
