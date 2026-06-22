const { get } = require('../../utils/request');

Page({
  data: {
    topSpacerHeight: 132,
    summary: { stats: { todayUsage: 0, todayReplies: 0, todayDeals: 0 } },
    products: [],
    tutorials: [],
    recent: [],
    quickActions: [
      { key: 'ai', title: 'AI智能回复', desc: '生成平台内安全话术', iconPath: '/assets/icons/ui/ai.png' },
      { key: 'quote', title: '智能报价', desc: '估算价格和周期', iconPath: '/assets/icons/ui/quote.png' },
      { key: 'knowledge', title: '建站百科', desc: '查建站知识', iconPath: '/assets/icons/ui/knowledge.png' },
      { key: 'product', title: '热卖产品', desc: '查看主推服务', iconPath: '/assets/icons/ui/product.png' }
    ]
  },

  onLoad() {
    this.setLayoutMetrics();
    this.loadHome();
  },

  setLayoutMetrics() {
    try {
      const systemInfo = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const statusBarHeight = systemInfo.statusBarHeight || 24;
      const safeTop = menuButton && menuButton.bottom ? menuButton.bottom : statusBarHeight + 44;
      const pxToRpx = 750 / (systemInfo.windowWidth || 375);
      const topSpacerHeight = Math.ceil(safeTop * pxToRpx + 24);

      this.setData({ topSpacerHeight });
    } catch (error) {
      this.setData({ topSpacerHeight: 132 });
    }
  },

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
