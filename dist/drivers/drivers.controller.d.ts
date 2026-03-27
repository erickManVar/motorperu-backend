import { DriversService, CreateDriverProfileSchema } from './drivers.service';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
export declare class DriversController {
    private driversService;
    constructor(driversService: DriversService);
    findAvailable(distrito: string): Promise<{
        id: string;
        userId: string;
        zonas: string[] | null;
        precioHora: string;
        rating: string | null;
        disponibilidad: Record<string, string[]> | null;
        nombre: string;
        foto: string | null;
    }[]>;
    getMyProfile(user: AuthUser): Promise<{
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
    createOrUpdateProfile(user: AuthUser, body: z.infer<typeof CreateDriverProfileSchema>): Promise<{
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
    toggleAvailability(user: AuthUser): Promise<{
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
