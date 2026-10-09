import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { submitCommand } from './commands/submit.js';

export function createCli(): Command {
  const program = new Command();

  program.name('engsim').description('Engineering Simulator — Learner CLI Tool').version('0.0.1');

  program
    .command('login <token>')
    .description('Authenticate and store device credentials')
    .action(async (token: string) => {
      await loginCommand(token);
    });

  program
    .command('init <attemptId>')
    .description('Initialize task directory for an attempt')
    .action(async (attemptId: string) => {
      await initCommand(attemptId);
    });

  program
    .command('status <attemptId>')
    .description('Check grading and attempt status')
    .action(async (attemptId: string) => {
      await statusCommand(attemptId);
    });

  program
    .command('submit [patchFile]')
    .description('Submit code changes for grading')
    .action(async (patchFile?: string) => {
      await submitCommand(patchFile);
    });

  return program;
}

export function runCli(argv: string[] = process.argv): void {
  const program = createCli();
  program.parse(argv);
}
