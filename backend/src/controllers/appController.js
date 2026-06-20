import { query } from '../db/query.js';
import { getHomeSummary } from '../services/statsService.js';
import { success } from '../utils/response.js';

const fallbackHotProducts = [
  {
    id: 1,
    name: '企业官网',
    type: 'website',
    priceMin: 3000,
    priceMax: 8000,
    durationDays: 10,
    description: '适合企业展示、品牌介绍、新闻动态和表单咨询。',
    isHot: true
  },
  {
    id: 2,
    name: 'WordPress建站',
    type: 'wordpress',
    priceMin: 2500,
    priceMax: 7000,
    durationDays: 7,
    description: '适合快速上线官网、博客、外贸展示和内容型网站。',
    isHot: true
  },
  {
    id: 4,
    name: '微信小程序',
    type: 'miniprogram',
    priceMin: 5000,
    priceMax: 15000,
    durationDays: 18,
    description: '适合预约、展示、商城、服务工具等微信生态场景。',
    isHot: true
  }
];

const fallbackTutorials = [
  {
    id: 1,
    title: '域名购买与解析入门',
    summary: '从购买到解析生效，帮助客户理解建站前置准备。',
    publishedAt: '2026-06-20 10:00:00'
  },
  {
    id: 2,
    title: '网站上线前检查清单',
    summary: '梳理备案、SSL、表单、统计代码和搜索引擎设置。',
    publishedAt: '2026-06-20 11:00:00'
  }
];

const fallbackUsage = [
  {
    id: 1,
    recordType: 'ai-chat',
    title: '企业官网报价咨询',
    createdAt: '2026-06-20 10:00:00'
  },
  {
    id: 2,
    recordType: 'quote',
    title: 'WordPress 建站方案',
    createdAt: '2026-06-20 09:30:00'
  }
];

export async function getHealth(req, res) {
  return success(res, { status: 'ok' });
}

export async function getHomeSummaryController(req, res) {
  const data = await getHomeSummary();
  return success(res, data);
}

export async function getHotProducts(req, res) {
  try {
    const rows = await query(
      'SELECT id, name, type, price_min, price_max, duration_days, description, is_hot FROM products WHERE status = ? AND is_hot = 1 ORDER BY sort_order DESC, id DESC LIMIT 8',
      ['active']
    );
    return success(res, rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      priceMin: Number(row.price_min),
      priceMax: Number(row.price_max),
      durationDays: Number(row.duration_days),
      description: row.description,
      isHot: Boolean(row.is_hot)
    })));
  } catch {
    return success(res, fallbackHotProducts);
  }
}

export async function getLatestTutorials(req, res) {
  try {
    const rows = await query(
      'SELECT id, title, summary, published_at FROM tutorials WHERE status = ? ORDER BY published_at DESC, sort_order DESC, id DESC LIMIT 8',
      ['published']
    );
    return success(res, rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      publishedAt: row.published_at
    })));
  } catch {
    return success(res, fallbackTutorials);
  }
}

export async function getRecentUsage(req, res) {
  try {
    const rows = await query(
      'SELECT id, record_type, title_snapshot, created_at FROM history_records WHERE status = ? ORDER BY created_at DESC LIMIT 10',
      ['active']
    );
    return success(res, rows.map((row) => ({
      id: row.id,
      recordType: row.record_type,
      title: row.title_snapshot,
      createdAt: row.created_at
    })));
  } catch {
    return success(res, fallbackUsage);
  }
}

export default {
  getHealth,
  getHomeSummaryController,
  getHotProducts,
  getLatestTutorials,
  getRecentUsage
};
