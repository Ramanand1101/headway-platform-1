const MULTER_ERROR_MESSAGES = {
  LIMIT_FILE_SIZE: 'That photo is too large. Please upload a smaller file.',
  LIMIT_FILE_COUNT: 'Too many files selected at once.',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field.'
};

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  // Multer errors (e.g. LIMIT_FILE_SIZE, LIMIT_FILE_COUNT) don't set `.status`,
  // so without this they'd fall through to a 500 instead of a client error.
  const isMulterError = err.name === 'MulterError';
  const status = err.status || (isMulterError ? 400 : 500);
  const message = (isMulterError && MULTER_ERROR_MESSAGES[err.code]) || err.message || 'Internal server error';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
