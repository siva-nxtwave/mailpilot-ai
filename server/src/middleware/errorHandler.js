const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    message: err.message,
    code: err.code,
    status: err.statusCode || err.status || 500,
    path: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const errorMessage = err.message || 'An unexpected internal error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

module.exports = errorHandler;
