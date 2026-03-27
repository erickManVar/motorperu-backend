"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TowingController = void 0;
const common_1 = require("@nestjs/common");
const towing_service_1 = require("./towing.service");
const auth_guard_1 = require("../common/guards/auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const zod_1 = require("zod");
const common_2 = require("@nestjs/common");
const Public = () => (0, common_2.SetMetadata)('isPublic', true);
let TowingController = class TowingController {
    constructor(towingService) {
        this.towingService = towingService;
    }
    findAvailable(distrito, tipo) {
        return this.towingService.findAvailableInDistrict(distrito, tipo);
    }
    getMyProfile(user) {
        return this.towingService.getMyProfile(user.id);
    }
    createOrUpdateProfile(user, body) {
        return this.towingService.createOrUpdateProfile(user.id, body);
    }
};
exports.TowingController = TowingController;
__decorate([
    (0, common_1.Get)('available'),
    Public(),
    __param(0, (0, common_1.Query)('distrito')),
    __param(1, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TowingController.prototype, "findAvailable", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TowingController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(towing_service_1.CreateTowingProfileSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, void 0]),
    __metadata("design:returntype", void 0)
], TowingController.prototype, "createOrUpdateProfile", null);
exports.TowingController = TowingController = __decorate([
    (0, common_1.Controller)('towing'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [towing_service_1.TowingService])
], TowingController);
//# sourceMappingURL=towing.controller.js.map