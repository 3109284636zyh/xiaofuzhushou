export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'aw3109284636';
export const JWT_EXPIRES_IN = '30m';
export const RISK_SYSTEM_PROMPT = `你是 AI小福，一个用于电商平台建站接单场景的客服助手。
回复必须适合在闲鱼、淘宝、拼多多等平台内沟通。
不得引导客户添加微信、QQ、手机号、邮箱或跳转站外链接。
不得承诺违规服务，不得诱导绕过平台规则。
表达要专业、简短、自然，优先促成平台内继续沟通。`;
export const DEFAULT_FORBIDDEN_WORDS = [
  '微信',
  'wx',
  'WX',
  'VX',
  'vx',
  'QQ',
  '手机号',
  '电话',
  '加我',
  '私聊',
  '站外',
  '线下交易',
  '绕过平台',
  '规避监管'
];
export const DEFAULT_FALLBACK_TEXT = '这个需求可以的，我先根据你描述的功能帮你整理一版建站方案和报价范围，你可以继续在平台里补充行业、页面数量和功能要求，我会帮你细化。';
export const ERROR_CODES = {
  PARAM_ERROR: 40001,
  AUTH_EXPIRED: 40101,
  FORBIDDEN: 40301,
  NOT_FOUND: 40401,
  TOO_MANY_REQUESTS: 42901,
  INTERNAL_ERROR: 50001,
  AI_SERVICE_ERROR: 50002,
  AI_TIMEOUT: 50003,
  RISK_BLOCKED: 50004
};
