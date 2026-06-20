export function success(res, data, message = 'success') {
  return res.json({
    code: 0,
    message,
    data
  });
}

export function failure(res, code, message, httpStatus = 200, data = null) {
  return res.status(httpStatus).json({
    code,
    message,
    data
  });
}

export function asyncHandler(fn) {
  return async function wrappedAsyncHandler(req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
