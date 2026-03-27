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
exports.UsersService = exports.UpdateProfileSchema = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const schema = __importStar(require("../database/schema"));
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
exports.UpdateProfileSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).max(100).optional(),
    telefono: zod_1.z.string().regex(/^\+51\d{9}$/, 'Telefono debe ser formato +51XXXXXXXXX').optional(),
    foto: zod_1.z.string().url().optional(),
});
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async getProfile(userId) {
        const user = await this.db
            .select({
            id: schema.users.id,
            email: schema.users.email,
            nombre: schema.users.nombre,
            telefono: schema.users.telefono,
            foto: schema.users.foto,
            role: schema.users.role,
            emailVerified: schema.users.emailVerified,
            createdAt: schema.users.createdAt,
        })
            .from(schema.users)
            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
            .limit(1);
        if (!user[0])
            throw new common_1.NotFoundException('Usuario no encontrado');
        return user[0];
    }
    async updateProfile(userId, data) {
        const updated = await this.db
            .update(schema.users)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
            .returning({
            id: schema.users.id,
            email: schema.users.email,
            nombre: schema.users.nombre,
            telefono: schema.users.telefono,
            foto: schema.users.foto,
            role: schema.users.role,
        });
        if (!updated[0])
            throw new common_1.NotFoundException('Usuario no encontrado');
        return updated[0];
    }
    async changeRole(userId, newRole) {
        const updated = await this.db
            .update(schema.users)
            .set({ role: newRole, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
            .returning({ id: schema.users.id, role: schema.users.role });
        if (!updated[0])
            throw new common_1.NotFoundException('Usuario no encontrado');
        return updated[0];
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=users.service.js.map