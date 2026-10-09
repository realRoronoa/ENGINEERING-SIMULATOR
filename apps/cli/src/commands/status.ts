import { ApiClient } from '../api/client.js';
import { loadConfig } from '../config/deviceToken.js';
import { findWorkspace } from '../config/workspace.js';

export interface StatusOptions {
  cwd?: string;
}

export async function statusCommand(attemptId?: string, options?: StatusOptions): Promise<void> {
  const currentDir = options?.cwd || process.cwd();
  const workspace = findWorkspace(currentDir);
  const targetAttemptId = attemptId || workspace?.metadata.attemptId;

  if (!targetAttemptId) {
    console.error(
      'Error: attemptId is required. Usage: engsim status <attemptId> or run within a task directory.'
    );
    process.exit(1);
  }

  const config = loadConfig();
  if (!config.token) {
    console.error('Error: Not authenticated. Please run "engsim login <token>" first.');
    process.exit(1);
  }

  const client = new ApiClient();
  const res = await client.getAttempt(targetAttemptId);

  if (!res.ok || !res.data) {
    if (res.status === 401) {
      console.error(
        'Error: Authentication invalid or expired. Please run "engsim login <token>" again.'
      );
    } else if (res.status === 403) {
      console.error(`Error: You are not authorized to view attempt ${targetAttemptId}.`);
    } else if (res.status === 404) {
      console.error(`Error: Attempt ${targetAttemptId} was not found.`);
    } else {
      console.error(`Error: ${res.error?.message || 'Could not fetch status'}`);
    }
    process.exit(1);
  }

  const attempt = res.data.attempt;
  console.log('--- Attempt Status ---');
  console.log(`ID:                ${attempt.id}`);
  console.log(`Status:            ${attempt.status}`);
  console.log(`Hints Used:        ${attempt.hintsUsed}`);
  console.log(`Submissions Count: ${attempt.submissionsCount}`);

  if (attempt.status === 'transfer') {
    console.log('Note:              Transfer Verification Mode (AI Mentor & Hints disabled)');
  } else if (attempt.status === 'viva') {
    console.log('Next Step:         Oral defense verification');
  } else if (attempt.status === 'completed') {
    console.log('Result:            Mission Completed Successfully ✓');
  }
}
