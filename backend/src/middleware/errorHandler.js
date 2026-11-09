export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const status = err.code === 11000 ? 409 : err.code === 'LIMIT_FILE_SIZE' ? 413 :
    ['ValidationError','CastError','MulterError'].includes(err.name) ? 400 :
    err.status || err.http_code || (res.statusCode >= 400 ? res.statusCode : 500);
  console.error('API request failed', req.method, req.path, status);
  res.status(status).json({success: false, message: status >= 500 ? 'Service unavailable. Please retry.' :
    status === 409 ? 'This identifier is already in use.' : err.message});
};
