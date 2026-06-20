import { DEFAULT_FALLBACK_TEXT, DEFAULT_FORBIDDEN_WORDS } from '../config/constants.js';

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWords(forbiddenWords) {
  return [...(forbiddenWords || DEFAULT_FORBIDDEN_WORDS)].sort((a, b) => b.length - a.length);
}

const RISK_PATTERNS = [
  { label: '邮箱地址', regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { label: '外部链接', regex: /(?:https?:\/\/|www\.)[^\s，。！？、)）]+/gi }
];

function collectHits(text, forbiddenWords) {
  const source = String(text || '');
  const words = normalizeWords(forbiddenWords);
  const hits = [];

  for (const word of words) {
    const regex = new RegExp(escapeRegExp(word), 'g');
    if (regex.test(source)) {
      hits.push(word);
    }
  }

  for (const pattern of RISK_PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(source)) {
      hits.push(pattern.label);
    }
  }

  return hits;
}

function replaceRiskPatterns(text) {
  let result = text;
  for (const pattern of RISK_PATTERNS) {
    result = result.replace(pattern.regex, '[已过滤]');
  }
  return result;
}

export function sanitizeInput(text, forbiddenWords) {
  const source = String(text || '');
  const hits = collectHits(source, forbiddenWords);
  let sanitized = source;

  for (const word of hits.filter((hit) => !RISK_PATTERNS.some((pattern) => pattern.label === hit))) {
    const regex = new RegExp(escapeRegExp(word), 'g');
    sanitized = sanitized.replace(regex, '[已过滤]');
  }
  sanitized = replaceRiskPatterns(sanitized);

  return {
    text: sanitized,
    hits
  };
}

export function guardOutput(text, forbiddenWords, fallbackText = DEFAULT_FALLBACK_TEXT) {
  const source = String(text || '');
  const hits = collectHits(source, forbiddenWords);

  if (hits.length > 0) {
    return {
      text: fallbackText,
      blocked: true,
      hits
    };
  }

  return {
    text: source,
    blocked: false,
    hits: []
  };
}
