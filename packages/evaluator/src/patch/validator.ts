import type { PatchValidationResult } from '../types.js';

const FORBIDDEN_FILE_PATTERNS = [/tests\/hidden\//i, /\.env/i, /package-lock\.json/i, /\.git\//i];

export function validatePatch(patch: string): PatchValidationResult {
  const errors: string[] = [];
  const targetFiles: string[] = [];

  if (!patch || patch.trim().length === 0) {
    errors.push('Patch is empty');
    return { valid: false, errors, targetFiles };
  }

  const lines = patch.split('\n');
  let hasDiffHeader = false;
  let hasHunkHeader = false;

  for (const line of lines) {
    if (line.startsWith('--- a/') || line.startsWith('+++ b/')) {
      hasDiffHeader = true;
      const filename = line.substring(6).trim();
      if (!targetFiles.includes(filename) && filename.length > 0) {
        targetFiles.push(filename);
      }
    } else if (line.startsWith('@@') && line.includes('@@')) {
      hasHunkHeader = true;
    }
  }

  if (!hasDiffHeader && !hasHunkHeader) {
    errors.push('Invalid unified diff format: missing diff/hunk headers');
  }

  // Security check: ensure the learner is not attempting to tamper with hidden tests or secrets
  for (const file of targetFiles) {
    for (const pattern of FORBIDDEN_FILE_PATTERNS) {
      if (pattern.test(file)) {
        errors.push(`Modification of protected file path is prohibited: ${file}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    targetFiles,
  };
}
