import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { z } from 'zod';
export declare const UpdateProfileSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    foto: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    telefono?: string | undefined;
    foto?: string | undefined;
}, {
    nombre?: string | undefined;
    telefono?: string | undefined;
    foto?: string | undefined;
}>;
export declare class UsersService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        nombre: string;
        telefono: string | null;
        foto: string | null;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
        emailVerified: boolean | null;
        createdAt: Date;
    }>;
    updateProfile(userId: string, data: z.infer<typeof UpdateProfileSchema>): Promise<{
        id: string;
        email: string;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
        nombre: string;
        telefono: string | null;
        foto: string | null;
    }>;
    changeRole(userId: string, newRole: 'SELLER' | 'PROVIDER' | 'BUYER'): Promise<{
        id: string;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
    }>;
}
