import { Controller, Get, Param, Post, Delete } from '@nestjs/common';
import type { Queue, Job } from 'bull';
import { ModuleRef } from '@nestjs/core';
import type { Redis } from 'ioredis'; 

@Controller('queue-manager')
export class QueueController {
  private queues: Queue[] = [];

  constructor(private readonly moduleRef: ModuleRef) {
    this.loadQueues();
  }

  private loadQueues() {
    const queueNames = ['emailQueue', 'bulkQueue'];
    for (const name of queueNames) {
      try {
        const queue = this.moduleRef.get<Queue>(`BullQueue_${name}`, { strict: false });
        if (queue) this.queues.push(queue);
      } catch {}
    }
  }

  private getQueue(name: string): Queue | undefined {
    return this.queues.find(q => q.name === name);
  }

  // @Get()
  // async check() {
  //   const bullLibraryInstalled = !!require.resolve('bull');
  //   let redisConnected = false;

  //   try {
  //     if (this.queues.length > 0) {
  //       console.log("sss :",this.queues.length)
  //       const client = await this.queues[0].client;
  //       redisConnected = client.status === 'ready';
  //     }
  //   } catch {
  //     redisConnected = false;
  //   }

  //   return {
  //     bullLibraryInstalled,
  //     queuesAvailable: this.queues.length > 0,
  //     redisConnected,
  //     queues: this.queues.map(q => q.name),
  //   };
  // }

  @Get()
  async check() {
    let bullLibraryInstalled = false;

    try {
      bullLibraryInstalled = !!require.resolve('bull');
    } catch {
      bullLibraryInstalled = false;
    }

    const queueStatuses: { queue: string; redisConnected: boolean }[] = [];
    let redisConnected = false;

    for (const queue of this.queues) {
      let isConnected = false;

      try {
        const client = await queue.client;

        // Cast to ioredis type
        const redisClient = client as unknown as Redis;

        // Ping Redis
        const pong = await redisClient.ping();
        isConnected = pong === 'PONG';
      } catch (err: any) {
        console.warn(`Queue "${queue.name}" Redis check failed:`, err.message);
        isConnected = false;
      }

      queueStatuses.push({
        queue: queue.name,
        redisConnected: isConnected,
      });

      if (isConnected) redisConnected = true;
    }

    return {
      bullLibraryInstalled,
      queuesAvailable: this.queues.length > 0,
      redisConnected,
      queueStatuses,
    };
  }


  @Get('list')
  async listQueues() {
    const results = await Promise.all(
      this.queues.map(async queue => {
        const counts = await queue.getJobCounts();
        return {
          name: queue.name,
          jobCounts: counts,
        };
      })
    );

    return {
      totalQueues: this.queues.length,
      queues: results,
    };
  }
  @Get(':queueName/failed')
  async getFailedJobs(@Param('queueName') queueName: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const jobs = await queue.getFailed();
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      data: job.data,
    }));
  }

  @Get(':queueName/completed')
  async getCompletedJobs(@Param('queueName') queueName: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const jobs = await queue.getCompleted();
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
    }));
  }

  @Get(':queueName/waiting')
  async getWaitingJobs(@Param('queueName') queueName: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const jobs = await queue.getWaiting();
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
    }));
  }

  @Post(':queueName/retry/:jobId')
  async retryJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const job = await queue.getJob(jobId);
    if (!job) return { error: 'Job not found' };

    if (job.failedReason) {
      await job.retry();
      return { message: `Job ${jobId} retried.` };
    } else {
      return { message: `Job ${jobId} is not failed.` };
    }
  }

  @Delete(':queueName/remove/:jobId')
  async removeJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const job = await queue.getJob(jobId);
    if (!job) return { error: 'Job not found' };

    await job.remove();
    return { message: `Job ${jobId} removed.` };
  }

  @Post(':queueName/discard/:jobId')
  async discardJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const job = await queue.getJob(jobId);
    if (!job) return { error: 'Job not found' };

    await job.discard();
    return { message: `Job ${jobId} discarded.` };
  }

  @Get(':queueName/delayed')
  async getDelayedJobs(@Param('queueName') queueName: string) {
    const queue = this.getQueue(queueName);
     console.log("ssssswdwdwdw :",queue)
    if (!queue) return { error: 'Queue not found' };

    const jobs = await queue.getDelayed();
    console.log("sssss :",jobs)
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      delayUntil: job.timestamp + (job.opts?.delay ?? 0),
      data: job.data,
    }));
  }

  @Delete(':queueName/delayed/cancel-all')
  async cancelAllDelayedJobs(@Param('queueName') queueName: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return { error: 'Queue not found' };

    const delayedJobs = await queue.getDelayed();
    const removed: string[] = [];

    for (const job of delayedJobs) {
      await job.remove();
      removed.push(job.id.toString());
    }

    return {
      message: `Cancelled ${removed.length} delayed jobs from queue "${queueName}".`,
      removedJobIds: removed,
    };
  }


}
