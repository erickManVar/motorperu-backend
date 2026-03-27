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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const better_auth_1 = require("better-auth");
const drizzle_1 = require("better-auth/adapters/drizzle");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("../database/schema"));
let BetterAuthService = class BetterAuthService {
    constructor(configService) {
        this.configService = configService;
        this._auth = null;
    }
    onModuleInit() {
        const databaseUrl = this.configService.getOrThrow('DATABASE_URL');
        const client = (0, postgres_1.default)(databaseUrl, { max: 5 });
        const db = (0, postgres_js_1.drizzle)(client, { schema });
        this._auth = (0, better_auth_1.betterAuth)({
            database: (0, drizzle_1.drizzleAdapter)(db, {
                provider: 'pg',
                schema: {
                    user: schema.users,
                    session: schema.sessions,
                    account: schema.accounts,
                    verification: schema.verifications,
                },
            }),
            secret: this.configService.getOrThrow('BETTER_AUTH_SECRET'),
            baseURL: this.configService.getOrThrow('APP_URL'),
            emailAndPassword: {
                enabled: true,
                requireEmailVerification: false,
            },
            session: {
                expiresIn: 60 * 60 * 24 * 7,
                updateAge: 60 * 60 * 24,
            },
            user: {
                additionalFields: {
                    role: {
                        type: 'string',
                        defaultValue: 'BUYER',
                    },
                    nombre: {
                        type: 'string',
                        required: true,
                    },
                    telefono: {
                        type: 'string',
                        required: false,
                    },
                },
            },
        });
    }
    get auth() {
        if (!this._auth)
            throw new Error('BetterAuth not initialized');
        return this._auth;
    }
};
exports.BetterAuthService = BetterAuthService;
exports.BetterAuthService = BetterAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BetterAuthService);
//# sourceMappingURL=better-auth.service.js.map