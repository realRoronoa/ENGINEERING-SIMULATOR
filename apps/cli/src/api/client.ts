import { loadConfig } from '../config/deviceToken.js';
import type {
  AttemptResponse,
  SubmissionCreateResponse,
  SubmissionPollResponse,
} from '@engineering-simulator/contracts';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const config = loadConfig();
    this.baseUrl = baseUrl || config.apiBaseUrl || 'http://localhost:3000';
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config = loadConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (config.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${config.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: json?.error || {
            code: 'UNKNOWN_ERROR',
            message: `Request failed with status ${response.status}`,
          },
        };
      }

      return {
        ok: true,
        status: response.status,
        data: json as T,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Could not reach API server',
        },
      };
    }
  }

  async getAttempt(id: string): Promise<ApiResponse<AttemptResponse>> {
    return this.request<AttemptResponse>(`/v1/attempts/${id}`, { method: 'GET' });
  }

  async createSession(
    mode: string
  ): Promise<ApiResponse<{ sessionId: string; createdAt: string }>> {
    return this.request<{ sessionId: string; createdAt: string }>('/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  async submitPatch(
    attemptId: string,
    patch: string,
    structuredAnswers?: Array<{ questionId: string; answer: string }>,
    clientChecksum?: string
  ): Promise<ApiResponse<SubmissionCreateResponse>> {
    return this.request<SubmissionCreateResponse>(`/v1/attempts/${attemptId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({
        patch,
        ...(structuredAnswers ? { structuredAnswers } : {}),
        ...(clientChecksum ? { clientChecksum } : {}),
      }),
    });
  }

  async getSubmission(submissionId: string): Promise<ApiResponse<SubmissionPollResponse>> {
    return this.request<SubmissionPollResponse>(`/v1/submissions/${submissionId}`, {
      method: 'GET',
    });
  }
}
