App({
  globalData: {
    appName: 'AI小福智能建站助手',
    apiStatus: '后端安全托管',
    topSpacerHeight: 132
  },
  onLaunch() {
    wx.setStorageSync('ai_xiaofu_launch_at', Date.now());
    this.globalData.topSpacerHeight = this.getTopSpacerHeight();
  },
  getTopSpacerHeight() {
    try {
      const systemInfo = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const statusBarHeight = systemInfo.statusBarHeight || 24;
      const safeTop = menuButton && menuButton.bottom ? menuButton.bottom : statusBarHeight + 44;
      const pxToRpx = 750 / (systemInfo.windowWidth || 375);

      return Math.ceil(safeTop * pxToRpx + 24);
    } catch (error) {
      return 132;
    }
  }
});
