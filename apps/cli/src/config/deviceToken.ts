import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface CliConfig {
  token?: string;
  apiBaseUrl?: string;
}

export function getConfigPath(): string {
  if (process.env.ENGSIM_CONFIG_PATH) {
    return process.env.ENGSIM_CONFIG_PATH;
  }
  return path.join(os.homedir(), '.engsim', 'config.json');
}

export function saveConfig(config: CliConfig): void {
  const filePath = getConfigPath();
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
  }

  const existing = loadConfig();
  const updated = { ...existing, ...config };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), {
    mode: 0o600,
  });
}

export function loadConfig(): CliConfig {
  const filePath = getConfigPath();
  if (!fs.existsSync(filePath)) {
    return { apiBaseUrl: 'http://localhost:3000' };
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      apiBaseUrl: 'http://localhost:3000',
      ...parsed,
    };
  } catch {
    return { apiBaseUrl: 'http://localhost:3000' };
  }
}

export function clearConfig(): void {
  const filePath = getConfigPath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
