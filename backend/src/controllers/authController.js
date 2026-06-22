import jwt from 'jsonwebtoken';
import { ADMIN_PASSWORD, ADMIN_USERNAME, ERROR_CODES, JWT_EXPIRES_IN } from '../config/constants.js';
import env from '../config/env.js';
import { failure, success } from '../utils/response.js';

const ADMIN_NAME = 'AI小福管理员';

export async function login(req, res) {
  const { username = '', password = '' } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return failure(res, ERROR_CODES.FORBIDDEN, '账号或密码错误');
  }

  const token = jwt.sign({ role: 'admin', adminName: ADMIN_NAME, username: ADMIN_USERNAME }, env.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN
  });

  return success(res, {
    token,
    expiresIn: 1800,
    adminName: ADMIN_NAME,
    username: ADMIN_USERNAME
  });
}

export default { login };
