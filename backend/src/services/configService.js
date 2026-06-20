import env from '../config/env.js';
import { DEFAULT_FALLBACK_TEXT, DEFAULT_FORBIDDEN_WORDS, RISK_SYSTEM_PROMPT } from '../config/constants.js';
import { query } from '../db/query.js';

function parseConfigRows(rows = []) {
  const map = new Map(rows.map((row) => [row.config_key ?? row.configKey, row.config_value ?? row.configValue]));
  let forbiddenWords = DEFAULT_FORBIDDEN_WORDS;

  try {
    const parsed = JSON.parse(map.get('risk_forbidden_words') || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) forbiddenWords = parsed;
  } catch {}

  return {
    apiKey: map.get('deepseek_api_key') || env.deepseekApiKey,
    model: map.get('deepseek_model') || env.deepseekModel,
    timeoutMs: Number(map.get('deepseek_timeout_ms') || env.deepseekTimeoutMs) || env.deepseekTimeoutMs,
    riskSystemPrompt: map.get('risk_system_prompt') || RISK_SYSTEM_PROMPT,
    forbiddenWords,
    fallbackText: map.get('risk_fallback_text') || DEFAULT_FALLBACK_TEXT
  };
}

export async function getAiRuntimeConfig() {
  try {
    const rows = await query('SELECT config_key, config_value FROM system_configs WHERE status = ?', ['active']);
    return parseConfigRows(rows);
  } catch {
    return {
      apiKey: env.deepseekApiKey,
      model: env.deepseekModel,
      timeoutMs: env.deepseekTimeoutMs,
      riskSystemPrompt: RISK_SYSTEM_PROMPT,
      forbiddenWords: DEFAULT_FORBIDDEN_WORDS,
      fallbackText: DEFAULT_FALLBACK_TEXT
    };
  }
}

export default {
  getAiRuntimeConfig
};
