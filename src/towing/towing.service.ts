import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

export const CreateTowingProfileSchema = z.object({
  nombreEmpresa: z.string().optional(),
  zonas: z.array(z.string()).min(1),
  servicios: z.array(z.object({
    tipo: z.enum(['GRUA', 'BATERIA', 'LLANTA', 'COMBUSTIBLE', 'OTRO']),
    precioBase: z.number().positive(),
    precioPorKm: z.number().positive().optional(),
  })),
});

export const RequestTowingSchema = z.object({
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  distrito: z.string(),
  tipoServicio: z.enum(['GRUA', 'BATERIA', 'LLANTA', 'COMBUSTIBLE', 'OTRO']),
  descripcion: z.string().optional(),
});

@Injectable()
export class TowingService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async createOrUpdateProfile(userId: string, dto: z.infer<typeof CreateTowingProfileSchema>) {
    const existing = await this.db
      .select()
      .from(schema.towingProfiles)
      .where(eq(schema.towingProfiles.userId, userId))
      .limit(1);

    const data = {
      nombreEmpresa: dto.nombreEmpresa,
      zonas: dto.zonas,
      servicios: dto.servicios,
      activo: true,
    };

    if (existing[0]) {
      const [updated] = await this.db
        .update(schema.towingProfiles)
        .set(data)
        .where(eq(schema.towingProfiles.userId, userId))
        .returning();
      return updated;
    }

    const [created] = await this.db.insert(schema.towingProfiles).values({ userId, ...data }).returning();
    return created;
  }

  async findAvailableInDistrict(distrito: string, tipoServicio: string) {
    const providers = await this.db
      .select({
        id: schema.towingProfiles.id,
        userId: schema.towingProfiles.userId,
        nombreEmpresa: schema.towingProfiles.nombreEmpresa,
        zonas: schema.towingProfiles.zonas,
        servicios: schema.towingProfiles.servicios,
        rating: schema.towingProfiles.rating,
        nombre: schema.users.nombre,
        foto: schema.users.foto,
      })
      .from(schema.towingProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.towingProfiles.userId))
      .where(
        and(
          eq(schema.towingProfiles.activo, true),
          sql`${schema.towingProfiles.zonas} @> ${JSON.stringify([distrito])}::jsonb`,
        ),
      );

    // Filter by service type in application layer
    return providers.filter((p) =>
      (p.servicios as Array<{ tipo: string }>).some((s) => s.tipo === tipoServicio),
    );
  }

  calculatePrice(providerServicio: { precioBase: number; precioPorKm?: number }, distanciaKm: number): number {
    const base = providerServicio.precioBase;
    const kmCost = (providerServicio.precioPorKm ?? 0) * distanciaKm;
    return base + kmCost;
  }

  async getMyProfile(userId: string) {
    const profile = await this.db
      .select()
      .from(schema.towingProfiles)
      .where(eq(schema.towingProfiles.userId, userId))
      .limit(1);

    if (!profile[0]) throw new NotFoundException('Perfil de grúa no encontrado');
    return profile[0];
  }
}
