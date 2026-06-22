const { get } = require('../../utils/request');
const app = getApp();

const resultIconMap = {
  article: '/assets/icons/ui/article.png',
  product: '/assets/icons/ui/product.png',
  tutorial: '/assets/icons/ui/knowledge.png',
  history: '/assets/icons/ui/history.png',
  record: '/assets/icons/ui/document.png'
};

Page({
  data: {
    topSpacerHeight: 132,
    keyword: '',
    results: [],
    searched: false,
    loading: false
  },
  onLoad() {
    this.setLayoutMetrics();
  },
  setLayoutMetrics() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
  },
  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
  },
  getResultIcon(type) {
    return resultIconMap[type] || '/assets/icons/ui/document.png';
  },
  async search() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }
    this.setData({ loading: true, searched: true });
    try {
      const results = await get('/search', { q: keyword, type: 'all' });
      this.setData({ results: results.map((item) => ({ ...item, iconPath: this.getResultIcon(item.type) })) });
    } catch (error) {
    } finally {
      this.setData({ loading: false });
    }
  },
  openResult(event) {
    const item = event.currentTarget.dataset.item;
    if (item.type === 'article') {
      wx.navigateTo({ url: `/pages/article-detail/article-detail?id=${item.targetId}` });
    }
  }
});
