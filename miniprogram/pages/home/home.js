const { get } = require('../../utils/request');

Page({
  data: {
    summary: { stats: { todayUsage: 0, todayReplies: 0, todayDeals: 0 } },
    products: [],
    tutorials: [],
    recent: [],
    quickActions: [
      { key: 'ai', title: 'AI智能回复', desc: '生成平台内安全话术', icon: '✦' },
      { key: 'quote', title: '智能报价', desc: '估算价格和周期', icon: '￥' },
      { key: 'knowledge', title: '建站百科', desc: '查建站知识', icon: '书' },
      { key: 'product', title: '热卖产品', desc: '查看主推服务', icon: '火' }
    ]
  },
  onLoad() { this.loadHome(); },
  async loadHome() {
    try {
      const [summary, products, tutorials, recent] = await Promise.all([
        get('/app/home/summary'),
        get('/products/hot'),
        get('/tutorials/latest'),
        get('/usage/recent')
      ]);
      this.setData({ summary, products, tutorials, recent });
    } catch (error) {}
  },
  goSearch() { wx.switchTab({ url: '/pages/search/search' }); },
  handleQuick(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'ai') wx.navigateTo({ url: '/pages/ai-chat/ai-chat' });
    if (key === 'quote') wx.navigateTo({ url: '/pages/quote/quote' });
    if (key === 'knowledge') wx.switchTab({ url: '/pages/assistant/assistant' });
    if (key === 'product') wx.switchTab({ url: '/pages/home/home' });
  }
});
