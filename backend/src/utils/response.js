function success(res, data, statusCode = 200) {
  res.status(statusCode).json({ data });
}

function error(res, message, statusCode = 400, fields) {
  const body = { error: { message } };
  if (fields) body.error.fields = fields;
  res.status(statusCode).json(body);
}

module.exports = { success, error };
