const { API_BASE_URL } = require('../config/index');

function request(options) {
  const { url, method = 'GET', data = {}, header = {} } = options;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      success(res) {
        const payload = res.data || {};
        if (payload.code === 0) {
          resolve(payload.data);
          return;
        }
        const message = payload.message || '请求失败';
        wx.showToast({ title: message, icon: 'none' });
        reject(new Error(message));
      },
      fail(error) {
        const message = error.errMsg || '网络异常';
        wx.showToast({ title: message, icon: 'none' });
        reject(new Error(message));
      }
    });
  });
}

function get(url, data) {
  return request({ url, data, method: 'GET' });
}

function post(url, data) {
  return request({ url, data, method: 'POST' });
}

module.exports = {
  request,
  get,
  post
};
