const { post } = require('../../utils/request');

Page({
  data: {
    prompt: '',
    reply: null,
    loading: false
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
