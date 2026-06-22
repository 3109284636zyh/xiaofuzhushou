const { get, post } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    topSpacerHeight: 132,
    id: null,
    article: null
  },
  onLoad(options) {
    this.setLayoutMetrics();
    this.setData({ id: Number(options.id) });
    this.loadArticle();
  },
  setLayoutMetrics() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
  },
  async loadArticle() {
    try {
      const article = await get(`/knowledge/articles/${this.data.id}`);
      this.setData({ article });
    } catch (error) {}
  },
  async collectArticle() {
    if (!this.data.article) return;
    try {
      await post('/favorites', {
        recordType: 'article',
        recordId: this.data.article.id,
        titleSnapshot: this.data.article.title
      });
      wx.showToast({ title: '已收藏', icon: 'success' });
    } catch (error) {}
  }
});
