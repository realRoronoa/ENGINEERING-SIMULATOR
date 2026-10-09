import fs from 'node:fs';
import path from 'node:path';

export async function submitCommand(patchFile?: string): Promise<string> {
  let patchContent = '';

  if (patchFile) {
    if (!fs.existsSync(patchFile)) {
      console.error(`Error: Patch file not found at ${patchFile}`);
      process.exit(1);
    }
    patchContent = fs.readFileSync(patchFile, 'utf-8');
  } else {
    const defaultDiffPath = path.resolve(process.cwd(), 'changes.patch');
    if (fs.existsSync(defaultDiffPath)) {
      patchContent = fs.readFileSync(defaultDiffPath, 'utf-8');
    } else {
      console.error(
        'Error: No patch specified and changes.patch not found. Provide a diff file or run in your task directory.'
      );
      process.exit(1);
    }
  }

  if (!patchContent.trim()) {
    console.error('Error: Patch is empty.');
    process.exit(1);
  }

  console.log(`✓ Patch loaded (${patchContent.split('\n').length} lines). Submitting to grader...`);
  return patchContent;
}
