import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildApp } from '@engineering-simulator/api';
import * as database from '@engineering-simulator/database';
import { saveConfig, loadConfig, clearConfig } from './config/deviceToken.js';
import { findWorkspace, writeWorkspace, updateWorkspace } from './config/workspace.js';
import { loginCommand } from './commands/login.js';
import { initCommand } from './commands/init.js';
import { testCommand } from './commands/test.js';
import { submitCommand } from './commands/submit.js';
import { statusCommand } from './commands/status.js';
import { resultCommand } from './commands/result.js';
import { ApiClient } from './api/client.js';
import { createCli } from './index.js';

describe('Learner CLI Suite (engsim)', () => {
  const tempTestDir = path.join(os.tmpdir(), `engsim-test-${Date.now()}`);
  const tempConfigFile = path.join(tempTestDir, 'config.json');

  beforeEach(() => {
    fs.mkdirSync(tempTestDir, { recursive: true });
    process.env.ENGSIM_CONFIG_PATH = tempConfigFile;
  });

  afterEach(() => {
    clearConfig();
    vi.restoreAllMocks();
    if (fs.existsSync(tempTestDir)) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
    delete process.env.ENGSIM_CONFIG_PATH;
  });

  describe('Configuration & Auth Token Storage', () => {
    it('saves and loads device authentication token securely', () => {
      saveConfig({ token: 'test-device-token-123', apiBaseUrl: 'http://localhost:3000' });
      const loaded = loadConfig();
      expect(loaded.token).toBe('test-device-token-123');
      expect(loaded.apiBaseUrl).toBe('http://localhost:3000');
    });

    it('clears config successfully', () => {
      saveConfig({ token: 'temporary-token' });
      expect(loadConfig().token).toBe('temporary-token');
      clearConfig();
      expect(loadConfig().token).toBeUndefined();
    });

    it('loginCommand updates auth token and API URL', async () => {
      await loginCommand('jwt-mock-learner-token', { url: 'http://localhost:4000' });
      const config = loadConfig();
      expect(config.token).toBe('jwt-mock-learner-token');
      expect(config.apiBaseUrl).toBe('http://localhost:4000');
    });
  });

  describe('Workspace State Management (.engsim.json)', () => {
    it('writes and finds workspace metadata in task directory', () => {
      const taskDir = path.join(tempTestDir, 'my-task');
      fs.mkdirSync(taskDir, { recursive: true });

      writeWorkspace(taskDir, {
        attemptId: 'attempt-456',
        initializedAt: '2026-10-09T10:00:00Z',
        lastSubmissionId: null,
      });

      const found = findWorkspace(taskDir);
      expect(found).not.toBeNull();
      expect(found?.metadata.attemptId).toBe('attempt-456');
      expect(found?.metadata.lastSubmissionId).toBeNull();
    });

    it('finds workspace from nested subdirectories', () => {
      const taskDir = path.join(tempTestDir, 'nested-task');
      const srcDir = path.join(taskDir, 'src', 'utils');
      fs.mkdirSync(srcDir, { recursive: true });

      writeWorkspace(taskDir, {
        attemptId: 'attempt-nested',
        initializedAt: '2026-10-09T10:00:00Z',
      });

      const found = findWorkspace(srcDir);
      expect(found).not.toBeNull();
      expect(found?.metadata.attemptId).toBe('attempt-nested');
    });

    it('updates workspace metadata with new submission ID', () => {
      const taskDir = path.join(tempTestDir, 'update-task');
      fs.mkdirSync(taskDir, { recursive: true });

      writeWorkspace(taskDir, {
        attemptId: 'attempt-update',
        initializedAt: '2026-10-09T10:00:00Z',
      });

      const updated = updateWorkspace({ lastSubmissionId: 'sub-789' }, taskDir);
      expect(updated).toBe(true);

      const found = findWorkspace(taskDir);
      expect(found?.metadata.lastSubmissionId).toBe('sub-789');
    });
  });

  describe('init command', () => {
    it('creates task workspace with README instructions, src folder, and .engsim.json', async () => {
      const taskDir = path.join(tempTestDir, 'task-workspace');
      const resultPath = await initCommand('attempt-xyz', taskDir);

      expect(fs.existsSync(resultPath)).toBe(true);
      expect(fs.existsSync(path.join(resultPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(resultPath, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(resultPath, '.engsim.json'))).toBe(true);

      const readme = fs.readFileSync(path.join(resultPath, 'README.md'), 'utf-8');
      expect(readme).toContain('Attempt ID: attempt-xyz');

      const meta = JSON.parse(fs.readFileSync(path.join(resultPath, '.engsim.json'), 'utf-8'));
      expect(meta.attemptId).toBe('attempt-xyz');
    });
  });

  describe('test command', () => {
    it('validates task workspace structure', async () => {
      const taskDir = path.join(tempTestDir, 'test-task');
      await initCommand('attempt-test-1', taskDir);

      fs.writeFileSync(path.join(taskDir, 'src', 'app.ts'), 'export const x = 1;');

      const res = await testCommand({ cwd: taskDir });
      expect(res.passed).toBe(true);
      expect(res.message).toContain('Validated 1 source file(s)');
    });
  });

  describe('submit command', () => {
    it('reads and validates patch file in skipApi mode', async () => {
      const patchPath = path.join(tempTestDir, 'test.patch');
      const patchData = `--- a/src/orders.ts\n+++ b/src/orders.ts\n@@ -1,1 +1,2 @@\n+fixed\n`;
      fs.writeFileSync(patchPath, patchData, 'utf-8');

      const result = await submitCommand(patchPath, { attempt: 'att-123', skipApi: true });
      expect(result.patch).toBe(patchData);
    });

    it('infers changes.patch when no patch file is specified', async () => {
      const taskDir = path.join(tempTestDir, 'task-changes');
      await initCommand('attempt-changes', taskDir);

      const patchData = `--- a/src/index.ts\n+++ b/src/index.ts\n@@ -1,1 +1,2 @@\n+updated\n`;
      fs.writeFileSync(path.join(taskDir, 'changes.patch'), patchData, 'utf-8');

      const result = await submitCommand(undefined, { cwd: taskDir, skipApi: true });
      expect(result.patch).toBe(patchData);
    });
  });

  describe('CLI Program Definition', () => {
    it('registers expected commands in Commander', () => {
      const cli = createCli();
      const commandNames = cli.commands.map((cmd) => cmd.name());

      expect(commandNames).toContain('login');
      expect(commandNames).toContain('init');
      expect(commandNames).toContain('test');
      expect(commandNames).toContain('submit');
      expect(commandNames).toContain('status');
      expect(commandNames).toContain('result');
    });
  });

  describe('ApiClient & End-to-End HTTP Flow', () => {
    let server: http.Server;
    let serverUrl: string;
    let lastReceivedAuthHeader: string | undefined;

    beforeEach(async () => {
      server = http.createServer((req, res) => {
        lastReceivedAuthHeader = req.headers['authorization'];

        req.on('data', () => {});

        req.on('end', () => {
          if (req.url?.startsWith('/v1/attempts/att-live-1/submissions') && req.method === 'POST') {
            res.writeHead(202, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                submissionId: 'sub-live-999',
                status: 'queued',
                pollingUrl: '/v1/submissions/sub-live-999',
              })
            );
            return;
          }

          if (req.url === '/v1/attempts/att-live-1' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                attempt: {
                  id: 'att-live-1',
                  status: 'working',
                  variantId: 'var-123',
                  sessionId: 'ses-456',
                  startedAt: '2026-10-09T10:00:00Z',
                  completedAt: null,
                  hintsUsed: 1,
                  submissionsCount: 1,
                },
              })
            );
            return;
          }

          if (req.url === '/v1/submissions/sub-live-999' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                submissionId: 'sub-live-999',
                status: 'complete',
                evaluation: {
                  id: 'eval-1',
                  passed: true,
                  score: 1.0,
                  publicTestsPassed: 5,
                  publicTestsTotal: 5,
                  hiddenTestsPassed: 8,
                  hiddenTestsTotal: 8,
                  benchmarksPassed: true,
                  rubricResults: [],
                  feedback: 'All tests passed cleanly.',
                },
              })
            );
            return;
          }

          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }));
        });
      });

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          const address = server.address() as { port: number };
          serverUrl = `http://127.0.0.1:${address.port}`;
          resolve();
        });
      });
    });

    afterEach(async () => {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    });

    it('authenticates via ApiClient and transmits Bearer token', async () => {
      saveConfig({ token: 'bearer-device-token', apiBaseUrl: serverUrl });
      const client = new ApiClient();

      const attemptRes = await client.getAttempt('att-live-1');
      expect(attemptRes.ok).toBe(true);
      expect(attemptRes.data?.attempt.id).toBe('att-live-1');
      expect(lastReceivedAuthHeader).toBe('Bearer bearer-device-token');
    });

    it('submits patch and polls evaluation via ApiClient', async () => {
      saveConfig({ token: 'bearer-device-token', apiBaseUrl: serverUrl });
      const client = new ApiClient();

      const submitRes = await client.submitPatch('att-live-1', '--- a/app.ts\n+++ b/app.ts\n');
      expect(submitRes.ok).toBe(true);
      expect(submitRes.data?.submissionId).toBe('sub-live-999');
      expect(submitRes.data?.status).toBe('queued');

      const pollRes = await client.getSubmission('sub-live-999');
      expect(pollRes.ok).toBe(true);
      expect(pollRes.data?.status).toBe('complete');
      expect(pollRes.data?.evaluation?.passed).toBe(true);
      expect(pollRes.data?.evaluation?.score).toBe(1.0);
    });

    it('executes full CLI lifecycle: init -> submit -> status -> result', async () => {
      // 1. Login with test server URL
      await loginCommand('e2e-token', { url: serverUrl });

      // 2. Initialize task workspace
      const taskDir = path.join(tempTestDir, 'task-e2e');
      await initCommand('att-live-1', taskDir);

      // 3. Write patch file
      fs.writeFileSync(
        path.join(taskDir, 'changes.patch'),
        '--- a/fix.ts\n+++ b/fix.ts\n',
        'utf-8'
      );

      // 4. Submit patch from workspace
      const submitRes = await submitCommand(undefined, { cwd: taskDir });
      expect(submitRes.submissionId).toBe('sub-live-999');

      // Check workspace updated with submission ID
      const meta = findWorkspace(taskDir);
      expect(meta?.metadata.lastSubmissionId).toBe('sub-live-999');

      // 5. Check status
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await statusCommand(undefined, { cwd: taskDir });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('att-live-1'));

      // 6. Check result
      await resultCommand(undefined, { cwd: taskDir });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('sub-live-999'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('PASSED ✓'));
      consoleSpy.mockRestore();
    });
  });

  describe('Direct Integration with Live Express v5 App Server', () => {
    let expressServer: http.Server;
    let expressUrl: string;

    const mockExpressAttempt = {
      id: 'att-express-42',
      session_id: 'ses-express-42',
      variant_id: 'var-express-42',
      learner_id: 'learner_cli_user',
      status: 'working' as const,
      selector_decision: {},
      created_at: new Date(),
      started_at: '2026-10-09T10:00:00Z',
      completed_at: null,
      hints_used: 0,
      submissions_count: 0,
    };

    beforeEach(async () => {
      const app = buildApp();

      vi.spyOn(database, 'getAttemptById').mockResolvedValue(
        mockExpressAttempt as unknown as database.Attempt
      );
      vi.spyOn(database, 'createSubmission').mockResolvedValue({
        id: 'sub-express-42',
        attempt_id: mockExpressAttempt.id,
        learner_id: mockExpressAttempt.learner_id,
        patch: `--- a/src/service.ts\n+++ b/src/service.ts\n@@ -1,1 +1,2 @@\n+export const ok = true;\n`,
        structured_answers: {},
        client_checksum: 'chk-express',
        status: 'queued',
        submitted_at: new Date(),
      });
      vi.spyOn(database, 'getSubmissionWithEvaluation').mockResolvedValue({
        submission: {
          id: 'sub-express-42',
          attempt_id: mockExpressAttempt.id,
          learner_id: mockExpressAttempt.learner_id,
          patch: `--- a/src/service.ts\n+++ b/src/service.ts\n@@ -1,1 +1,2 @@\n+export const ok = true;\n`,
          structured_answers: {},
          client_checksum: 'chk-express',
          status: 'complete',
          submitted_at: new Date(),
        },
        evaluation: {
          id: 'eval-express-42',
          submission_id: 'sub-express-42',
          attempt_id: mockExpressAttempt.id,
          patch_valid: true,
          passed: true,
          score: 1.0,
          public_tests_passed: 4,
          public_tests_total: 4,
          hidden_tests_passed: 6,
          hidden_tests_total: 6,
          benchmarks_passed: true,
          structured_answers_result: {},
          rubric_results: {},
          created_at: new Date(),
        },
      });

      await new Promise<void>((resolve) => {
        expressServer = app.listen(0, '127.0.0.1', () => {
          const addr = expressServer.address() as { port: number };
          expressUrl = `http://127.0.0.1:${addr.port}`;
          resolve();
        });
      });
    });

    afterEach(async () => {
      if (expressServer) {
        await new Promise<void>((resolve) => {
          expressServer.close(() => resolve());
        });
      }
    });

    it('authenticates, initializes, submits patch, and fetches result from Express v5 API', async () => {
      // 1. Login with Bearer token that resolves to learner_cli_user
      await loginCommand('cli_user', { url: expressUrl });

      // 2. Initialize workspace for att-express-42
      const taskDir = path.join(tempTestDir, 'task-express-42');
      await initCommand('att-express-42', taskDir);

      // Verify workspace files
      expect(fs.existsSync(path.join(taskDir, '.engsim.json'))).toBe(true);

      // 3. Test workspace locally
      const testRes = await testCommand({ cwd: taskDir });
      expect(testRes.passed).toBe(true);

      // 4. Create changes.patch
      const patchContent = `--- a/src/service.ts\n+++ b/src/service.ts\n@@ -1,1 +1,2 @@\n+export const ok = true;\n`;
      fs.writeFileSync(path.join(taskDir, 'changes.patch'), patchContent, 'utf-8');

      // 5. Submit patch to Express v5 server
      const submitRes = await submitCommand(undefined, { cwd: taskDir });
      expect(submitRes.submissionId).toBe('sub-express-42');
      expect(submitRes.pollingUrl).toBe('/v1/submissions/sub-express-42');

      // 6. Check status against Express v5 server
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await statusCommand(undefined, { cwd: taskDir });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('att-express-42'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('working'));

      // 7. Check result against Express v5 server
      await resultCommand(undefined, { cwd: taskDir });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('sub-express-42'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('PASSED ✓'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('100%'));
      consoleSpy.mockRestore();
    });
  });
});
