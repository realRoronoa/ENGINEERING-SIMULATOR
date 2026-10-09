import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { initCommand } from './commands/init.js';
import { testCommand } from './commands/test.js';
import { statusCommand } from './commands/status.js';
import { submitCommand } from './commands/submit.js';
import { resultCommand } from './commands/result.js';

export function createCli(): Command {
  const program = new Command();

  program.name('engsim').description('Engineering Simulator — Learner CLI Tool').version('0.0.1');

  program
    .command('login <token>')
    .description('Authenticate and store device credentials')
    .option('-u, --url <url>', 'Base URL of the Engineering Simulator API')
    .action(async (token: string, options: { url?: string }) => {
      await loginCommand(token, options);
    });

  program
    .command('init <attemptId> [targetDir]')
    .description('Initialize task directory for an attempt')
    .action(async (attemptId: string, targetDir?: string) => {
      await initCommand(attemptId, targetDir);
    });

  program
    .command('test')
    .description('Run public test suite or validate local workspace')
    .action(async () => {
      await testCommand();
    });

  program
    .command('submit [patchFile]')
    .description('Submit code changes for grading')
    .option(
      '-a, --attempt <attemptId>',
      'Target attempt ID (inferred from task directory if omitted)'
    )
    .action(async (patchFile?: string, options?: { attempt?: string }) => {
      await submitCommand(patchFile, options);
    });

  program
    .command('status [attemptId]')
    .description('Check grading and attempt status')
    .action(async (attemptId?: string) => {
      await statusCommand(attemptId);
    });

  program
    .command('result [submissionId]')
    .description('Fetch and display grading evaluation result')
    .action(async (submissionId?: string) => {
      await resultCommand(submissionId);
    });

  return program;
}

export function runCli(argv: string[] = process.argv): void {
  const program = createCli();
  program.parse(argv);
}
