import { insertAndFetch, query, queryOne } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackTutorials = [
  { id: 1, title: '域名购买与解析入门', summary: '从购买到解析生效，帮助客户理解建站前置准备。', content: '教程内容包括：域名选择建议、常见后缀区别、DNS 解析记录类型与生效时间说明。', sortOrder: 10, status: 'published', publishedAt: '2026-06-20 10:00:00' },
  { id: 2, title: '服务器选购与环境建议', summary: '说明共享主机、轻量服务器和云主机的选型差异。', content: '教程内容包括：按预算选型、流量规模预估、Linux 基础环境。', sortOrder: 20, status: 'published', publishedAt: '2026-06-20 11:00:00' }
];

function mapTutorial(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    coverUrl: row.cover_url ?? row.coverUrl ?? null,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    status: row.status,
    publishedAt: row.published_at ?? row.publishedAt ?? null
  };
}

export async function listTutorials(req, res) {
  try {
    const rows = await query('SELECT id, title, summary, content, cover_url, sort_order, status, published_at FROM tutorials ORDER BY sort_order DESC, id DESC', []);
    return success(res, rows.map(mapTutorial));
  } catch {
    return success(res, fallbackTutorials);
  }
}

export async function createTutorial(req, res) {
  const payload = {
    title: req.body?.title,
    summary: req.body?.summary || null,
    content: req.body?.content || '',
    cover_url: req.body?.coverUrl || null,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'published',
    published_at: req.body?.publishedAt || new Date()
  };

  try {
    const row = await insertAndFetch('tutorials', payload);
    return success(res, mapTutorial(row));
  } catch {
    const item = mapTutorial({ id: Date.now(), ...payload });
    fallbackTutorials.unshift(item);
    return success(res, item);
  }
}

export async function updateTutorial(req, res) {
  const id = Number(req.params.id);
  const payload = {
    title: req.body?.title,
    summary: req.body?.summary || null,
    content: req.body?.content || '',
    cover_url: req.body?.coverUrl || null,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'published',
    published_at: req.body?.publishedAt || new Date()
  };

  try {
    await query('UPDATE tutorials SET title = ?, summary = ?, content = ?, cover_url = ?, sort_order = ?, status = ?, published_at = ? WHERE id = ?', [payload.title, payload.summary, payload.content, payload.cover_url, payload.sort_order, payload.status, payload.published_at, id]);
    const row = await queryOne('SELECT id, title, summary, content, cover_url, sort_order, status, published_at FROM tutorials WHERE id = ?', [id]);
    return success(res, mapTutorial(row));
  } catch {
    const updated = mapTutorial({ id, ...payload });
    const index = fallbackTutorials.findIndex((item) => item.id === id);
    if (index >= 0) fallbackTutorials[index] = updated;
    return success(res, updated);
  }
}

export async function deleteTutorial(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM tutorials WHERE id = ?', [id]);
  } catch {
    const index = fallbackTutorials.findIndex((item) => item.id === id);
    if (index >= 0) fallbackTutorials.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export default {
  listTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial
};
