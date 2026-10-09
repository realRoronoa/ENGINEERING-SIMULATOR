import { ApiClient } from '../api/client.js';
import { loadConfig } from '../config/deviceToken.js';
import { findWorkspace } from '../config/workspace.js';

export interface ResultOptions {
  cwd?: string;
}

export async function resultCommand(submissionId?: string, options?: ResultOptions): Promise<void> {
  const currentDir = options?.cwd || process.cwd();
  const workspace = findWorkspace(currentDir);
  const targetSubmissionId = submissionId || workspace?.metadata.lastSubmissionId;

  if (!targetSubmissionId) {
    console.error(
      'Error: submissionId is required. Provide it as an argument or run "engsim result" in a task directory after submitting.'
    );
    process.exit(1);
  }

  const config = loadConfig();
  if (!config.token) {
    console.error('Error: Not authenticated. Please run "engsim login <token>" first.');
    process.exit(1);
  }

  const client = new ApiClient();
  const res = await client.getSubmission(targetSubmissionId);

  if (!res.ok || !res.data) {
    if (res.status === 401) {
      console.error(
        'Error: Authentication invalid or expired. Please run "engsim login <token>" again.'
      );
    } else if (res.status === 403) {
      console.error(`Error: You are not authorized to view submission ${targetSubmissionId}.`);
    } else if (res.status === 404) {
      console.error(`Error: Submission ${targetSubmissionId} was not found.`);
    } else {
      console.error(`Error: ${res.error?.message || 'Could not fetch submission result'}`);
    }
    process.exit(1);
  }

  const { status, evaluation } = res.data;

  console.log('--- Grading Result ---');
  console.log(`Submission ID: ${targetSubmissionId}`);
  console.log(`Status:        ${status.toUpperCase()}`);

  if (status === 'queued' || status === 'grading') {
    console.log('\nYour code is currently being graded by the worker.');
    console.log('Please check again in a few moments with:');
    console.log(`  engsim result ${targetSubmissionId}`);
    return;
  }

  if (evaluation) {
    console.log(`Outcome:       ${evaluation.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`Score:         ${Math.round(evaluation.score * 100)}%`);
    console.log(`Public Tests:  ${evaluation.publicTestsPassed} / ${evaluation.publicTestsTotal}`);
    console.log(`Hidden Tests:  ${evaluation.hiddenTestsPassed} / ${evaluation.hiddenTestsTotal}`);
    if (evaluation.feedback) {
      console.log(`Feedback:      ${evaluation.feedback}`);
    }
  } else {
    console.log('No detailed evaluation data available.');
  }
}
