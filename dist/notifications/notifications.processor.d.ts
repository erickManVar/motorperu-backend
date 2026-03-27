import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsProcessor extends WorkerHost {
    private configService;
    private readonly logger;
    private resend;
    constructor(configService: ConfigService);
    process(job: Job): Promise<{
        processed: boolean;
    }>;
}
