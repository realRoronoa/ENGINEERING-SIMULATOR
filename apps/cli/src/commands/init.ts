import fs from 'node:fs';
import path from 'node:path';

export async function initCommand(attemptId: string, targetDir?: string): Promise<string> {
  if (!attemptId || attemptId.trim().length === 0) {
    console.error('Error: attemptId is required. Usage: engsim init <attemptId>');
    process.exit(1);
  }

  const baseDir = targetDir || path.resolve(process.cwd(), `task-${attemptId}`);

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const readmeContent = `# Engineering Simulator — Task Environment
Attempt ID: ${attemptId}

## Instructions
1. Inspect the codebase in \`./src\`
2. Run \`engsim test\` to verify public tests
3. Implement your fix
4. Submit using \`engsim submit\`
`;

  fs.writeFileSync(path.join(baseDir, 'README.md'), readmeContent);

  const srcDir = path.join(baseDir, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  console.log(`✓ Initialized task workspace at ${baseDir}`);
  return baseDir;
}
