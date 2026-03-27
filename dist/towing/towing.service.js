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
exports.TowingService = exports.RequestTowingSchema = exports.CreateTowingProfileSchema = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
exports.CreateTowingProfileSchema = zod_1.z.object({
    nombreEmpresa: zod_1.z.string().optional(),
    zonas: zod_1.z.array(zod_1.z.string()).min(1),
    servicios: zod_1.z.array(zod_1.z.object({
        tipo: zod_1.z.enum(['GRUA', 'BATERIA', 'LLANTA', 'COMBUSTIBLE', 'OTRO']),
        precioBase: zod_1.z.number().positive(),
        precioPorKm: zod_1.z.number().positive().optional(),
    })),
});
exports.RequestTowingSchema = zod_1.z.object({
    latitud: zod_1.z.number().min(-90).max(90),
    longitud: zod_1.z.number().min(-180).max(180),
    distrito: zod_1.z.string(),
    tipoServicio: zod_1.z.enum(['GRUA', 'BATERIA', 'LLANTA', 'COMBUSTIBLE', 'OTRO']),
    descripcion: zod_1.z.string().optional(),
});
let TowingService = class TowingService {
    constructor(db) {
        this.db = db;
    }
    async createOrUpdateProfile(userId, dto) {
        const existing = await this.db
            .select()
            .from(schema.towingProfiles)
            .where((0, drizzle_orm_1.eq)(schema.towingProfiles.userId, userId))
            .limit(1);
        const data = {
            nombreEmpresa: dto.nombreEmpresa,
            zonas: dto.zonas,
            servicios: dto.servicios,
            activo: true,
        };
        if (existing[0]) {
            const [updated] = await this.db
                .update(schema.towingProfiles)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema.towingProfiles.userId, userId))
                .returning();
            return updated;
        }
        const [created] = await this.db.insert(schema.towingProfiles).values({ userId, ...data }).returning();
        return created;
    }
    async findAvailableInDistrict(distrito, tipoServicio) {
        const providers = await this.db
            .select({
            id: schema.towingProfiles.id,
            userId: schema.towingProfiles.userId,
            nombreEmpresa: schema.towingProfiles.nombreEmpresa,
            zonas: schema.towingProfiles.zonas,
            servicios: schema.towingProfiles.servicios,
            rating: schema.towingProfiles.rating,
            nombre: schema.users.nombre,
            foto: schema.users.foto,
        })
            .from(schema.towingProfiles)
            .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.users.id, schema.towingProfiles.userId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.towingProfiles.activo, true), (0, drizzle_orm_1.sql) `${schema.towingProfiles.zonas} @> ${JSON.stringify([distrito])}::jsonb`));
        return providers.filter((p) => p.servicios.some((s) => s.tipo === tipoServicio));
    }
    calculatePrice(providerServicio, distanciaKm) {
        const base = providerServicio.precioBase;
        const kmCost = (providerServicio.precioPorKm ?? 0) * distanciaKm;
        return base + kmCost;
    }
    async getMyProfile(userId) {
        const profile = await this.db
            .select()
            .from(schema.towingProfiles)
            .where((0, drizzle_orm_1.eq)(schema.towingProfiles.userId, userId))
            .limit(1);
        if (!profile[0])
            throw new common_1.NotFoundException('Perfil de grúa no encontrado');
        return profile[0];
    }
};
exports.TowingService = TowingService;
exports.TowingService = TowingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], TowingService);
//# sourceMappingURL=towing.service.js.map