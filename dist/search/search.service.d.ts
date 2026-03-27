import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
export declare class SearchService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    search(params: {
        q?: string;
        tipo?: string;
        distrito?: string;
        precioMin?: number;
        precioMax?: number;
        cursor?: string;
        limit?: number;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sellerId: string;
            tipo: "CAR" | "PART" | "SERVICE";
            titulo: string;
            descripcion: string;
            precio: string;
            estado: "ACTIVE" | "INACTIVE" | "SOLD" | "PENDING_REVIEW";
            fotos: string[] | null;
            ubicacion: string | null;
            distrito: string | null;
            departamento: string | null;
            latitud: string | null;
            longitud: string | null;
            searchVector: string | null;
            viewCount: number | null;
            carDetail: never;
            partDetail: never;
            serviceDetail: never;
            seller: never;
        }[];
        nextCursor: string | null;
        total: number;
    }>;
}
