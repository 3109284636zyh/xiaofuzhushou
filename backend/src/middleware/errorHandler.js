import { ERROR_CODES } from '../config/constants.js';
import { failure } from '../utils/response.js';

export function notFoundHandler(req, res) {
  return failure(res, ERROR_CODES.NOT_FOUND, '接口不存在', 404);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const httpStatus = error.httpStatus || 500;
  const code = error.code || ERROR_CODES.INTERNAL_ERROR;
  const message = error.message || '服务内部错误';
  failure(res, code, message, httpStatus);
}

export default errorHandler;
