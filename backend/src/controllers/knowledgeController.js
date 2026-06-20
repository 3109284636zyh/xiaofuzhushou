import { insertAndFetch, query, queryOne } from '../db/query.js';
import { ERROR_CODES } from '../config/constants.js';
import { failure, success } from '../utils/response.js';

const fallbackCategories = [
  { id: 1, name: '建站基础', slug: 'website-basics', description: '适合快速了解企业官网与展示站的核心组成。', sortOrder: 10, status: 'active' },
  { id: 2, name: '域名服务器', slug: 'domain-hosting', description: '覆盖域名、服务器、DNS 与备案基础。', sortOrder: 20, status: 'active' },
  { id: 3, name: 'WordPress', slug: 'wordpress', description: '面向内容站、展示站和常用插件场景。', sortOrder: 30, status: 'active' }
];

const fallbackArticles = [
  { id: 1, categoryId: 1, title: '企业官网标准页面怎么规划', summary: '帮助客户快速理解首页、产品、案例、关于我们和联系页的作用。', content: '企业官网 MVP 一般至少包含：首页、产品/服务、案例、关于我们、联系页。', tags: '企业官网,页面规划,建站基础', sortOrder: 10, status: 'published' },
  { id: 2, categoryId: 2, title: '域名、服务器和备案的关系', summary: '解释域名、服务器、SSL 与备案之间的常见问题。', content: '域名是访问入口，服务器用于承载网站程序与数据。', tags: '域名,服务器,备案,SSL', sortOrder: 20, status: 'published' },
  { id: 3, categoryId: 3, title: 'WordPress 建站适合哪些业务', summary: '总结 WordPress 在官网、博客、内容站和外贸站中的适用性。', content: 'WordPress 适合内容管理需求强、上线速度要求高、预算中等的项目。', tags: 'WordPress,官网,外贸站', sortOrder: 30, status: 'published' }
];

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    status: row.status
  };
}

function mapArticle(row) {
  return {
    id: row.id,
    categoryId: Number(row.category_id ?? row.categoryId),
    title: row.title,
    summary: row.summary,
    content: row.content,
    tags: row.tags,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    status: row.status
  };
}

export async function getCategories(req, res) {
  try {
    const rows = await query('SELECT id, name, slug, description, sort_order, status FROM knowledge_categories WHERE status = ? ORDER BY sort_order DESC, id DESC', ['active']);
    return success(res, rows.map(mapCategory));
  } catch {
    return success(res, fallbackCategories);
  }
}

export async function getArticles(req, res) {
  const { categoryId, keyword } = req.query || {};
  const keywordValue = String(keyword || '').trim().toLowerCase();

  try {
    const rows = await query(
      'SELECT id, category_id, title, summary, content, tags, sort_order, status FROM knowledge_articles WHERE status = ? AND (? IS NULL OR category_id = ?) AND (? = "" OR title LIKE ? OR summary LIKE ? OR tags LIKE ?) ORDER BY sort_order DESC, id DESC',
      ['published', categoryId ? Number(categoryId) : null, categoryId ? Number(categoryId) : null, keywordValue, `%${keywordValue}%`, `%${keywordValue}%`, `%${keywordValue}%`]
    );
    return success(res, rows.map(mapArticle));
  } catch {
    let data = fallbackArticles.filter((item) => item.status === 'published');
    if (categoryId) {
      data = data.filter((item) => item.categoryId === Number(categoryId));
    }
    if (keywordValue) {
      data = data.filter((item) => `${item.title} ${item.summary} ${item.tags}`.toLowerCase().includes(keywordValue));
    }
    return success(res, data);
  }
}

export async function getArticleDetail(req, res) {
  const id = Number(req.params.id);

  try {
    const row = await queryOne('SELECT id, category_id, title, summary, content, tags, sort_order, status FROM knowledge_articles WHERE id = ? AND status = ?', [id, 'published']);
    if (!row) {
      return failure(res, ERROR_CODES.NOT_FOUND, '数据不存在', 404);
    }
    return success(res, mapArticle(row));
  } catch {
    const item = fallbackArticles.find((article) => article.id === id && article.status === 'published');
    if (!item) {
      return failure(res, ERROR_CODES.NOT_FOUND, '数据不存在', 404);
    }
    return success(res, item);
  }
}

export async function adminListCategories(req, res) {
  try {
    const rows = await query('SELECT id, name, slug, description, sort_order, status FROM knowledge_categories ORDER BY sort_order DESC, id DESC', []);
    return success(res, rows.map(mapCategory));
  } catch {
    return success(res, fallbackCategories);
  }
}

export async function adminCreateCategory(req, res) {
  const payload = {
    name: req.body?.name,
    slug: req.body?.slug,
    description: req.body?.description || null,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'active'
  };

  try {
    const row = await insertAndFetch('knowledge_categories', payload);
    return success(res, mapCategory(row));
  } catch {
    const item = { id: Date.now(), name: payload.name, slug: payload.slug, description: payload.description, sortOrder: payload.sort_order, status: payload.status };
    fallbackCategories.unshift(item);
    return success(res, item);
  }
}

export async function adminUpdateCategory(req, res) {
  const id = Number(req.params.id);
  const payload = {
    name: req.body?.name,
    slug: req.body?.slug,
    description: req.body?.description || null,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'active'
  };

  try {
    await query('UPDATE knowledge_categories SET name = ?, slug = ?, description = ?, sort_order = ?, status = ? WHERE id = ?', [payload.name, payload.slug, payload.description, payload.sort_order, payload.status, id]);
    const row = await queryOne('SELECT id, name, slug, description, sort_order, status FROM knowledge_categories WHERE id = ?', [id]);
    return success(res, mapCategory(row));
  } catch {
    const index = fallbackCategories.findIndex((item) => item.id === id);
    const updated = { id, name: payload.name, slug: payload.slug, description: payload.description, sortOrder: payload.sort_order, status: payload.status };
    if (index >= 0) fallbackCategories[index] = updated;
    return success(res, updated);
  }
}

export async function adminDeleteCategory(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM knowledge_categories WHERE id = ?', [id]);
  } catch {
    const index = fallbackCategories.findIndex((item) => item.id === id);
    if (index >= 0) fallbackCategories.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export async function adminListArticles(req, res) {
  try {
    const rows = await query('SELECT id, category_id, title, summary, content, tags, sort_order, status FROM knowledge_articles ORDER BY sort_order DESC, id DESC', []);
    return success(res, rows.map(mapArticle));
  } catch {
    return success(res, fallbackArticles);
  }
}

export async function adminCreateArticle(req, res) {
  const payload = {
    category_id: Number(req.body?.categoryId || 0),
    title: req.body?.title,
    summary: req.body?.summary || null,
    content: req.body?.content || '',
    tags: req.body?.tags || null,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'published'
  };

  try {
    const row = await insertAndFetch('knowledge_articles', payload);
    return success(res, mapArticle(row));
  } catch {
    const item = { id: Date.now(), categoryId: payload.category_id, title: payload.title, summary: payload.summary, content: payload.content, tags: payload.tags, sortOrder: payload.sort_order, status: payload.status };
    fallbackArticles.unshift(item);
    return success(res, item);
  }
}

export async function adminUpdateArticle(req, res) {
  const id = Number(req.params.id);
  const payload = {
    category_id: Number(req.body?.categoryId || 0),
    title: req.body?.title,
    summary: req.body?.summary || null,
    content: req.body?.content || '',
    tags: req.body?.tags || null,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'published'
  };

  try {
    await query('UPDATE knowledge_articles SET category_id = ?, title = ?, summary = ?, content = ?, tags = ?, sort_order = ?, status = ? WHERE id = ?', [payload.category_id, payload.title, payload.summary, payload.content, payload.tags, payload.sort_order, payload.status, id]);
    const row = await queryOne('SELECT id, category_id, title, summary, content, tags, sort_order, status FROM knowledge_articles WHERE id = ?', [id]);
    return success(res, mapArticle(row));
  } catch {
    const updated = { id, categoryId: payload.category_id, title: payload.title, summary: payload.summary, content: payload.content, tags: payload.tags, sortOrder: payload.sort_order, status: payload.status };
    const index = fallbackArticles.findIndex((item) => item.id === id);
    if (index >= 0) fallbackArticles[index] = updated;
    return success(res, updated);
  }
}

export async function adminDeleteArticle(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM knowledge_articles WHERE id = ?', [id]);
  } catch {
    const index = fallbackArticles.findIndex((item) => item.id === id);
    if (index >= 0) fallbackArticles.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export default {
  getCategories,
  getArticles,
  getArticleDetail,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListArticles,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle
};
