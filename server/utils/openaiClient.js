/**
 * Shared OpenAI client — lazy init so the API server can boot without OPENAI_API_KEY.
 * AI routes still work when the key is present; callers get a clear error when it is not.
 */
const OpenAI = require('openai');

let client = null;

function getOpenAI() {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY is not configured');
    err.statusCode = 503;
    throw err;
  }
  client = new OpenAI({ apiKey });
  return client;
}

/** Proxy so existing `openai.chat.completions.create(...)` call sites keep working. */
const openai = new Proxy(
  {},
  {
    get(_target, prop) {
      return getOpenAI()[prop];
    },
  }
);

module.exports = { getOpenAI, openai };
