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
      autoProcess: config.autoProcess ?? false,
    };
  }

  public enqueueJob(job: GradingJobPayload): void {
    this.queue.push(job);
    if (this.isRunning && this.config.autoProcess) {
      void this.processNextJob();
    }
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

  public async processAllJobs(): Promise<GradingJobResult[]> {
    const results: GradingJobResult[] = [];
    while (this.queue.length > 0) {
      const res = await this.processNextJob();
      if (res) {
        results.push(res);
      }
    }
    return results;
  }

  public clear(): void {
    this.queue = [];
    this.results.clear();
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

export const defaultGradingWorker = new GradingWorker({ autoProcess: false });

export function enqueueGradingJob(job: GradingJobPayload): void {
  defaultGradingWorker.enqueueJob(job);
}
