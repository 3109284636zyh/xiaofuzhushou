import { query } from '../db/query.js';

function excerpt(text, max = 500) {
  return String(text || '').slice(0, max);
}

export async function logAiUsage(payload = {}) {
  try {
    await query(
      `INSERT INTO ai_usage_logs
        (scene, prompt_excerpt, response_excerpt, provider, model_name, blocked, fallback_used, status, error_code, error_message, latency_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.scene || 'assistant',
        excerpt(payload.prompt),
        excerpt(payload.response),
        payload.provider || 'deepseek',
        payload.modelName || null,
        payload.blocked ? 1 : 0,
        payload.fallbackUsed ? 1 : 0,
        payload.status || 'success',
        payload.errorCode || null,
        payload.errorMessage || null,
        Number(payload.latencyMs || 0)
      ]
    );
  } catch {
    // Logging must never break the customer-facing AI flow.
  }
}

export default {
  logAiUsage
};
