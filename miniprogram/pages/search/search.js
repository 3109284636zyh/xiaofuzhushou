const { get } = require('../../utils/request');

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    loading: false
  },
  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
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
      this.setData({ results });
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
