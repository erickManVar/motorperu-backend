import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { z } from 'zod';
export declare const CreateDriverProfileSchema: z.ZodObject<{
    licenciaNumero: z.ZodString;
    licenciaCategoria: z.ZodDefault<z.ZodString>;
    zonas: z.ZodArray<z.ZodString, "many">;
    precioHora: z.ZodNumber;
    disponibilidad: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    zonas: string[];
    disponibilidad: Record<string, string[]>;
    licenciaNumero: string;
    licenciaCategoria: string;
    precioHora: number;
}, {
    zonas: string[];
    licenciaNumero: string;
    precioHora: number;
    disponibilidad?: Record<string, string[]> | undefined;
    licenciaCategoria?: string | undefined;
}>;
export declare const RequestDriverSchema: z.ZodObject<{
    ubicacionActual: z.ZodString;
    destino: z.ZodString;
    horaEstimada: z.ZodString;
    distrito: z.ZodString;
}, "strip", z.ZodTypeAny, {
    distrito: string;
    ubicacionActual: string;
    destino: string;
    horaEstimada: string;
}, {
    distrito: string;
    ubicacionActual: string;
    destino: string;
    horaEstimada: string;
}>;
export declare class DriversService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    createOrUpdateProfile(userId: string, dto: z.infer<typeof CreateDriverProfileSchema>): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        zonas: string[] | null;
        disponibilidad: Record<string, string[]> | null;
        licenciaNumero: string | null;
        licenciaCategoria: string | null;
        precioHora: string;
        rating: string | null;
        totalReviews: number | null;
        activo: boolean | null;
    }>;
    findAvailableDrivers(distrito: string): Promise<{
        id: string;
        userId: string;
        zonas: string[] | null;
        precioHora: string;
        rating: string | null;
        disponibilidad: Record<string, string[]> | null;
        nombre: string;
        foto: string | null;
    }[]>;
    getMyProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        zonas: string[] | null;
        disponibilidad: Record<string, string[]> | null;
        licenciaNumero: string | null;
        licenciaCategoria: string | null;
        precioHora: string;
        rating: string | null;
        totalReviews: number | null;
        activo: boolean | null;
    }>;
    toggleAvailability(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        zonas: string[] | null;
        disponibilidad: Record<string, string[]> | null;
        licenciaNumero: string | null;
        licenciaCategoria: string | null;
        precioHora: string;
        rating: string | null;
        totalReviews: number | null;
        activo: boolean | null;
    }>;
}
