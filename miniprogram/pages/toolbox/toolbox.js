const { post } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    topSpacerHeight: 132,
    result: null,
    tools: [
      { key: 'domain', title: '域名查询', desc: '预留接口', iconPath: '/assets/icons/ui/domain.png' },
      { key: 'whois', title: 'Whois查询', desc: '预留接口', iconPath: '/assets/icons/ui/whois.png' },
      { key: 'speed', title: '网站测速', desc: '预留接口', iconPath: '/assets/icons/ui/speed.png' },
      { key: 'ssl', title: 'SSL检测', desc: '预留接口', iconPath: '/assets/icons/ui/lock.png' },
      { key: 'icp', title: '备案查询', desc: '预留接口', iconPath: '/assets/icons/ui/document.png' },
      { key: 'quote', title: '智能报价', desc: '价格周期', iconPath: '/assets/icons/ui/quote.png' },
      { key: 'seo', title: 'SEO检测', desc: '预留接口', iconPath: '/assets/icons/ui/seo.png' },
      { key: 'analysis', title: '网站分析', desc: '预留接口', iconPath: '/assets/icons/ui/stats.png' },
      { key: 'plan', title: 'AI方案生成', desc: '页面功能', iconPath: '/assets/icons/ui/plan.png' }
    ],
    smartActions: [
      { key: 'customer', title: '客户需求分析', desc: '判断 A/B/C 意向', iconPath: '/assets/icons/ui/user.png' },
      { key: 'script', title: '销售话术推荐', desc: '按场景给出平台内话术', iconPath: '/assets/icons/ui/chat.png' }
    ]
  },
  onLoad() {
    this.setLayoutMetrics();
  },
  setLayoutMetrics() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
  },
  async openTool(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'quote') { wx.navigateTo({ url: '/pages/quote/quote' }); return; }
    if (key === 'plan') { wx.navigateTo({ url: '/pages/plan/plan' }); return; }
    try {
      const result = await post(`/tools/${key}/check`, { domain: 'example.com' });
      this.setData({ result });
    } catch (error) {}
  },
  async runSmartAction(event) {
    const key = event.currentTarget.dataset.key;
    try {
      if (key === 'customer') {
        const data = await post('/customer/analyze', { message: '我预算一万，本周要做小程序，能多久交付？' });
        this.setData({ result: { title: data.label, summary: data.nextAction, items: data.reasons.map((value, index) => ({ label: `原因${index + 1}`, value })) } });
      }
      if (key === 'script') {
        const data = await post('/scripts/recommend', { scene: 'price_objection', message: '客户觉得报价高' });
        this.setData({ result: { title: data.title, summary: data.content, items: [{ label: '类型', value: data.scriptType }] } });
      }
    } catch (error) {}
  },
  clearResult() { this.setData({ result: null }); }
});
