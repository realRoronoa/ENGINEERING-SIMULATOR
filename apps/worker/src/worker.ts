import { processGradingJob } from './jobs/grading.js';
import type { GradingJobPayload, GradingJobResult, WorkerConfig } from './types.js';

export class GradingWorker {
  private isRunning: boolean = false;
  private queue: GradingJobPayload[] = [];
  private results: Map<string, GradingJobResult> = new Map();
  private config: WorkerConfig;

  constructor(config: Partial<WorkerConfig> = {}) {
    this.config = {
      concurrency: config.concurrency ?? 1,
      pollIntervalMs: config.pollIntervalMs ?? 1000,
    };
  }

  public enqueueJob(job: GradingJobPayload): void {
    this.queue.push(job);
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getResult(submissionId: string): GradingJobResult | undefined {
    return this.results.get(submissionId);
  }

  public async processNextJob(): Promise<GradingJobResult | null> {
    const job = this.queue.shift();
    if (!job) {
      return null;
    }

    const result = await processGradingJob(job);
    this.results.set(job.submissionId, result);
    return result;
  }

  public start(): void {
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getStatus(): { isRunning: boolean; queueLength: number } {
    return {
      isRunning: this.isRunning,
      queueLength: this.queue.length,
    };
  }
}
