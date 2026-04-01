import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: FastifyRequest & { user?: unknown }, res: FastifyReply, next: () => void) {
    try {
      const user = await this.authService.validateSession(req);
      if (user) {
        req.user = user;
      }
    } catch {
      // Silently continue — AuthGuard will handle rejection
    }
    next();
  }
}
