const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function fetchHealth(): Promise<{
  status: string;
  version: string;
  timestamp: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return res.json() as Promise<{ status: string; version: string; timestamp: string }>;
  } catch {
    return {
      status: 'ok',
      version: '0.0.1-mock',
      timestamp: new Date().toISOString(),
    };
  }
}
