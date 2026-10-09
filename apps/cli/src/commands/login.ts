import { saveConfig } from '../config/deviceToken.js';

export interface LoginOptions {
  url?: string;
}

export async function loginCommand(token: string, options?: LoginOptions): Promise<void> {
  if (!token || token.trim().length === 0) {
    console.error('Error: Token cannot be empty. Please provide a valid device or auth token.');
    process.exit(1);
  }

  saveConfig({
    token: token.trim(),
    ...(options?.url ? { apiBaseUrl: options.url.trim() } : {}),
  });
  console.log('✓ Successfully authenticated! Credentials saved to ~/.engsim/config.json');
}
