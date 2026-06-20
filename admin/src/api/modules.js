import { apiDelete, apiGet, apiPost, apiPut, setToken } from './client.js';

export async function login(password) {
  const data = await apiPost('/auth/login', { password });
  setToken(data.token);
  return data;
}

export const dashboardApi = {
  get: () => apiGet('/admin/dashboard')
};

export const productsApi = crud('/admin/products');
export const tutorialsApi = crud('/admin/tutorials');
export const scriptsApi = crud('/admin/scripts');
export const ordersApi = crud('/admin/orders');

export const knowledgeApi = {
  listCategories: () => apiGet('/admin/knowledge/categories'),
  createCategory: (payload) => apiPost('/admin/knowledge/categories', payload),
  updateCategory: (id, payload) => apiPut(`/admin/knowledge/categories/${id}`, payload),
  deleteCategory: (id) => apiDelete(`/admin/knowledge/categories/${id}`),
  listArticles: () => apiGet('/admin/knowledge/articles'),
  createArticle: (payload) => apiPost('/admin/knowledge/articles', payload),
  updateArticle: (id, payload) => apiPut(`/admin/knowledge/articles/${id}`, payload),
  deleteArticle: (id) => apiDelete(`/admin/knowledge/articles/${id}`)
};

export const configApi = {
  list: () => apiGet('/admin/configs'),
  update: (configKey, payload) => apiPut(`/admin/configs/${encodeURIComponent(configKey)}`, payload)
};

function crud(basePath) {
  return {
    list: () => apiGet(basePath),
    create: (payload) => apiPost(basePath, payload),
    update: (id, payload) => apiPut(`${basePath}/${id}`, payload),
    remove: (id) => apiDelete(`${basePath}/${id}`)
  };
}
