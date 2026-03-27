import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { z } from 'zod';
export declare const CreateTowingProfileSchema: z.ZodObject<{
    nombreEmpresa: z.ZodOptional<z.ZodString>;
    zonas: z.ZodArray<z.ZodString, "many">;
    servicios: z.ZodArray<z.ZodObject<{
        tipo: z.ZodEnum<["GRUA", "BATERIA", "LLANTA", "COMBUSTIBLE", "OTRO"]>;
        precioBase: z.ZodNumber;
        precioPorKm: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tipo: "GRUA" | "OTRO" | "BATERIA" | "LLANTA" | "COMBUSTIBLE";
        precioBase: number;
        precioPorKm?: number | undefined;
    }, {
        tipo: "GRUA" | "OTRO" | "BATERIA" | "LLANTA" | "COMBUSTIBLE";
        precioBase: number;
        precioPorKm?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    zonas: string[];
    servicios: {
        tipo: "GRUA" | "OTRO" | "BATERIA" | "LLANTA" | "COMBUSTIBLE";
        precioBase: number;
        precioPorKm?: number | undefined;
    }[];
    nombreEmpresa?: string | undefined;
}, {
    zonas: string[];
    servicios: {
        tipo: "GRUA" | "OTRO" | "BATERIA" | "LLANTA" | "COMBUSTIBLE";
        precioBase: number;
        precioPorKm?: number | undefined;
    }[];
    nombreEmpresa?: string | undefined;
}>;
export declare const RequestTowingSchema: z.ZodObject<{
    latitud: z.ZodNumber;
    longitud: z.ZodNumber;
    distrito: z.ZodString;
    tipoServicio: z.ZodEnum<["GRUA", "BATERIA", "LLANTA", "COMBUSTIBLE", "OTRO"]>;
    descripcion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    distrito: string;
    latitud: number;
    longitud: number;
    tipoServicio: "GRUA" | "OTRO" | "BATERIA" | "LLANTA" | "COMBUSTIBLE";
    descripcion?: string | undefined;
}, {
    distrito: string;
    latitud: number;
    longitud: number;
    tipoServicio: "GRUA" | "OTRO" | "BATERIA" | "LLANTA" | "COMBUSTIBLE";
    descripcion?: string | undefined;
}>;
export declare class TowingService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    createOrUpdateProfile(userId: string, dto: z.infer<typeof CreateTowingProfileSchema>): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        zonas: string[] | null;
        rating: string | null;
        totalReviews: number | null;
        activo: boolean | null;
        nombreEmpresa: string | null;
        servicios: {
            tipo: string;
            precioBase: number;
            precioPorKm?: number;
        }[] | null;
    }>;
    findAvailableInDistrict(distrito: string, tipoServicio: string): Promise<{
        id: string;
        userId: string;
        nombreEmpresa: string | null;
        zonas: string[] | null;
        servicios: {
            tipo: string;
            precioBase: number;
            precioPorKm?: number;
        }[] | null;
        rating: string | null;
        nombre: string;
        foto: string | null;
    }[]>;
    calculatePrice(providerServicio: {
        precioBase: number;
        precioPorKm?: number;
    }, distanciaKm: number): number;
    getMyProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        zonas: string[] | null;
        rating: string | null;
        totalReviews: number | null;
        activo: boolean | null;
        nombreEmpresa: string | null;
        servicios: {
            tipo: string;
            precioBase: number;
            precioPorKm?: number;
        }[] | null;
    }>;
}
