import { UsersService, UpdateProfileSchema } from './users.service';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
declare const ChangeRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["SELLER", "PROVIDER", "BUYER"]>;
}, "strip", z.ZodTypeAny, {
    role: "BUYER" | "SELLER" | "PROVIDER";
}, {
    role: "BUYER" | "SELLER" | "PROVIDER";
}>;
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: AuthUser): Promise<{
        id: string;
        email: string;
        nombre: string;
        telefono: string | null;
        foto: string | null;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
        emailVerified: boolean | null;
        createdAt: Date;
    }>;
    updateProfile(user: AuthUser, body: z.infer<typeof UpdateProfileSchema>): Promise<{
        id: string;
        email: string;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
        nombre: string;
        telefono: string | null;
        foto: string | null;
    }>;
    changeRole(user: AuthUser, body: z.infer<typeof ChangeRoleSchema>): Promise<{
        id: string;
        role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN";
    }>;
}
export {};
