import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import { FastifyRequest } from 'fastify';
import { BetterAuthService } from './better-auth.service';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  nombre: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    private betterAuthService: BetterAuthService,
  ) {}

  async validateSession(request: FastifyRequest): Promise<AuthUser | null> {
    try {
      const session = await this.betterAuthService.auth.api.getSession({
        headers: new Headers(request.headers as Record<string, string>),
      });

      if (!session?.user) return null;

      const user = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, session.user.id))
        .limit(1);

      if (!user[0]) return null;

      return {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        nombre: user[0].nombre,
      };
    } catch {
      return null;
    }
  }

  async getUserById(id: string) {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!user[0]) throw new UnauthorizedException('Usuario no encontrado');
    return user[0];
  }
}
