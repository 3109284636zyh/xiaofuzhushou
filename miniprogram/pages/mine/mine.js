const { get } = require('../../utils/request');

Page({
  data: {
    records: [],
    listTitle: ''
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
