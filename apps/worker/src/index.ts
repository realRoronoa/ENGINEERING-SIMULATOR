import { GradingWorker } from './worker.js';

export * from './types.js';
export * from './jobs/grading.js';
export * from './worker.js';

export function main(): void {
  console.log('[Worker] Starting Engineering Simulator Grading Worker...');
  const worker = new GradingWorker();
  worker.start();
  console.log('[Worker] Grading worker listening for execution jobs.');
}

if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
