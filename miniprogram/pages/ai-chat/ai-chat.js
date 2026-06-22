const { post } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    topSpacerHeight: 132,
    prompt: '',
    reply: null,
    loading: false
  },
  onLoad() {
    this.setLayoutMetrics();
  },
  setLayoutMetrics() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
  },
  onPromptInput(event) {
    this.setData({ prompt: event.detail.value });
  },
  async submit() {
    if (!this.data.prompt.trim()) {
      wx.showToast({ title: '请输入客户问题', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const reply = await post('/ai/chat', { prompt: this.data.prompt, scene: 'ai-chat' });
      this.setData({ reply });
    } catch (error) {
    } finally {
      this.setData({ loading: false });
    }
  },
  copyReply() {
    if (!this.data.reply) return;
    wx.setClipboardData({ data: this.data.reply.text });
  }
});
