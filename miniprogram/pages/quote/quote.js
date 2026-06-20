const { post } = require('../../utils/request');

Page({
  data: {
    loading: false,
    form: {
      demand: '',
      budget: '',
      deadline: '',
      productType: 'website'
    },
    result: null
  },
  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  async submit() {
    if (!this.data.form.demand.trim()) {
      wx.showToast({ title: '请输入客户需求', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const result = await post('/quote/generate', this.data.form);
      this.setData({ result });
    } catch (error) {
    } finally {
      this.setData({ loading: false });
    }
  },
  copyQuote() {
    const result = this.data.result;
    if (!result) return;
    const text = `${result.productType}\n报价：${result.priceRange}\n周期：${result.durationDays}天\n功能：${result.features.join('、')}\n${result.summary}`;
    wx.setClipboardData({ data: text });
  }
});
