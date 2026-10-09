import { ApiClient } from '../api/client.js';

export async function statusCommand(attemptId: string): Promise<void> {
  if (!attemptId) {
    console.error('Error: attemptId is required. Usage: engsim status <attemptId>');
    process.exit(1);
  }

  const client = new ApiClient();
  const res = await client.getAttempt(attemptId);

  if (!res.ok) {
    console.error(`Error: ${res.error?.message || 'Could not fetch status'}`);
    process.exit(1);
  }

  interface AttemptResponse {
    attempt?: {
      id: string;
      status: string;
      hintsUsed: number;
      submissionsCount: number;
    };
  }

  const attempt = (res.data as AttemptResponse)?.attempt;
  console.log('--- Attempt Status ---');
  console.log(`ID: ${attempt?.id}`);
  console.log(`Status: ${attempt?.status}`);
  console.log(`Hints Used: ${attempt?.hintsUsed}`);
  console.log(`Submissions Count: ${attempt?.submissionsCount}`);
}
