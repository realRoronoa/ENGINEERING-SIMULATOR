import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { saveConfig, loadConfig, clearConfig } from './config/deviceToken.js';
import { initCommand } from './commands/init.js';
import { submitCommand } from './commands/submit.js';
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
  });

  describe('init command', () => {
    it('creates task workspace with README instructions and src folder', async () => {
      const taskDir = path.join(tempTestDir, 'task-workspace');
      const resultPath = await initCommand('attempt-xyz', taskDir);

      expect(fs.existsSync(resultPath)).toBe(true);
      expect(fs.existsSync(path.join(resultPath, 'README.md'))).toBe(true);
      expect(fs.existsSync(path.join(resultPath, 'src'))).toBe(true);

      const readme = fs.readFileSync(path.join(resultPath, 'README.md'), 'utf-8');
      expect(readme).toContain('Attempt ID: attempt-xyz');
    });
  });

  describe('submit command', () => {
    it('reads and validates patch file from disk', async () => {
      const patchPath = path.join(tempTestDir, 'test.patch');
      const patchData = `--- a/src/orders.ts\n+++ b/src/orders.ts\n@@ -1,1 +1,2 @@\n+fixed\n`;
      fs.writeFileSync(patchPath, patchData, 'utf-8');

      const result = await submitCommand(patchPath);
      expect(result).toBe(patchData);
    });
  });

  describe('CLI Program Definition', () => {
    it('registers expected commands in Commander', () => {
      const cli = createCli();
      const commandNames = cli.commands.map((cmd) => cmd.name());

      expect(commandNames).toContain('login');
      expect(commandNames).toContain('init');
      expect(commandNames).toContain('status');
      expect(commandNames).toContain('submit');
    });
  });
});
