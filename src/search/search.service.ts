import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql, and, eq, gte, lte, ilike } from 'drizzle-orm';
import * as schema from '../database/schema';

@Injectable()
export class SearchService {
  constructor(@Inject('DRIZZLE') private db: PostgresJsDatabase<typeof schema>) {}

  async search(params: {
    q?: string;
    tipo?: string;
    distrito?: string;
    precioMin?: number;
    precioMax?: number;
    cursor?: string;
    limit?: number;
  }) {
    const { q, tipo, distrito, precioMin, precioMax, cursor, limit = 20 } = params;
    const conditions: any[] = [eq(schema.listings.estado, 'ACTIVE')];

    if (tipo) conditions.push(eq(schema.listings.tipo, tipo as any));
    if (distrito) conditions.push(ilike(schema.listings.ubicacion, `%${distrito}%`));
    if (precioMin) conditions.push(gte(schema.listings.precio, precioMin.toString()));
    if (precioMax) conditions.push(lte(schema.listings.precio, precioMax.toString()));
    if (q) {
      conditions.push(
        sql`to_tsvector('spanish', ${schema.listings.titulo} || ' ' || ${schema.listings.descripcion}) @@ plainto_tsquery('spanish', ${q})`
      );
    }

    const results = await this.db.query.listings.findMany({
      where: and(...conditions),
      with: { seller: { columns: { passwordHash: false } }, carDetail: true, partDetail: true, serviceDetail: true },
      limit: limit + 1,
      orderBy: (l, { desc }) => [desc(l.createdAt)],
    });

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
      total: items.length,
    };
  }
}
