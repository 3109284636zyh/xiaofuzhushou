import mysql from 'mysql2/promise';
import env from '../config/env.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.dbHost,
      user: env.dbUser,
      password: env.dbPassword,
      database: env.dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }

  return pool;
}

export default getPool;
