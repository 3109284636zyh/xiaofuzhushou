const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'ai_xiaofu_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function redirectToLogin() {
  clearToken();
  const loginPath = `${import.meta.env.BASE_URL}login`;
  if (!window.location.pathname.endsWith('/login')) {
    window.location.href = loginPath;
  }
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'content-type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('服务响应格式异常');
  }

  if (payload.code === 40101) {
    redirectToLogin();
    throw new Error(payload.message || '后台登录失效');
  }

  if (payload.code !== 0) {
    throw new Error(payload.message || '请求失败');
  }

  return payload.data;
}

export function apiGet(path) {
  return apiRequest(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body || {})
  });
}

export function apiPut(path, body) {
  return apiRequest(path, {
    method: 'PUT',
    body: JSON.stringify(body || {})
  });
}

export function apiDelete(path) {
  return apiRequest(path, { method: 'DELETE' });
}
