import env from '../config/env.js';
import {
  DEFAULT_FALLBACK_TEXT,
  DEFAULT_FORBIDDEN_WORDS,
  ERROR_CODES,
  RISK_SYSTEM_PROMPT
} from '../config/constants.js';
import { guardOutput, sanitizeInput } from './riskService.js';
import { getAiRuntimeConfig } from './configService.js';
import { logAiUsage } from './usageLogService.js';

const EMPTY_USAGE = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0
};

function normalizeUsage(usage = {}) {
  return {
    promptTokens: Number(usage.prompt_tokens || usage.promptTokens || 0),
    completionTokens: Number(usage.completion_tokens || usage.completionTokens || 0),
    totalTokens: Number(usage.total_tokens || usage.totalTokens || 0)
  };
}

function createFallbackResult({ blocked = false, usage = EMPTY_USAGE, fallbackText = DEFAULT_FALLBACK_TEXT } = {}) {
  return {
    text: fallbackText,
    provider: 'deepseek',
    fallback: true,
    blocked,
    usage
  };
}

async function safeLog(logUsage, payload) {
  try {
    await logUsage(payload);
  } catch {
    // AI logging must not break customer-facing replies.
  }
}

async function resolveRuntimeConfig(options) {
  const provider = options.configProvider || getAiRuntimeConfig;
  const runtime = await provider();
  return {
    apiKey: options.apiKey ?? runtime.apiKey ?? env.deepseekApiKey,
    model: options.model ?? runtime.model ?? env.deepseekModel,
    timeoutMs: options.timeoutMs ?? runtime.timeoutMs ?? env.deepseekTimeoutMs,
    riskSystemPrompt: options.riskSystemPrompt ?? runtime.riskSystemPrompt ?? RISK_SYSTEM_PROMPT,
    forbiddenWords: options.forbiddenWords ?? runtime.forbiddenWords ?? DEFAULT_FORBIDDEN_WORDS,
    fallbackText: options.fallbackText ?? runtime.fallbackText ?? DEFAULT_FALLBACK_TEXT
  };
}

export async function generateAiReply(input = {}, options = {}) {
  const startedAt = Date.now();
  const prompt = String(input.prompt || '');
  const scene = String(input.scene || 'assistant');
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const usageLogger = options.logUsage || logAiUsage;
  const runtime = await resolveRuntimeConfig(options);
  const { text: sanitizedPrompt, hits: inputHits } = sanitizeInput(prompt, runtime.forbiddenWords);

  const baseLog = {
    scene,
    prompt,
    provider: 'deepseek',
    modelName: runtime.model
  };

  if (!runtime.apiKey) {
    const result = createFallbackResult({ fallbackText: runtime.fallbackText });
    await safeLog(usageLogger, {
      ...baseLog,
      response: result.text,
      blocked: false,
      fallbackUsed: true,
      status: 'failed',
      errorCode: String(ERROR_CODES.AI_SERVICE_ERROR),
      errorMessage: 'DeepSeek API Key 未配置',
      latencyMs: Date.now() - startedAt
    });
    return result;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), runtime.timeoutMs);

  try {
    const response = await fetchImpl('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${runtime.apiKey}`
      },
      body: JSON.stringify({
        model: runtime.model,
        messages: [
          { role: 'system', content: runtime.riskSystemPrompt },
          { role: 'user', content: `场景：${scene}\n客户问题：${sanitizedPrompt}` }
        ]
      }),
      signal: controller.signal
    });

    const payload = await response.json();
    const usage = normalizeUsage(payload.usage);

    if (!response.ok) {
      const result = createFallbackResult({ usage, fallbackText: runtime.fallbackText });
      await safeLog(usageLogger, {
        ...baseLog,
        response: result.text,
        blocked: false,
        fallbackUsed: true,
        status: 'failed',
        errorCode: String(ERROR_CODES.AI_SERVICE_ERROR),
        errorMessage: `DeepSeek HTTP ${response.status || 'error'}`,
        latencyMs: Date.now() - startedAt
      });
      return result;
    }

    const rawText = payload?.choices?.[0]?.message?.content || '';
    const guarded = guardOutput(rawText, runtime.forbiddenWords, runtime.fallbackText);

    if (guarded.blocked) {
      const result = {
        text: guarded.text,
        provider: 'deepseek',
        fallback: true,
        blocked: true,
        usage
      };
      await safeLog(usageLogger, {
        ...baseLog,
        response: result.text,
        blocked: true,
        fallbackUsed: true,
        status: 'failed',
        errorCode: String(ERROR_CODES.RISK_BLOCKED),
        errorMessage: `内容触发风控：${[...inputHits, ...guarded.hits].join(',')}`,
        latencyMs: Date.now() - startedAt
      });
      return result;
    }

    const result = {
      text: guarded.text || runtime.fallbackText,
      provider: 'deepseek',
      fallback: false,
      blocked: false,
      usage
    };
    await safeLog(usageLogger, {
      ...baseLog,
      response: result.text,
      blocked: false,
      fallbackUsed: false,
      status: 'success',
      latencyMs: Date.now() - startedAt
    });
    return result;
  } catch (error) {
    const isTimeout = error?.name === 'AbortError';
    const result = createFallbackResult({ fallbackText: runtime.fallbackText });
    await safeLog(usageLogger, {
      ...baseLog,
      response: result.text,
      blocked: false,
      fallbackUsed: true,
      status: 'failed',
      errorCode: String(isTimeout ? ERROR_CODES.AI_TIMEOUT : ERROR_CODES.AI_SERVICE_ERROR),
      errorMessage: isTimeout ? 'AI 响应超时' : 'AI 服务异常',
      latencyMs: Date.now() - startedAt
    });
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default generateAiReply;
