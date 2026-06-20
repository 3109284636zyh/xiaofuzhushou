import { insertAndFetch, query } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackFavorites = [
  { id: 1, recordType: 'article', recordId: 1, titleSnapshot: '企业官网标准页面怎么规划', status: 'active' }
];

const fallbackHistory = [
  { id: 1, recordType: 'quote', keyword: '企业官网 5000 预算', titleSnapshot: '企业官网报价记录', contentSnapshot: '报价范围：￥3000 - ￥8000', status: 'active', createdAt: '2026-06-20 10:00:00' }
];

function mapFavorite(row) {
  return {
    id: row.id,
    recordType: row.record_type ?? row.recordType,
    recordId: Number(row.record_id ?? row.recordId ?? 0),
    titleSnapshot: row.title_snapshot ?? row.titleSnapshot,
    status: row.status
  };
}

function mapHistory(row) {
  return {
    id: row.id,
    recordType: row.record_type ?? row.recordType,
    keyword: row.keyword,
    titleSnapshot: row.title_snapshot ?? row.titleSnapshot,
    contentSnapshot: row.content_snapshot ?? row.contentSnapshot,
    status: row.status,
    createdAt: row.created_at ?? row.createdAt ?? null
  };
}

export async function createFavorite(req, res) {
  const payload = {
    record_type: req.body?.recordType,
    record_id: Number(req.body?.recordId || 0),
    title_snapshot: req.body?.titleSnapshot || null,
    status: 'active'
  };

  try {
    const row = await insertAndFetch('favorites', payload);
    return success(res, mapFavorite(row));
  } catch {
    const item = mapFavorite({ id: Date.now(), ...payload });
    fallbackFavorites.unshift(item);
    return success(res, item);
  }
}

export async function listFavorites(req, res) {
  try {
    const rows = await query('SELECT id, record_type, record_id, title_snapshot, status FROM favorites WHERE status = ? ORDER BY created_at DESC LIMIT 50', ['active']);
    return success(res, rows.map(mapFavorite));
  } catch {
    return success(res, fallbackFavorites);
  }
}

export async function createHistory(req, res) {
  const payload = {
    record_type: req.body?.recordType,
    keyword: req.body?.keyword || null,
    title_snapshot: req.body?.titleSnapshot || null,
    content_snapshot: req.body?.contentSnapshot || null,
    status: 'active'
  };

  try {
    const row = await insertAndFetch('history_records', payload);
    return success(res, mapHistory(row));
  } catch {
    const item = mapHistory({ id: Date.now(), ...payload, created_at: new Date().toISOString() });
    fallbackHistory.unshift(item);
    return success(res, item);
  }
}

export async function listHistory(req, res) {
  try {
    const rows = await query('SELECT id, record_type, keyword, title_snapshot, content_snapshot, status, created_at FROM history_records WHERE status = ? ORDER BY created_at DESC LIMIT 50', ['active']);
    return success(res, rows.map(mapHistory));
  } catch {
    return success(res, fallbackHistory);
  }
}

export default {
  createFavorite,
  listFavorites,
  createHistory,
  listHistory
};
