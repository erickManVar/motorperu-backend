import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalUsers: number;
        totalListings: number;
        totalBookings: number;
        completedBookings: number;
        totalRevenue: number;
    }>;
    getPending(): Promise<{
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
    approve(userId: string): Promise<{
        message: string;
    }>;
    suspend(userId: string): Promise<{
        message: string;
    }>;
    getDisputes(): Promise<{
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
    resolveDispute(id: string, body: {
        releaseToClient: boolean;
    }): Promise<{
        message: string;
    }>;
}
