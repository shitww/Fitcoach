import { LLMMessage, LLMRequest, LLMResponse, ModelId } from '../types';

const DASHSCOPE_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export async function dashscopeComplete(
  request: LLMRequest,
  apiKey: string,
  timeoutMs = 20_000,
): Promise<LLMResponse> {
  const model = (request.model ?? 'qwen-turbo') as ModelId;

  const body: Record<string, unknown> = {
    model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 1000,
    stream: false,
  };
  if (request.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DashScope ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content?.trim() ?? '';
  const usage = data.usage;

  return {
    content,
    model,
    usage: usage
      ? {
          promptTokens: usage.prompt_tokens ?? 0,
          completionTokens: usage.completion_tokens ?? 0,
          totalTokens: usage.total_tokens ?? 0,
        }
      : undefined,
  };
}

export function dashscopeStream(
  messages: LLMMessage[],
  apiKey: string,
  opts: { model?: ModelId; temperature?: number; maxTokens?: number; signal?: AbortSignal },
): Promise<Response> {
  const model = opts.model ?? 'qwen-plus';
  return fetch(`${DASHSCOPE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2000,
      stream: true,
    }),
    signal: opts.signal ?? AbortSignal.timeout(25_000),
  });
}
