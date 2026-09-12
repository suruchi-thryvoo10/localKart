export const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null, code = null) => {
  const payload = {
    success: false,
    message,
    code: code || `ERR_${statusCode}`,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
