import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(q?: string, tipo?: string, distrito?: string, precioMin?: string, precioMax?: string, cursor?: string, limit?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sellerId: string;
            tipo: "CAR" | "PART" | "SERVICE";
            titulo: string;
            descripcion: string;
            precio: string;
            estado: "ACTIVE" | "INACTIVE" | "SOLD" | "PENDING_REVIEW";
            fotos: string[] | null;
            ubicacion: string | null;
            distrito: string | null;
            departamento: string | null;
            latitud: string | null;
            longitud: string | null;
            searchVector: string | null;
            viewCount: number | null;
            carDetail: never;
            partDetail: never;
            serviceDetail: never;
            seller: never;
        }[];
        nextCursor: string | null;
        total: number;
    }>;
}
