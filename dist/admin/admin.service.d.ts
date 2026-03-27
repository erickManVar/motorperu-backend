import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
export declare class AdminService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getPendingVerifications(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        estado: "PENDING" | "VERIFIED" | "SUSPENDED";
        tipoDocumento: string;
        numeroDocumento: string;
        fotoDocumento: string | null;
        fotoSelfie: string | null;
        adminNotes: string | null;
        revisadoPor: string | null;
        user: never;
    }[]>;
    approveProvider(userId: string): Promise<{
        message: string;
    }>;
    suspendProvider(userId: string): Promise<{
        message: string;
    }>;
    getDisputedBookings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string;
        notas: string | null;
        fechaServicio: Date | null;
        clientId: string;
        estado: "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "DISPUTED" | "CANCELLED" | "REFUNDED";
        providerId: string;
        monto: string;
        comision: string;
        montoProveedor: string;
        escrowId: string | null;
        culqiChargeId: string | null;
        autoReleaseAt: Date | null;
        disputaRazon: string | null;
        listing: never;
        client: never;
    }[]>;
    resolveDispute(bookingId: string, releaseToClient: boolean): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        totalListings: number;
        totalBookings: number;
        completedBookings: number;
        totalRevenue: number;
    }>;
}
