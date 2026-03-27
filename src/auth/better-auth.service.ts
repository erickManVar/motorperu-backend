import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';

@Injectable()
export class BetterAuthService implements OnModuleInit {
  private _auth: any = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');
    const client = postgres(databaseUrl, { max: 5 });
    const db = drizzle(client, { schema });

    this._auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
          user: schema.users,
          session: schema.sessions,
          account: schema.accounts,
          verification: schema.verifications,
        },
      }),
      secret: this.configService.getOrThrow<string>('BETTER_AUTH_SECRET'),
      baseURL: this.configService.getOrThrow<string>('APP_URL'),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
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
    if (!this._auth) throw new Error('BetterAuth not initialized');
    return this._auth;
  }
}
