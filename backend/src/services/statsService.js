import { query, queryOne } from '../db/query.js';

const homeFallback = {
  stats: {
    todayUsage: 18,
    todayReplies: 9,
    todayDeals: 3
  },
  quickActions: [
    { key: 'ai-chat', title: 'AI智能回复' },
    { key: 'quote', title: '智能报价' },
    { key: 'knowledge', title: '建站百科' },
    { key: 'products', title: '热卖产品' }
  ],
  notice: '欢迎使用 AI小福'
};

const dashboardFallback = {
  todayAiCalls: 18,
  todayQuoteCount: 6,
  aiFailureCount: 2,
  orderStatus: [
    { status: '待沟通', count: 4 },
    { status: '已报价', count: 2 },
    { status: '开发中', count: 1 }
  ],
  hotProducts: [
    { id: 1, name: '企业官网', clicks: 18 },
    { id: 4, name: '微信小程序', clicks: 12 },
    { id: 2, name: 'WordPress建站', clicks: 9 }
  ]
};

export async function getHomeSummary() {
  try {
    const aiCallsRow = await queryOne('SELECT COUNT(*) AS count FROM ai_usage_logs WHERE DATE(created_at) = CURRENT_DATE()', []);
    const replyRow = await queryOne('SELECT COUNT(*) AS count FROM history_records WHERE record_type = ? AND DATE(created_at) = CURRENT_DATE()', ['ai-chat']);
    const dealsRow = await queryOne('SELECT COUNT(*) AS count FROM orders WHERE status = ? AND DATE(created_at) = CURRENT_DATE()', ['已完成']);

    return {
      ...homeFallback,
      stats: {
        todayUsage: Number(aiCallsRow?.count || 0),
        todayReplies: Number(replyRow?.count || 0),
        todayDeals: Number(dealsRow?.count || 0)
      }
    };
  } catch {
    return homeFallback;
  }
}

export async function getAdminDashboard() {
  try {
    const aiCallsRow = await queryOne('SELECT COUNT(*) AS count FROM ai_usage_logs WHERE DATE(created_at) = CURRENT_DATE()', []);
    const aiFailureRow = await queryOne('SELECT COUNT(*) AS count FROM ai_usage_logs WHERE status = ? AND DATE(created_at) = CURRENT_DATE()', ['failed']);
    const quoteRow = await queryOne('SELECT COUNT(*) AS count FROM history_records WHERE record_type = ? AND DATE(created_at) = CURRENT_DATE()', ['quote']);
    const orderStatus = await query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC, status ASC', []);
    const hotProducts = await query('SELECT id, name, (sort_order * 2 + is_hot * 10) AS clicks FROM products WHERE status = ? ORDER BY is_hot DESC, sort_order DESC, id DESC LIMIT 5', ['active']);

    return {
      todayAiCalls: Number(aiCallsRow?.count || 0),
      todayQuoteCount: Number(quoteRow?.count || 0),
      aiFailureCount: Number(aiFailureRow?.count || 0),
      orderStatus: orderStatus.map((row) => ({ status: row.status, count: Number(row.count || 0) })),
      hotProducts: hotProducts.map((row) => ({ id: row.id, name: row.name, clicks: Number(row.clicks || 0) }))
    };
  } catch {
    return dashboardFallback;
  }
}

export default {
  getHomeSummary,
  getAdminDashboard
};
