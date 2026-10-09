import { saveConfig } from '../config/deviceToken.js';

export async function loginCommand(token: string): Promise<void> {
  if (!token || token.trim().length === 0) {
    console.error('Error: Token cannot be empty. Please provide a valid device or auth token.');
    process.exit(1);
  }

  saveConfig({ token: token.trim() });
  console.log('✓ Successfully authenticated! Token saved to ~/.engsim/config.json');
}
