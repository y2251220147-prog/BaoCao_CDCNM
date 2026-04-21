// Central error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi hệ thống',
  });
};

module.exports = errorHandler;
