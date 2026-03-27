import { FastifyReply, FastifyRequest } from 'fastify';
import { BetterAuthService } from './better-auth.service';
export declare class AuthController {
    private betterAuthService;
    constructor(betterAuthService: BetterAuthService);
    handleAuth(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}
