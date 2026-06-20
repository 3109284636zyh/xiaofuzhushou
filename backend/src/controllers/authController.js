import jwt from 'jsonwebtoken';
import { ADMIN_PASSWORD, ERROR_CODES, JWT_EXPIRES_IN } from '../config/constants.js';
import env from '../config/env.js';
import { failure, success } from '../utils/response.js';

export async function login(req, res) {
  const { password } = req.body || {};

  if (password !== ADMIN_PASSWORD) {
    return failure(res, ERROR_CODES.FORBIDDEN, '密码错误');
  }

  const token = jwt.sign({ role: 'admin', adminName: 'AI小福管理员' }, env.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN
  });

  return success(res, {
    token,
    expiresIn: 1800,
    adminName: 'AI小福管理员'
  });
}

export default { login };
