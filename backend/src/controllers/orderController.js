import { insertAndFetch, query, queryOne } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackOrders = [
  { id: 1, customerName: '张先生', customerContactMask: '平台内咨询', productType: 'website', demandSummary: '企业官网，5 个页面', quotedPriceMin: 3000, quotedPriceMax: 8000, durationDays: 10, status: '待沟通', source: 'manual', note: '' },
  { id: 2, customerName: '李女士', customerContactMask: '平台内咨询', productType: 'miniprogram', demandSummary: '预约小程序', quotedPriceMin: 5000, quotedPriceMax: 12000, durationDays: 18, status: '已报价', source: 'quote', note: '' }
];

function mapOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name ?? row.customerName,
    customerContactMask: row.customer_contact_mask ?? row.customerContactMask,
    productType: row.product_type ?? row.productType,
    demandSummary: row.demand_summary ?? row.demandSummary,
    quotedPriceMin: Number(row.quoted_price_min ?? row.quotedPriceMin ?? 0),
    quotedPriceMax: Number(row.quoted_price_max ?? row.quotedPriceMax ?? 0),
    durationDays: Number(row.duration_days ?? row.durationDays ?? 0),
    status: row.status,
    source: row.source,
    note: row.note ?? ''
  };
}

export async function listOrders(req, res) {
  try {
    const rows = await query('SELECT id, customer_name, customer_contact_mask, product_type, demand_summary, quoted_price_min, quoted_price_max, duration_days, status, source, note FROM orders ORDER BY id DESC', []);
    return success(res, rows.map(mapOrder));
  } catch {
    return success(res, fallbackOrders);
  }
}

export async function createOrder(req, res) {
  const payload = {
    customer_name: req.body?.customerName,
    customer_contact_mask: req.body?.customerContactMask || '平台内咨询',
    product_type: req.body?.productType,
    demand_summary: req.body?.demandSummary || null,
    quoted_price_min: Number(req.body?.quotedPriceMin || 0),
    quoted_price_max: Number(req.body?.quotedPriceMax || 0),
    duration_days: Number(req.body?.durationDays || 0),
    status: req.body?.status || '待沟通',
    source: req.body?.source || 'manual',
    note: req.body?.note || null
  };

  try {
    const row = await insertAndFetch('orders', payload);
    return success(res, mapOrder(row));
  } catch {
    const item = mapOrder({ id: Date.now(), ...payload });
    fallbackOrders.unshift(item);
    return success(res, item);
  }
}

export async function updateOrder(req, res) {
  const id = Number(req.params.id);
  const payload = {
    customer_name: req.body?.customerName,
    customer_contact_mask: req.body?.customerContactMask || '平台内咨询',
    product_type: req.body?.productType,
    demand_summary: req.body?.demandSummary || null,
    quoted_price_min: Number(req.body?.quotedPriceMin || 0),
    quoted_price_max: Number(req.body?.quotedPriceMax || 0),
    duration_days: Number(req.body?.durationDays || 0),
    status: req.body?.status || '待沟通',
    source: req.body?.source || 'manual',
    note: req.body?.note || null
  };

  try {
    await query('UPDATE orders SET customer_name = ?, customer_contact_mask = ?, product_type = ?, demand_summary = ?, quoted_price_min = ?, quoted_price_max = ?, duration_days = ?, status = ?, source = ?, note = ? WHERE id = ?', [payload.customer_name, payload.customer_contact_mask, payload.product_type, payload.demand_summary, payload.quoted_price_min, payload.quoted_price_max, payload.duration_days, payload.status, payload.source, payload.note, id]);
    const row = await queryOne('SELECT id, customer_name, customer_contact_mask, product_type, demand_summary, quoted_price_min, quoted_price_max, duration_days, status, source, note FROM orders WHERE id = ?', [id]);
    return success(res, mapOrder(row));
  } catch {
    const updated = mapOrder({ id, ...payload });
    const index = fallbackOrders.findIndex((item) => item.id === id);
    if (index >= 0) fallbackOrders[index] = updated;
    return success(res, updated);
  }
}

export async function deleteOrder(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM orders WHERE id = ?', [id]);
  } catch {
    const index = fallbackOrders.findIndex((item) => item.id === id);
    if (index >= 0) fallbackOrders.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export default {
  listOrders,
  createOrder,
  updateOrder,
  deleteOrder
};
