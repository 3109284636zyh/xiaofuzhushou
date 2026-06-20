const { get, post } = require('../../utils/request');

Page({
  data: {
    id: null,
    article: null
  },
  onLoad(options) {
    this.setData({ id: Number(options.id) });
    this.loadArticle();
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
