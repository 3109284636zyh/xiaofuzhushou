const { get, post } = require('../../utils/request');

Page({
  data: {
    categories: [],
    articles: [],
    filteredArticles: [],
    selectedCategoryId: null,
    question: '',
    reply: null,
    replyLoading: false
  },
  onLoad() { this.loadKnowledge(); },
  async loadKnowledge() {
    try {
      const [categories, articles] = await Promise.all([
        get('/knowledge/categories'),
        get('/knowledge/articles')
      ]);
      const selectedCategoryId = categories[0] ? categories[0].id : null;
      this.setData({ categories, articles, selectedCategoryId }, this.updateFilteredArticles);
    } catch (error) {}
  },
  updateFilteredArticles() {
    const { articles, selectedCategoryId } = this.data;
    this.setData({ filteredArticles: articles.filter((item) => item.categoryId === selectedCategoryId) });
  },
  selectCategory(event) {
    this.setData({ selectedCategoryId: Number(event.currentTarget.dataset.id) }, this.updateFilteredArticles);
  },
  onQuestionInput(event) { this.setData({ question: event.detail.value }); },
  async generateReply() {
    if (!this.data.question.trim()) {
      wx.showToast({ title: '请输入客户问题', icon: 'none' });
      return;
    }
    this.setData({ replyLoading: true });
    try {
      const reply = await post('/ai/chat', { prompt: this.data.question, scene: 'assistant' });
      this.setData({ reply });
    } catch (error) {
    } finally {
      this.setData({ replyLoading: false });
    }
  },
  copyReply() {
    wx.setClipboardData({ data: this.data.reply.text });
  },
  openArticle(event) {
    wx.navigateTo({ url: `/pages/article-detail/article-detail?id=${event.currentTarget.dataset.id}` });
  }
});
