import { BookingsService, CreateBookingSchema } from './bookings.service';
import { AuthUser } from '../auth/auth.service';
import { z } from 'zod';
declare const DisputeSchema: z.ZodObject<{
    razon: z.ZodString;
}, "strip", z.ZodTypeAny, {
    razon: string;
}, {
    razon: string;
}>;
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: AuthUser, body: z.infer<typeof CreateBookingSchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: string;
        estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
        listingId: string;
        clientId: string;
        monto: string;
        comision: string;
        montoProveedor: string;
        escrowId: string | null;
        culqiChargeId: string | null;
        notas: string | null;
        fechaServicio: Date | null;
        autoReleaseAt: Date | null;
        disputaRazon: string | null;
    }>;
    getMyBookings(user: AuthUser, cursor?: string, limit?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            providerId: string;
            estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
            listingId: string;
            clientId: string;
            monto: string;
            comision: string;
            montoProveedor: string;
            escrowId: string | null;
            culqiChargeId: string | null;
            notas: string | null;
            fechaServicio: Date | null;
            autoReleaseAt: Date | null;
            disputaRazon: string | null;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    getProviderBookings(user: AuthUser, cursor?: string, limit?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            providerId: string;
            estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
            listingId: string;
            clientId: string;
            monto: string;
            comision: string;
            montoProveedor: string;
            escrowId: string | null;
            culqiChargeId: string | null;
            notas: string | null;
            fechaServicio: Date | null;
            autoReleaseAt: Date | null;
            disputaRazon: string | null;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    findOne(id: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: string;
        estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
        listingId: string;
        clientId: string;
        monto: string;
        comision: string;
        montoProveedor: string;
        escrowId: string | null;
        culqiChargeId: string | null;
        notas: string | null;
        fechaServicio: Date | null;
        autoReleaseAt: Date | null;
        disputaRazon: string | null;
    }>;
    startService(id: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: string;
        estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
        listingId: string;
        clientId: string;
        monto: string;
        comision: string;
        montoProveedor: string;
        escrowId: string | null;
        culqiChargeId: string | null;
        notas: string | null;
        fechaServicio: Date | null;
        autoReleaseAt: Date | null;
        disputaRazon: string | null;
    }>;
    confirmCompletion(id: string, user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: string;
        estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
        listingId: string;
        clientId: string;
        monto: string;
        comision: string;
        montoProveedor: string;
        escrowId: string | null;
        culqiChargeId: string | null;
        notas: string | null;
        fechaServicio: Date | null;
        autoReleaseAt: Date | null;
        disputaRazon: string | null;
    }>;
    openDispute(id: string, user: AuthUser, body: z.infer<typeof DisputeSchema>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: string;
        estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
        listingId: string;
        clientId: string;
        monto: string;
        comision: string;
        montoProveedor: string;
        escrowId: string | null;
        culqiChargeId: string | null;
        notas: string | null;
        fechaServicio: Date | null;
        autoReleaseAt: Date | null;
        disputaRazon: string | null;
    }>;
}
export {};
