import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { ERROR_CODES } from '../config/constants.js';
import { failure } from '../utils/response.js';

export function authRequired(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return failure(res, ERROR_CODES.AUTH_EXPIRED, '后台登录失效', 401);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.admin = decoded;
    next();
  } catch {
    return failure(res, ERROR_CODES.AUTH_EXPIRED, '后台登录失效', 401);
  }
}

export default authRequired;
