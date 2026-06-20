import { runTool } from '../services/toolService.js';
import { query } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackScripts = [
  {
    id: 1,
    title: '价格异议处理：先解释价值再给范围',
    scriptType: 'price_objection',
    scene: '客户觉得报价偏高',
    content: '这个预算我理解的。建站价格主要和页面数量、功能复杂度、设计要求有关。我可以先按你的核心需求给你整理一个平台内可落地的方案和报价区间。'
  },
  {
    id: 2,
    title: '成交话术：引导平台内继续沟通',
    scriptType: 'closing',
    scene: '客户已有明确需求',
    content: '这个方向可以做的。我先在平台内帮你把功能、周期和报价范围梳理清楚，你确认没问题后，我们再按优先级推进。'
  }
];

function matchScript(scripts, scene, message) {
  const normalizedScene = String(scene || '').toLowerCase();
  const normalizedMessage = String(message || '').toLowerCase();

  return scripts.find((item) => item.scriptType === normalizedScene)
    || scripts.find((item) => normalizedMessage && String(item.scene || '').toLowerCase().includes(normalizedMessage))
    || scripts[0];
}

export async function recommendScript(req, res) {
  const { scene, message } = req.body || {};

  try {
    const rows = await query(
      'SELECT id, title, script_type, scene, content FROM sales_scripts WHERE status = ? ORDER BY sort_order DESC, id DESC',
      ['active']
    );
    const scripts = rows.map((row) => ({
      id: row.id,
      title: row.title,
      scriptType: row.script_type,
      scene: row.scene,
      content: row.content
    }));
    const matched = matchScript(scripts, scene, message);
    return success(res, matched);
  } catch {
    const matched = matchScript(fallbackScripts, scene, message);
    return success(res, matched);
  }
}

export async function runToolController(req, res) {
  const { toolKey } = req.params;
  return success(res, runTool(toolKey, req.body || {}));
}

export default {
  recommendScript,
  runToolController
};
