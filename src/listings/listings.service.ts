import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import {
  and,
  eq,
  lt,
  gte,
  lte,
  sql,
  desc,
} from 'drizzle-orm';
import {
  CreateCarListingDto,
  CreatePartListingDto,
  CreateServiceListingDto,
  UpdateListingDto,
  ListingsQueryDto,
} from './listings.schemas';

@Injectable()
export class ListingsService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) {}

  async createCar(sellerId: string, dto: CreateCarListingDto) {
    const listingId = crypto.randomUUID();

    return this.db.transaction(async (tx) => {
      const [listing] = await tx.insert(schema.listings).values({
        id: listingId,
        sellerId,
        tipo: 'CAR',
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        precio: String(dto.precio),
        fotos: dto.fotos,
        ubicacion: dto.ubicacion,
        distrito: dto.distrito,
        departamento: dto.departamento,
        latitud: dto.latitud != null ? String(dto.latitud) : undefined,
        longitud: dto.longitud != null ? String(dto.longitud) : undefined,
        estado: 'PENDING_REVIEW',
      }).returning();

      await tx.insert(schema.carDetails).values({
        listingId,
        marca: dto.marca,
        modelo: dto.modelo,
        anio: dto.anio,
        kilometraje: dto.kilometraje,
        combustible: dto.combustible,
        transmision: dto.transmision,
        color: dto.color,
        condicion: dto.condicion,
        numeroPuertas: dto.numeroPuertas,
        motor: dto.motor,
        vin: dto.vin,
      });

      await tx.execute(
        sql`UPDATE listings SET search_vector = to_tsvector('spanish', ${dto.titulo} || ' ' || ${dto.descripcion}) WHERE id = ${listingId}`,
      );

      return listing;
    });
  }

  async createPart(sellerId: string, dto: CreatePartListingDto) {
    const listingId = crypto.randomUUID();

    return this.db.transaction(async (tx) => {
      const [listing] = await tx.insert(schema.listings).values({
        id: listingId,
        sellerId,
        tipo: 'PART',
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        precio: String(dto.precio),
        fotos: dto.fotos,
        ubicacion: dto.ubicacion,
        distrito: dto.distrito,
        departamento: dto.departamento,
        estado: 'PENDING_REVIEW',
      }).returning();

      await tx.insert(schema.partDetails).values({
        listingId,
        marcaCompatible: dto.marcaCompatible,
        modeloCompatible: dto.modeloCompatible,
        anioDesde: dto.anioDesde,
        anioHasta: dto.anioHasta,
        condicion: dto.condicion,
        stock: dto.stock,
        numeroParte: dto.numeroParte,
        peso: dto.peso != null ? String(dto.peso) : undefined,
      });

      await tx.execute(
        sql`UPDATE listings SET search_vector = to_tsvector('spanish', ${dto.titulo} || ' ' || ${dto.descripcion}) WHERE id = ${listingId}`,
      );

      return listing;
    });
  }

  async createService(sellerId: string, dto: CreateServiceListingDto) {
    const listingId = crypto.randomUUID();

    return this.db.transaction(async (tx) => {
      const [listing] = await tx.insert(schema.listings).values({
        id: listingId,
        sellerId,
        tipo: 'SERVICE',
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        precio: String(dto.precio),
        fotos: dto.fotos,
        ubicacion: dto.ubicacion,
        distrito: dto.distrito,
        departamento: dto.departamento,
        estado: 'PENDING_REVIEW',
      }).returning();

      await tx.insert(schema.serviceDetails).values({
        listingId,
        tipoServicio: dto.tipoServicio,
        tiempoEstimado: dto.tiempoEstimado,
        zonas: dto.zonas,
        disponibilidad: dto.disponibilidad,
        precioBase: dto.precioBase != null ? String(dto.precioBase) : undefined,
        incluyeDesplazamiento: dto.incluyeDesplazamiento,
      });

      await tx.execute(
        sql`UPDATE listings SET search_vector = to_tsvector('spanish', ${dto.titulo} || ' ' || ${dto.descripcion}) WHERE id = ${listingId}`,
      );

      return listing;
    });
  }

  async findAll(query: ListingsQueryDto) {
    const conditions = [eq(schema.listings.estado, 'ACTIVE')];

    if (query.tipo) conditions.push(eq(schema.listings.tipo, query.tipo));
    if (query.distrito) conditions.push(eq(schema.listings.distrito, query.distrito));
    if (query.departamento) conditions.push(eq(schema.listings.departamento, query.departamento));
    if (query.precioMin) conditions.push(gte(schema.listings.precio, String(query.precioMin)));
    if (query.precioMax) conditions.push(lte(schema.listings.precio, String(query.precioMax)));
    if (query.cursor) conditions.push(lt(schema.listings.createdAt, new Date(query.cursor)));

    if (query.q) {
      conditions.push(
        sql`${schema.listings.searchVector} @@ plainto_tsquery('spanish', ${query.q})`,
      );
    }

    const listings = await this.db
      .select({
        id: schema.listings.id,
        tipo: schema.listings.tipo,
        titulo: schema.listings.titulo,
        descripcion: schema.listings.descripcion,
        precio: schema.listings.precio,
        fotos: schema.listings.fotos,
        distrito: schema.listings.distrito,
        estado: schema.listings.estado,
        viewCount: schema.listings.viewCount,
        createdAt: schema.listings.createdAt,
        sellerId: schema.listings.sellerId,
      })
      .from(schema.listings)
      .where(and(...conditions))
      .orderBy(desc(schema.listings.createdAt))
      .limit(query.limit + 1);

    const hasMore = listings.length > query.limit;
    const items = hasMore ? listings.slice(0, query.limit) : listings;

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null,
    };
  }

  async findOne(id: string) {
    // Single relational query instead of N+1
    const result = await this.db.query.listings.findFirst({
      where: eq(schema.listings.id, id),
      with: { carDetail: true, partDetail: true, serviceDetail: true },
    });

    if (!result) throw new NotFoundException('Listing no encontrado');

    // Increment view count (fire and forget)
    this.db
      .update(schema.listings)
      .set({ viewCount: sql`${schema.listings.viewCount} + 1` })
      .where(eq(schema.listings.id, id))
      .then(() => {})
      .catch(() => {});

    const { carDetail, partDetail, serviceDetail, ...listing } = result;
    const details = carDetail ?? partDetail ?? serviceDetail ?? null;

    return { ...listing, details };
  }

  async update(id: string, sellerId: string, dto: UpdateListingDto) {
    const listing = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, id))
      .limit(1);

    if (!listing[0]) throw new NotFoundException('Listing no encontrado');
    if (listing[0].sellerId !== sellerId) throw new ForbiddenException('No tienes permiso para editar este listing');

    const [updated] = await this.db
      .update(schema.listings)
      .set({ ...dto, precio: dto.precio ? String(dto.precio) : undefined, updatedAt: new Date() })
      .where(eq(schema.listings.id, id))
      .returning();

    if (dto.titulo || dto.descripcion) {
      await this.db.execute(
        sql`UPDATE listings SET search_vector = to_tsvector('spanish', ${dto.titulo ?? listing[0].titulo} || ' ' || ${dto.descripcion ?? listing[0].descripcion}) WHERE id = ${id}`,
      );
    }

    return updated;
  }

  async remove(id: string, sellerId: string, role: string) {
    const listing = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, id))
      .limit(1);

    if (!listing[0]) throw new NotFoundException('Listing no encontrado');
    if (listing[0].sellerId !== sellerId && role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permiso para eliminar este listing');
    }

    await this.db.delete(schema.listings).where(eq(schema.listings.id, id));
    return { success: true };
  }

  async getMyListings(sellerId: string, cursor?: string, limit = 20) {
    const conditions = [eq(schema.listings.sellerId, sellerId)];
    if (cursor) conditions.push(lt(schema.listings.createdAt, new Date(cursor)));

    const listings = await this.db
      .select()
      .from(schema.listings)
      .where(and(...conditions))
      .orderBy(desc(schema.listings.createdAt))
      .limit(limit + 1);

    const hasMore = listings.length > limit;
    const items = hasMore ? listings.slice(0, limit) : listings;

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null,
    };
  }
}
