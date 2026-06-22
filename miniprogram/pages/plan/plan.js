const { post } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    topSpacerHeight: 132,
    loading: false,
    form: {
      industry: '',
      budget: '',
      requirements: ''
    },
    result: null
  },
  onLoad() {
    this.setLayoutMetrics();
  },
  setLayoutMetrics() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
  },
  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },
  async submit() {
    if (!this.data.form.industry.trim() || !this.data.form.requirements.trim()) {
      wx.showToast({ title: '请输入行业和需求', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      const result = await post('/plan/generate', this.data.form);
      this.setData({ result });
    } catch (error) {
    } finally {
      this.setData({ loading: false });
    }
  },
  copyPlan() {
    const result = this.data.result;
    if (!result) return;
    const text = `${result.siteType}\n报价：${result.priceRange}\n周期：${result.durationDays}天\n页面：${result.pages.join('、')}\n功能：${result.features.join('、')}\n${result.proposal}`;
    wx.setClipboardData({ data: text });
  }
});
