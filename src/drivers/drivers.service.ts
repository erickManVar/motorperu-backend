import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

export const CreateDriverProfileSchema = z.object({
  licenciaNumero: z.string().min(5).max(20),
  licenciaCategoria: z.string().default('A-IIb'),
  zonas: z.array(z.string()).min(1),
  precioHora: z.number().positive(),
  disponibilidad: z.record(z.array(z.string())).default({}),
});

export const RequestDriverSchema = z.object({
  ubicacionActual: z.string().min(3),
  destino: z.string().min(3),
  horaEstimada: z.string().datetime(),
  distrito: z.string(),
});

@Injectable()
export class DriversService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async createOrUpdateProfile(userId: string, dto: z.infer<typeof CreateDriverProfileSchema>) {
    const existing = await this.db
      .select()
      .from(schema.driverProfiles)
      .where(eq(schema.driverProfiles.userId, userId))
      .limit(1);

    if (existing[0]) {
      const [updated] = await this.db
        .update(schema.driverProfiles)
        .set({
          licenciaNumero: dto.licenciaNumero,
          licenciaCategoria: dto.licenciaCategoria,
          zonas: dto.zonas,
          precioHora: String(dto.precioHora),
          disponibilidad: dto.disponibilidad,
        })
        .where(eq(schema.driverProfiles.userId, userId))
        .returning();
      return updated;
    }

    const [created] = await this.db.insert(schema.driverProfiles).values({
      userId,
      licenciaNumero: dto.licenciaNumero,
      licenciaCategoria: dto.licenciaCategoria,
      zonas: dto.zonas,
      precioHora: String(dto.precioHora),
      disponibilidad: dto.disponibilidad,
      activo: true,
    }).returning();

    return created;
  }

  async findAvailableDrivers(distrito: string) {
    // Find drivers who cover the requested district
    const drivers = await this.db
      .select({
        id: schema.driverProfiles.id,
        userId: schema.driverProfiles.userId,
        zonas: schema.driverProfiles.zonas,
        precioHora: schema.driverProfiles.precioHora,
        rating: schema.driverProfiles.rating,
        disponibilidad: schema.driverProfiles.disponibilidad,
        nombre: schema.users.nombre,
        foto: schema.users.foto,
      })
      .from(schema.driverProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.driverProfiles.userId))
      .where(
        and(
          eq(schema.driverProfiles.activo, true),
          sql`${schema.driverProfiles.zonas} @> ${JSON.stringify([distrito])}::jsonb`,
        ),
      );

    return drivers;
  }

  async getMyProfile(userId: string) {
    const profile = await this.db
      .select()
      .from(schema.driverProfiles)
      .where(eq(schema.driverProfiles.userId, userId))
      .limit(1);

    if (!profile[0]) throw new NotFoundException('Perfil de chofer no encontrado');
    return profile[0];
  }

  async toggleAvailability(userId: string) {
    const profile = await this.db
      .select()
      .from(schema.driverProfiles)
      .where(eq(schema.driverProfiles.userId, userId))
      .limit(1);

    if (!profile[0]) throw new NotFoundException('Perfil no encontrado');

    const [updated] = await this.db
      .update(schema.driverProfiles)
      .set({ activo: !profile[0].activo })
      .where(eq(schema.driverProfiles.userId, userId))
      .returning();

    return updated;
  }
}
