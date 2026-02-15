const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : message,
    },
  });
};

module.exports = errorHandler;
