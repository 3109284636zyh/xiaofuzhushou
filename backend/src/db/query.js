import { getPool } from './pool.js';

function sanitizeIdentifier(value) {
  const identifier = String(value || '').trim();
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid identifier: ${identifier}`);
  }
  return identifier;
}

export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function insertAndFetch(table, payload) {
  const tableName = sanitizeIdentifier(table);
  const entries = Object.entries(payload || {}).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    throw new Error('insertAndFetch payload is empty');
  }

  const columns = entries.map(([key]) => `\`${sanitizeIdentifier(key)}\``).join(', ');
  const placeholders = entries.map(() => '?').join(', ');
  const values = entries.map(([, value]) => value);
  const result = await query(`INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`, values);
  return queryOne(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [result.insertId]);
}
