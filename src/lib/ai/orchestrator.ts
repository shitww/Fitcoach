import { logger } from '@/lib/logger';
import { dashscopeComplete, dashscopeStream } from './providers/dashscope';
import type { LLMMessage, LLMRequest, LLMResponse, ModelId } from './types';

const FALLBACK_CHAIN: ModelId[] = ['qwen-plus', 'qwen-turbo'];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

function getApiKey(): string {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('DASHSCOPE_API_KEY 未配置');
  return key;
}

function isClientError(err: Error): boolean {
  const match = err.message.match(/DashScope (\d+)/);
  if (!match) return false;
  const status = parseInt(match[1], 10);
  return status >= 400 && status < 500;
}

function isTransient(err: Error): boolean {
  if (err.name === 'TimeoutError' || err.name === 'AbortError') return true;
  const match = err.message.match(/DashScope (\d+)/);
  if (!match) return true;
  const status = parseInt(match[1], 10);
  return status >= 500;
}

/**
 * Non-streaming completion with automatic retry and model fallback.
 * Retry order: same model up to MAX_RETRIES times for transient errors,
 * then cascade through FALLBACK_CHAIN for persistent failures.
 */
export async function complete(request: LLMRequest): Promise<LLMResponse> {
  const apiKey = getApiKey();

  const modelsToTry: ModelId[] = request.model
    ? [request.model, ...FALLBACK_CHAIN.filter(m => m !== request.model)]
    : [...FALLBACK_CHAIN];

  let lastError: Error = new Error('Unknown error');

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
        const result = await dashscopeComplete({ ...request, model }, apiKey, request.timeoutMs ?? 20_000);
        if (attempt > 0 || model !== modelsToTry[0]) {
          logger.info(`[orchestrator] succeeded on model=${model} attempt=${attempt + 1}`);
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.warn(`[orchestrator] model=${model} attempt=${attempt + 1} failed: ${lastError.message}`);

        if (isClientError(lastError)) break;
        if (!isTransient(lastError) && attempt >= 1) break;
      }
    }
  }

  throw lastError;
}

/**
 * Streaming completion — returns the raw DashScope Response for SSE passthrough.
 * No retry: the caller owns the AbortController and stream lifecycle.
 */
export async function stream(
  messages: LLMMessage[],
  opts: {
    model?: ModelId;
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
  } = {},
): Promise<Response> {
  const apiKey = getApiKey();
  return dashscopeStream(messages, apiKey, {
    model: opts.model ?? 'qwen-plus',
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
    signal: opts.signal,
  });
}

/**
 * Convenience: complete and parse JSON response.
 * Strips markdown code fences before parsing.
 */
export async function completeJSON<T>(request: LLMRequest): Promise<T> {
  const resp = await complete({ ...request, jsonMode: true });
  const cleaned = resp.content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned) as T;
}
