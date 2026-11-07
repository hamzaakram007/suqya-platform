import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { DispatchService } from './dispatch.service';

@Processor('dispatch')
export class DispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(DispatchProcessor.name);

  constructor(
    private prisma: PrismaService,
    private dispatchService: DispatchService,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'timeout-reassign') {
      const { orderId, tenantId } = job.data;
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });

      if (order?.status === 'driver_offered') {
        this.logger.log(`Auto-reassigning order ${orderId}`);
        await this.dispatchService.assignDriver(tenantId, orderId);
      }
    }
    return { processed: true };
  }
}
