import { All, Controller, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BetterAuthService } from './better-auth.service';

@Controller('auth')
export class AuthController {
  constructor(private betterAuthService: BetterAuthService) {}

  @All('*')
  async handleAuth(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const response = await this.betterAuthService.auth.handler(request);

    const resHeaders: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      resHeaders[key] = value;
    });

    const body = await response.text();

    await reply
      .status(response.status)
      .headers(resHeaders)
      .send(body);
  }
}
