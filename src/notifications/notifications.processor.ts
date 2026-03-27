import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    super();
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY') ?? 're_placeholder');
  }

  async process(job: Job) {
    const { userId, titulo, mensaje, tipo } = job.data as {
      userId: string;
      titulo: string;
      mensaje: string;
      tipo: string;
      email?: string;
    };

    this.logger.log(`Processing notification [${tipo}] for user ${userId}`);

    // Email would be sent here if email is available in job data
    // For now just log
    this.logger.debug(`Notification: ${titulo} - ${mensaje}`);

    return { processed: true };
  }
}
