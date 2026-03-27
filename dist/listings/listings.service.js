"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
let ListingsService = class ListingsService {
    constructor(db) {
        this.db = db;
    }
    async createCar(sellerId, dto) {
        const listingId = crypto.randomUUID();
        const [listing] = await this.db.insert(schema.listings).values({
            id: listingId,
            sellerId,
            tipo: 'CAR',
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            precio: String(dto.precio),
            fotos: dto.fotos,
            ubicacion: dto.ubicacion,
            distrito: dto.distrito,
            departamento: dto.departamento,
            latitud: dto.latitud != null ? String(dto.latitud) : undefined,
            longitud: dto.longitud != null ? String(dto.longitud) : undefined,
            estado: 'PENDING_REVIEW',
        }).returning();
        await this.db.insert(schema.carDetails).values({
            listingId,
            marca: dto.marca,
            modelo: dto.modelo,
            anio: dto.anio,
            kilometraje: dto.kilometraje,
            combustible: dto.combustible,
            transmision: dto.transmision,
            color: dto.color,
            condicion: dto.condicion,
            numeroPuertas: dto.numeroPuertas,
            motor: dto.motor,
            vin: dto.vin,
        });
        await this.updateSearchVector(listingId, dto.titulo, dto.descripcion);
        return listing;
    }
    async createPart(sellerId, dto) {
        const listingId = crypto.randomUUID();
        const [listing] = await this.db.insert(schema.listings).values({
            id: listingId,
            sellerId,
            tipo: 'PART',
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            precio: String(dto.precio),
            fotos: dto.fotos,
            ubicacion: dto.ubicacion,
            distrito: dto.distrito,
            departamento: dto.departamento,
            estado: 'PENDING_REVIEW',
        }).returning();
        await this.db.insert(schema.partDetails).values({
            listingId,
            marcaCompatible: dto.marcaCompatible,
            modeloCompatible: dto.modeloCompatible,
            anioDesde: dto.anioDesde,
            anioHasta: dto.anioHasta,
            condicion: dto.condicion,
            stock: dto.stock,
            numeroParte: dto.numeroParte,
            peso: dto.peso != null ? String(dto.peso) : undefined,
        });
        await this.updateSearchVector(listingId, dto.titulo, dto.descripcion);
        return listing;
    }
    async createService(sellerId, dto) {
        const listingId = crypto.randomUUID();
        const [listing] = await this.db.insert(schema.listings).values({
            id: listingId,
            sellerId,
            tipo: 'SERVICE',
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            precio: String(dto.precio),
            fotos: dto.fotos,
            ubicacion: dto.ubicacion,
            distrito: dto.distrito,
            departamento: dto.departamento,
            estado: 'PENDING_REVIEW',
        }).returning();
        await this.db.insert(schema.serviceDetails).values({
            listingId,
            tipoServicio: dto.tipoServicio,
            tiempoEstimado: dto.tiempoEstimado,
            zonas: dto.zonas,
            disponibilidad: dto.disponibilidad,
            precioBase: dto.precioBase != null ? String(dto.precioBase) : undefined,
            incluyeDesplazamiento: dto.incluyeDesplazamiento,
        });
        await this.updateSearchVector(listingId, dto.titulo, dto.descripcion);
        return listing;
    }
    async findAll(query) {
        const conditions = [(0, drizzle_orm_1.eq)(schema.listings.estado, 'ACTIVE')];
        if (query.tipo)
            conditions.push((0, drizzle_orm_1.eq)(schema.listings.tipo, query.tipo));
        if (query.distrito)
            conditions.push((0, drizzle_orm_1.eq)(schema.listings.distrito, query.distrito));
        if (query.departamento)
            conditions.push((0, drizzle_orm_1.eq)(schema.listings.departamento, query.departamento));
        if (query.precioMin)
            conditions.push((0, drizzle_orm_1.gte)(schema.listings.precio, String(query.precioMin)));
        if (query.precioMax)
            conditions.push((0, drizzle_orm_1.lte)(schema.listings.precio, String(query.precioMax)));
        if (query.cursor)
            conditions.push((0, drizzle_orm_1.lt)(schema.listings.createdAt, new Date(query.cursor)));
        if (query.q) {
            conditions.push((0, drizzle_orm_1.sql) `${schema.listings.searchVector} @@ plainto_tsquery('spanish', ${query.q})`);
        }
        const listings = await this.db
            .select({
            id: schema.listings.id,
            tipo: schema.listings.tipo,
            titulo: schema.listings.titulo,
            descripcion: schema.listings.descripcion,
            precio: schema.listings.precio,
            fotos: schema.listings.fotos,
            distrito: schema.listings.distrito,
            estado: schema.listings.estado,
            viewCount: schema.listings.viewCount,
            createdAt: schema.listings.createdAt,
            sellerId: schema.listings.sellerId,
        })
            .from(schema.listings)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema.listings.createdAt))
            .limit(query.limit + 1);
        const hasMore = listings.length > query.limit;
        const items = hasMore ? listings.slice(0, query.limit) : listings;
        return {
            items,
            hasMore,
            nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null,
        };
    }
    async findOne(id) {
        const listing = await this.db
            .select()
            .from(schema.listings)
            .where((0, drizzle_orm_1.eq)(schema.listings.id, id))
            .limit(1);
        if (!listing[0])
            throw new common_1.NotFoundException('Listing no encontrado');
        await this.db
            .update(schema.listings)
            .set({ viewCount: (0, drizzle_orm_1.sql) `${schema.listings.viewCount} + 1` })
            .where((0, drizzle_orm_1.eq)(schema.listings.id, id));
        let details = null;
        if (listing[0].tipo === 'CAR') {
            const car = await this.db
                .select()
                .from(schema.carDetails)
                .where((0, drizzle_orm_1.eq)(schema.carDetails.listingId, id))
                .limit(1);
            details = car[0] ?? null;
        }
        else if (listing[0].tipo === 'PART') {
            const part = await this.db
                .select()
                .from(schema.partDetails)
                .where((0, drizzle_orm_1.eq)(schema.partDetails.listingId, id))
                .limit(1);
            details = part[0] ?? null;
        }
        else if (listing[0].tipo === 'SERVICE') {
            const service = await this.db
                .select()
                .from(schema.serviceDetails)
                .where((0, drizzle_orm_1.eq)(schema.serviceDetails.listingId, id))
                .limit(1);
            details = service[0] ?? null;
        }
        return { ...listing[0], details };
    }
    async update(id, sellerId, dto) {
        const listing = await this.db
            .select()
            .from(schema.listings)
            .where((0, drizzle_orm_1.eq)(schema.listings.id, id))
            .limit(1);
        if (!listing[0])
            throw new common_1.NotFoundException('Listing no encontrado');
        if (listing[0].sellerId !== sellerId)
            throw new common_1.ForbiddenException('No tienes permiso para editar este listing');
        const [updated] = await this.db
            .update(schema.listings)
            .set({ ...dto, precio: dto.precio ? String(dto.precio) : undefined, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema.listings.id, id))
            .returning();
        if (dto.titulo || dto.descripcion) {
            await this.updateSearchVector(id, dto.titulo ?? listing[0].titulo, dto.descripcion ?? listing[0].descripcion);
        }
        return updated;
    }
    async remove(id, sellerId, role) {
        const listing = await this.db
            .select()
            .from(schema.listings)
            .where((0, drizzle_orm_1.eq)(schema.listings.id, id))
            .limit(1);
        if (!listing[0])
            throw new common_1.NotFoundException('Listing no encontrado');
        if (listing[0].sellerId !== sellerId && role !== 'ADMIN') {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este listing');
        }
        await this.db.delete(schema.listings).where((0, drizzle_orm_1.eq)(schema.listings.id, id));
        return { success: true };
    }
    async getMyListings(sellerId, cursor, limit = 20) {
        const conditions = [(0, drizzle_orm_1.eq)(schema.listings.sellerId, sellerId)];
        if (cursor)
            conditions.push((0, drizzle_orm_1.lt)(schema.listings.createdAt, new Date(cursor)));
        const listings = await this.db
            .select()
            .from(schema.listings)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema.listings.createdAt))
            .limit(limit + 1);
        const hasMore = listings.length > limit;
        const items = hasMore ? listings.slice(0, limit) : listings;
        return {
            items,
            hasMore,
            nextCursor: hasMore ? items[items.length - 1]?.createdAt?.toISOString() : null,
        };
    }
    async updateSearchVector(id, titulo, descripcion) {
        await this.db.execute((0, drizzle_orm_1.sql) `
        UPDATE listings
        SET search_vector = to_tsvector('spanish', ${titulo} || ' ' || ${descripcion})
        WHERE id = ${id}
      `);
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], ListingsService);
//# sourceMappingURL=listings.service.js.map