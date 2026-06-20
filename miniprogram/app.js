App({
  globalData: {
    appName: 'AI小福智能建站助手',
    apiStatus: '后端安全托管'
  },
  onLaunch() {
    wx.setStorageSync('ai_xiaofu_launch_at', Date.now());
  }
});
