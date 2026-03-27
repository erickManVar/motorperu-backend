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
exports.DriversService = exports.RequestDriverSchema = exports.CreateDriverProfileSchema = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
exports.CreateDriverProfileSchema = zod_1.z.object({
    licenciaNumero: zod_1.z.string().min(5).max(20),
    licenciaCategoria: zod_1.z.string().default('A-IIb'),
    zonas: zod_1.z.array(zod_1.z.string()).min(1),
    precioHora: zod_1.z.number().positive(),
    disponibilidad: zod_1.z.record(zod_1.z.array(zod_1.z.string())).default({}),
});
exports.RequestDriverSchema = zod_1.z.object({
    ubicacionActual: zod_1.z.string().min(3),
    destino: zod_1.z.string().min(3),
    horaEstimada: zod_1.z.string().datetime(),
    distrito: zod_1.z.string(),
});
let DriversService = class DriversService {
    constructor(db) {
        this.db = db;
    }
    async createOrUpdateProfile(userId, dto) {
        const existing = await this.db
            .select()
            .from(schema.driverProfiles)
            .where((0, drizzle_orm_1.eq)(schema.driverProfiles.userId, userId))
            .limit(1);
        if (existing[0]) {
            const [updated] = await this.db
                .update(schema.driverProfiles)
                .set({
                licenciaNumero: dto.licenciaNumero,
                licenciaCategoria: dto.licenciaCategoria,
                zonas: dto.zonas,
                precioHora: String(dto.precioHora),
                disponibilidad: dto.disponibilidad,
            })
                .where((0, drizzle_orm_1.eq)(schema.driverProfiles.userId, userId))
                .returning();
            return updated;
        }
        const [created] = await this.db.insert(schema.driverProfiles).values({
            userId,
            licenciaNumero: dto.licenciaNumero,
            licenciaCategoria: dto.licenciaCategoria,
            zonas: dto.zonas,
            precioHora: String(dto.precioHora),
            disponibilidad: dto.disponibilidad,
            activo: true,
        }).returning();
        return created;
    }
    async findAvailableDrivers(distrito) {
        const drivers = await this.db
            .select({
            id: schema.driverProfiles.id,
            userId: schema.driverProfiles.userId,
            zonas: schema.driverProfiles.zonas,
            precioHora: schema.driverProfiles.precioHora,
            rating: schema.driverProfiles.rating,
            disponibilidad: schema.driverProfiles.disponibilidad,
            nombre: schema.users.nombre,
            foto: schema.users.foto,
        })
            .from(schema.driverProfiles)
            .innerJoin(schema.users, (0, drizzle_orm_1.eq)(schema.users.id, schema.driverProfiles.userId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.driverProfiles.activo, true), (0, drizzle_orm_1.sql) `${schema.driverProfiles.zonas} @> ${JSON.stringify([distrito])}::jsonb`));
        return drivers;
    }
    async getMyProfile(userId) {
        const profile = await this.db
            .select()
            .from(schema.driverProfiles)
            .where((0, drizzle_orm_1.eq)(schema.driverProfiles.userId, userId))
            .limit(1);
        if (!profile[0])
            throw new common_1.NotFoundException('Perfil de chofer no encontrado');
        return profile[0];
    }
    async toggleAvailability(userId) {
        const profile = await this.db
            .select()
            .from(schema.driverProfiles)
            .where((0, drizzle_orm_1.eq)(schema.driverProfiles.userId, userId))
            .limit(1);
        if (!profile[0])
            throw new common_1.NotFoundException('Perfil no encontrado');
        const [updated] = await this.db
            .update(schema.driverProfiles)
            .set({ activo: !profile[0].activo })
            .where((0, drizzle_orm_1.eq)(schema.driverProfiles.userId, userId))
            .returning();
        return updated;
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], DriversService);
//# sourceMappingURL=drivers.service.js.map