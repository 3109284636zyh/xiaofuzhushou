import { insertAndFetch, query, queryOne } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackProducts = [
  { id: 1, name: '企业官网', type: 'website', priceMin: 3000, priceMax: 8000, durationDays: 10, description: '适合企业展示、品牌介绍、新闻动态和表单咨询。', isHot: true, sortOrder: 10, status: 'active' },
  { id: 2, name: 'WordPress建站', type: 'wordpress', priceMin: 2500, priceMax: 7000, durationDays: 7, description: '适合快速上线官网、博客、外贸展示和内容型网站。', isHot: true, sortOrder: 20, status: 'active' }
];

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    priceMin: Number(row.price_min ?? row.priceMin ?? 0),
    priceMax: Number(row.price_max ?? row.priceMax ?? 0),
    durationDays: Number(row.duration_days ?? row.durationDays ?? 0),
    description: row.description,
    isHot: Boolean(row.is_hot ?? row.isHot),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    status: row.status
  };
}

export async function listProducts(req, res) {
  try {
    const rows = await query('SELECT id, name, type, price_min, price_max, duration_days, description, is_hot, sort_order, status FROM products ORDER BY sort_order DESC, id DESC', []);
    return success(res, rows.map(mapProduct));
  } catch {
    return success(res, fallbackProducts);
  }
}

export async function createProduct(req, res) {
  const payload = {
    name: req.body?.name,
    type: req.body?.type,
    price_min: Number(req.body?.priceMin || 0),
    price_max: Number(req.body?.priceMax || 0),
    duration_days: Number(req.body?.durationDays || 0),
    description: req.body?.description || null,
    is_hot: req.body?.isHot ? 1 : 0,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'active'
  };

  try {
    const row = await insertAndFetch('products', payload);
    return success(res, mapProduct(row));
  } catch {
    const item = mapProduct({ id: Date.now(), ...payload });
    fallbackProducts.unshift(item);
    return success(res, item);
  }
}

export async function updateProduct(req, res) {
  const id = Number(req.params.id);
  const payload = {
    name: req.body?.name,
    type: req.body?.type,
    price_min: Number(req.body?.priceMin || 0),
    price_max: Number(req.body?.priceMax || 0),
    duration_days: Number(req.body?.durationDays || 0),
    description: req.body?.description || null,
    is_hot: req.body?.isHot ? 1 : 0,
    sort_order: Number(req.body?.sortOrder || 0),
    status: req.body?.status || 'active'
  };

  try {
    await query('UPDATE products SET name = ?, type = ?, price_min = ?, price_max = ?, duration_days = ?, description = ?, is_hot = ?, sort_order = ?, status = ? WHERE id = ?', [payload.name, payload.type, payload.price_min, payload.price_max, payload.duration_days, payload.description, payload.is_hot, payload.sort_order, payload.status, id]);
    const row = await queryOne('SELECT id, name, type, price_min, price_max, duration_days, description, is_hot, sort_order, status FROM products WHERE id = ?', [id]);
    return success(res, mapProduct(row));
  } catch {
    const updated = mapProduct({ id, ...payload });
    const index = fallbackProducts.findIndex((item) => item.id === id);
    if (index >= 0) fallbackProducts[index] = updated;
    return success(res, updated);
  }
}

export async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM products WHERE id = ?', [id]);
  } catch {
    const index = fallbackProducts.findIndex((item) => item.id === id);
    if (index >= 0) fallbackProducts.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export default {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
