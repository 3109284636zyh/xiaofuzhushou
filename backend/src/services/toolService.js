const RESERVED_SUMMARY = '该功能已预留统一接口，当前版本提供安全演示结果，真实能力即将接入。';

const RESERVED_TITLES = {
  domain: '域名查询',
  domain_check: '域名查询',
  whois: 'Whois 查询',
  icp: '备案查询',
  speed: '网站测速',
  ssl: 'SSL 检测',
  seo: 'SEO 检测',
  analysis: '网站分析',
  website_analysis: '网站分析'
};

export function runTool(toolKey, payload = {}) {
  const key = String(toolKey || '').trim();

  if (key === 'domain' || key === 'domain_check') {
    return {
      toolKey: key,
      status: 'success',
      title: '域名查询',
      summary: '已返回演示数据，可用于前端统一结果展示。',
      items: [
        { label: '域名', value: payload.domain || '未提供' },
        { label: '状态', value: '可注册性需后续接入实时服务' }
      ]
    };
  }

  return {
    toolKey: key,
    status: 'reserved',
    title: RESERVED_TITLES[key] || '扩展工具',
    summary: RESERVED_SUMMARY,
    items: [
      { label: 'toolKey', value: key || 'unknown' },
      { label: 'message', value: '功能已预留，即将接入' }
    ]
  };
}
