const { parsePagination, paginationMeta } = require('./pagination');

/**
 * Standard success envelope. Prefer this over ad-hoc res.json shapes for new code.
 * Existing auth token top-level fields remain intentional for frontend compatibility.
 */
function sendSuccess(res, data, { status = 200, message, meta } = {}) {
  const body = { success: true };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;
  if (meta && typeof meta === 'object') body.meta = meta;
  return res.status(status).json(body);
}

function sendMessage(res, message, { status = 200, data } = {}) {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(status).json(body);
}

module.exports = {
  parsePagination,
  paginationMeta,
  sendSuccess,
  sendMessage,
};
