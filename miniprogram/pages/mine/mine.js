const { get } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    topSpacerHeight: 132,
    records: [],
    listTitle: '',
    statusRows: [
      { label: 'DeepSeek API', value: '后端安全托管', pill: true, iconPath: '/assets/icons/ui/api.png' },
      { label: '风控机制', value: '已启用', pill: true, iconPath: '/assets/icons/ui/shield.png' },
      { label: '请求域名', value: 'wfr.ccvo.top', pill: false, iconPath: '/assets/icons/ui/globe.png' }
    ],
    menuItems: [
      { label: '收藏内容', action: 'favorites', iconPath: '/assets/icons/ui/bookmark.png' },
      { label: '历史记录', action: 'history', iconPath: '/assets/icons/ui/history.png' },
      { label: 'AI 配置', action: '', iconPath: '/assets/icons/ui/ai.png' },
      { label: 'API 管理', action: '', iconPath: '/assets/icons/ui/api.png' },
      { label: '更新日志：V3.0 MVP', action: '', iconPath: '/assets/icons/ui/log.png' },
      { label: '联系客服：请在平台内继续沟通', action: '', iconPath: '/assets/icons/ui/customer-service.png' }
    ]
  },
  onLoad() {
    this.setLayoutMetrics();
  },
  setLayoutMetrics() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
  },
  openMenu(event) {
    const action = event.currentTarget.dataset.action;
    if (action === 'favorites') this.openFavorites();
    if (action === 'history') this.openHistory();
  },
  async openFavorites() {
    try {
      const records = await get('/favorites');
      this.setData({ records, listTitle: '收藏内容' });
    } catch (error) {}
  },
  async openHistory() {
    try {
      const records = await get('/history');
      this.setData({ records, listTitle: '历史记录' });
    } catch (error) {}
  }
});
