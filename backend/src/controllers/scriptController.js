import { insertAndFetch, query, queryOne } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackScripts = [
  { id: 1, title: '价格异议处理：先解释价值再给范围', scriptType: 'price_objection', scene: '客户觉得报价偏高', content: '这个预算我理解的。建站价格主要和页面数量、功能复杂度、设计要求有关。', sortOrder: 10, status: 'active' },
  { id: 2, title: '催单话术：推动补充需求', scriptType: 'follow_up', scene: '客户迟迟未给资料', content: '你这边如果方便，可以直接在平台里补充一下行业、参考站和预计上线时间。', sortOrder: 20, status: 'active' }
];

function mapScript(row) {
  return {
    id: row.id,
    title: row.title,
    scriptType: row.script_type ?? row.scriptType,
    scene: row.scene,
    content: row.content,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    status: row.status
  };
}

export async function listScripts(req, res) {
  try {
    const rows = await query('SELECT id, title, script_type, scene, content, sort_order, status FROM sales_scripts ORDER BY sort_order DESC, id DESC', []);
    return success(res, rows.map(mapScript));
  } catch {
    return success(res, fallbackScripts);
  }
}

export async function createScript(req, res) {
  const payload = {
    title: req.body?.title,
    script_type: req.body?.scriptType,
    scene: req.body?.scene || null,
    content: req.body?.content || '',
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'active'
  };

  try {
    const row = await insertAndFetch('sales_scripts', payload);
    return success(res, mapScript(row));
  } catch {
    const item = mapScript({ id: Date.now(), ...payload });
    fallbackScripts.unshift(item);
    return success(res, item);
  }
}

export async function updateScript(req, res) {
  const id = Number(req.params.id);
  const payload = {
    title: req.body?.title,
    script_type: req.body?.scriptType,
    scene: req.body?.scene || null,
    content: req.body?.content || '',
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'active'
  };

  try {
    await query('UPDATE sales_scripts SET title = ?, script_type = ?, scene = ?, content = ?, sort_order = ?, status = ? WHERE id = ?', [payload.title, payload.script_type, payload.scene, payload.content, payload.sort_order, payload.status, id]);
    const row = await queryOne('SELECT id, title, script_type, scene, content, sort_order, status FROM sales_scripts WHERE id = ?', [id]);
    return success(res, mapScript(row));
  } catch {
    const updated = mapScript({ id, ...payload });
    const index = fallbackScripts.findIndex((item) => item.id === id);
    if (index >= 0) fallbackScripts[index] = updated;
    return success(res, updated);
  }
}

export async function deleteScript(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM sales_scripts WHERE id = ?', [id]);
  } catch {
    const index = fallbackScripts.findIndex((item) => item.id === id);
    if (index >= 0) fallbackScripts.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export default {
  listScripts,
  createScript,
  updateScript,
  deleteScript
};
