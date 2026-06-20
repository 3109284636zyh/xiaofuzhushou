import { query } from '../db/query.js';

const fallbackProducts = [
  {
    id: 1,
    name: '企业官网',
    description: '适合企业展示、品牌介绍、新闻动态和表单咨询。'
  },
  {
    id: 2,
    name: 'WordPress建站',
    description: '适合快速上线官网、博客、外贸展示和内容型网站。'
  },
  {
    id: 3,
    name: '微信小程序',
    description: '适合预约、展示、商城、服务工具等微信生态场景。'
  }
];

const fallbackArticles = [
  {
    id: 1,
    title: '企业官网标准页面怎么规划',
    summary: '帮助客户快速理解首页、产品、案例、关于我们和联系页的作用。'
  },
  {
    id: 2,
    title: '域名、服务器和备案的关系',
    summary: '解释域名、服务器、SSL 与备案之间的常见问题。'
  }
];

const fallbackTutorials = [
  {
    id: 1,
    title: '域名购买与解析入门',
    summary: '从购买到解析生效，帮助客户理解建站前置准备。'
  },
  {
    id: 2,
    title: '网站上线前检查清单',
    summary: '梳理备案、SSL、表单、统计代码和搜索引擎设置。'
  }
];

const fallbackHistory = [
  {
    id: 1,
    titleSnapshot: '企业官网报价记录',
    contentSnapshot: '报价范围：￥3000 - ￥8000',
    keyword: '企业官网 5000 预算'
  },
  {
    id: 2,
    titleSnapshot: '客户咨询 WordPress 建站',
    contentSnapshot: '客户关注上线速度和维护成本',
    keyword: 'wordpress 建站'
  }
];

function includesKeyword(text, keyword) {
  return String(text || '').toLowerCase().includes(String(keyword || '').toLowerCase());
}

function toResult(type, title, summary, targetId) {
  return { type, title, summary, targetId };
}

function buildFallbackResults(q, type) {
  const keyword = String(q || '').trim();
  const allow = (candidateType) => type === 'all' || type === candidateType;
  const results = [];

  if (allow('product')) {
    for (const item of fallbackProducts) {
      if (!keyword || includesKeyword(`${item.name} ${item.description}`, keyword)) {
        results.push(toResult('product', item.name, item.description, item.id));
      }
    }
  }

  if (allow('article')) {
    for (const item of fallbackArticles) {
      if (!keyword || includesKeyword(`${item.title} ${item.summary}`, keyword)) {
        results.push(toResult('article', item.title, item.summary, item.id));
      }
    }
  }

  if (allow('tutorial')) {
    for (const item of fallbackTutorials) {
      if (!keyword || includesKeyword(`${item.title} ${item.summary}`, keyword)) {
        results.push(toResult('tutorial', item.title, item.summary, item.id));
      }
    }
  }

  if (allow('history')) {
    for (const item of fallbackHistory) {
      if (!keyword || includesKeyword(`${item.titleSnapshot} ${item.contentSnapshot} ${item.keyword}`, keyword)) {
        results.push(toResult('history', item.titleSnapshot, item.contentSnapshot, item.id));
      }
    }
  }

  return results;
}

export async function searchContent({ q = '', type = 'all' } = {}) {
  const searchType = String(type || 'all');
  const keyword = String(q || '').trim();
  const likeValue = `%${keyword}%`;
  const results = [];

  try {
    if (searchType === 'all' || searchType === 'product') {
      const rows = await query(
        'SELECT id, name, description FROM products WHERE status = ? AND (? = "" OR name LIKE ? OR description LIKE ?) ORDER BY is_hot DESC, sort_order DESC, id DESC LIMIT 20',
        ['active', keyword, likeValue, likeValue]
      );
      results.push(...rows.map((row) => toResult('product', row.name, row.description, row.id)));
    }

    if (searchType === 'all' || searchType === 'article') {
      const rows = await query(
        'SELECT id, title, summary FROM knowledge_articles WHERE status = ? AND (? = "" OR title LIKE ? OR summary LIKE ? OR tags LIKE ?) ORDER BY sort_order DESC, id DESC LIMIT 20',
        ['published', keyword, likeValue, likeValue, likeValue]
      );
      results.push(...rows.map((row) => toResult('article', row.title, row.summary, row.id)));
    }

    if (searchType === 'all' || searchType === 'tutorial') {
      const rows = await query(
        'SELECT id, title, summary FROM tutorials WHERE status = ? AND (? = "" OR title LIKE ? OR summary LIKE ?) ORDER BY published_at DESC, sort_order DESC, id DESC LIMIT 20',
        ['published', keyword, likeValue, likeValue]
      );
      results.push(...rows.map((row) => toResult('tutorial', row.title, row.summary, row.id)));
    }

    if (searchType === 'all' || searchType === 'history') {
      const rows = await query(
        'SELECT id, title_snapshot, content_snapshot FROM history_records WHERE status = ? AND (? = "" OR keyword LIKE ? OR title_snapshot LIKE ? OR content_snapshot LIKE ?) ORDER BY created_at DESC LIMIT 20',
        ['active', keyword, likeValue, likeValue, likeValue]
      );
      results.push(...rows.map((row) => toResult('history', row.title_snapshot, row.content_snapshot, row.id)));
    }

    return results;
  } catch {
    return buildFallbackResults(keyword, searchType);
  }
}

export default searchContent;
