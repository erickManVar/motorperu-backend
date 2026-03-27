import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { FastifyRequest } from 'fastify';
import { BetterAuthService } from './better-auth.service';
export interface AuthUser {
    id: string;
    email: string;
    role: string;
    nombre: string;
}
export declare class AuthService {
    private db;
    private betterAuthService;
    constructor(db: PostgresJsDatabase<typeof schema>, betterAuthService: BetterAuthService);
    validateSession(request: FastifyRequest): Promise<AuthUser | null>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string | null;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
        nombre: string;
        telefono: string | null;
        foto: string | null;
        emailVerified: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
