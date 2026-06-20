import 'dotenv/config';

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  port: parseNumber(process.env.PORT, 3000),
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'ai_xiaofu_v3',
  jwtSecret: process.env.JWT_SECRET || 'replace-with-a-long-random-string',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  deepseekTimeoutMs: parseNumber(process.env.DEEPSEEK_TIMEOUT_MS, 5000),
  corsOrigin: (process.env.CORS_ORIGIN || 'https://wfr.ccvo.top,http://localhost:5173')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
};

export default env;
