import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { ApiClient } from '../api/client.js';
import { loadConfig } from '../config/deviceToken.js';
import { findWorkspace, updateWorkspace } from '../config/workspace.js';

export interface SubmitOptions {
  attempt?: string;
  cwd?: string;
  skipApi?: boolean;
}

export interface SubmitResult {
  patch: string;
  submissionId?: string;
  pollingUrl?: string;
}

export async function submitCommand(
  patchFile?: string,
  options?: SubmitOptions
): Promise<SubmitResult> {
  const currentDir = options?.cwd || process.cwd();
  const workspace = findWorkspace(currentDir);
  const attemptId = options?.attempt || workspace?.metadata.attemptId;

  if (!attemptId) {
    console.error(
      'Error: No attemptId specified and not inside an initialized task directory. Run "engsim init <attemptId>" or provide --attempt <attemptId>.'
    );
    process.exit(1);
  }

  let patchContent = '';

  if (patchFile) {
    const resolvedPath = path.isAbsolute(patchFile)
      ? patchFile
      : path.resolve(currentDir, patchFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`Error: Patch file not found at ${patchFile}`);
      process.exit(1);
    }
    patchContent = fs.readFileSync(resolvedPath, 'utf-8');
  } else {
    const defaultDiffPath = path.resolve(currentDir, 'changes.patch');
    if (fs.existsSync(defaultDiffPath)) {
      patchContent = fs.readFileSync(defaultDiffPath, 'utf-8');
    } else {
      // Attempt git diff in workspace
      try {
        const gitDiff = execSync('git diff', {
          cwd: currentDir,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        if (gitDiff.trim().length > 0) {
          patchContent = gitDiff;
        }
      } catch {
        // Not a git repository or git diff failed
      }

      if (!patchContent.trim()) {
        console.error(
          'Error: No patch specified and no changes found. Provide a diff file (e.g. changes.patch) or make changes in your task repository.'
        );
        process.exit(1);
      }
    }
  }

  if (!patchContent.trim()) {
    console.error('Error: Patch is empty.');
    process.exit(1);
  }

  // If running in skipApi mode (offline / local unit testing)
  if (options?.skipApi) {
    console.log(`✓ Patch loaded (${patchContent.split('\n').length} lines).`);
    return { patch: patchContent };
  }

  const config = loadConfig();
  if (!config.token) {
    console.error('Error: Not authenticated. Please run "engsim login <token>" first.');
    process.exit(1);
  }

  const client = new ApiClient();
  const res = await client.submitPatch(attemptId, patchContent);

  if (!res.ok || !res.data) {
    if (res.status === 401) {
      console.error(
        'Error: Authentication invalid or expired. Please run "engsim login <token>" again.'
      );
    } else if (res.status === 403) {
      console.error(`Error: You are not authorized to submit to attempt ${attemptId}.`);
    } else if (res.status === 404) {
      console.error(`Error: Attempt ${attemptId} was not found.`);
    } else if (res.status === 409) {
      console.error(`Error: ${res.error?.message || 'Attempt is not in a submittable state.'}`);
    } else if (res.status === 400) {
      console.error(
        `Error: Invalid patch format: ${res.error?.message || 'Patch validation failed'}`
      );
    } else {
      console.error(`Error: Submission failed: ${res.error?.message || 'Unknown error'}`);
    }
    process.exit(1);
  }

  // Update local workspace with latest submission ID
  updateWorkspace({ lastSubmissionId: res.data.submissionId }, currentDir);

  console.log('✓ Patch submitted successfully!');
  console.log(`Submission ID: ${res.data.submissionId}`);
  console.log(`Status:        ${res.data.status}`);
  console.log(`Polling URL:   ${res.data.pollingUrl}`);
  console.log('Run "engsim result" or "engsim status" to view your evaluation.');

  return {
    patch: patchContent,
    submissionId: res.data.submissionId,
    pollingUrl: res.data.pollingUrl,
  };
}
