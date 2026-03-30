/**
 * Centralised OpenAI error handler.
 * Returns a user-friendly message and the correct HTTP status.
 */
function handleAIError(err, res, context = 'AI') {
  const isQuota   = err?.status === 429 || err?.code === 'insufficient_quota' || err?.message?.includes('quota');
  const isTimeout = err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout');
  const isInvalid = err?.status === 401;

  console.error(`${context} error:`, err.message);

  if (isQuota)   return res.status(503).json({ message: 'AI service temporarily unavailable. Please try again later.' });
  if (isTimeout) return res.status(503).json({ message: 'AI request timed out. Please try again.' });
  if (isInvalid) return res.status(503).json({ message: 'AI service configuration error.' });

  return res.status(500).json({ message: `${context} failed. Please try again.` });
}

module.exports = { handleAIError };
