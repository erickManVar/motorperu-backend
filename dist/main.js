"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }));
    await app.register(require('@fastify/helmet'));
    await app.register(require('@fastify/compress'));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            process.env.BACKOFFICE_URL || 'http://localhost:3001',
        ],
        credentials: true,
    });
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.setGlobalPrefix('api/v1');
    const fastify = app.getHttpAdapter().getInstance();
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
    const port = process.env.PORT || 4000;
    await app.listen(Number(port), '0.0.0.0');
    console.log(`MotorPeru API running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map