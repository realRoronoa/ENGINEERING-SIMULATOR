import fs from 'node:fs';
import path from 'node:path';
import { ApiClient } from '../api/client.js';
import { loadConfig } from '../config/deviceToken.js';
import { writeWorkspace } from '../config/workspace.js';

export async function initCommand(attemptId: string, targetDir?: string): Promise<string> {
  if (!attemptId || attemptId.trim().length === 0) {
    console.error('Error: attemptId is required. Usage: engsim init <attemptId>');
    process.exit(1);
  }

  const cleanAttemptId = attemptId.trim();
  const config = loadConfig();

  // If user has token configured, optionally verify against API
  if (config.token) {
    const client = new ApiClient();
    const res = await client.getAttempt(cleanAttemptId);
    if (!res.ok && res.status !== 0) {
      if (res.status === 404) {
        console.error(`Error: Attempt ${cleanAttemptId} was not found on the platform.`);
        process.exit(1);
      } else if (res.status === 403) {
        console.error(`Error: You are not authorized to access attempt ${cleanAttemptId}.`);
        process.exit(1);
      }
    }
  }

  const baseDir = targetDir
    ? path.resolve(targetDir)
    : path.resolve(process.cwd(), `task-${cleanAttemptId}`);

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Store workspace metadata
  writeWorkspace(baseDir, {
    attemptId: cleanAttemptId,
    initializedAt: new Date().toISOString(),
    lastSubmissionId: null,
  });

  const readmeContent = `# Engineering Simulator — Task Workspace
Attempt ID: ${cleanAttemptId}

## Instructions
1. Inspect the codebase in \`./src\`
2. Run \`engsim test\` to verify public tests
3. Implement your fix
4. Submit using \`engsim submit\`
5. Check grading result using \`engsim result\`
`;

  fs.writeFileSync(path.join(baseDir, 'README.md'), readmeContent);

  const srcDir = path.join(baseDir, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  console.log(`✓ Initialized task workspace at ${baseDir}`);
  return baseDir;
}
