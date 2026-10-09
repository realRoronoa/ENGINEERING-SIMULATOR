import fs from 'node:fs';
import path from 'node:path';
import { findWorkspace } from '../config/workspace.js';

export interface TestCommandResult {
  passed: boolean;
  message: string;
}

export interface TestOptions {
  cwd?: string;
}

export async function testCommand(options?: TestOptions): Promise<TestCommandResult> {
  const currentDir = options?.cwd || process.cwd();
  const workspace = findWorkspace(currentDir);

  if (!workspace) {
    console.error(
      'Error: No task workspace found. Run "engsim init <attemptId>" first or change directory to your task workspace.'
    );
    process.exit(1);
  }

  const srcDir = path.join(workspace.dirPath, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Expected src directory at ${srcDir} but none was found.`);
    process.exit(1);
  }

  const files = fs.readdirSync(srcDir);
  console.log(`--- Running Local Environment Checks ---`);
  console.log(`Task Workspace: ${workspace.dirPath}`);
  console.log(`Attempt ID:     ${workspace.metadata.attemptId}`);
  console.log(`Source Files:   ${files.length} found`);

  // Check if a package.json or local test runner is present
  const packageJsonPath = path.join(workspace.dirPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('Detected project package.json. Ready for local test execution.');
  } else {
    console.log('✓ Source workspace validated. Ready to apply patches and run "engsim submit".');
  }

  return {
    passed: true,
    message: `Validated ${files.length} source file(s) in task workspace.`,
  };
}
