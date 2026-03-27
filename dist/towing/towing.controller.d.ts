import { TowingService, CreateTowingProfileSchema } from './towing.service';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
export declare class TowingController {
    private towingService;
    constructor(towingService: TowingService);
    findAvailable(distrito: string, tipo: string): Promise<{
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
    getMyProfile(user: AuthUser): Promise<{
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
    createOrUpdateProfile(user: AuthUser, body: z.infer<typeof CreateTowingProfileSchema>): Promise<{
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
