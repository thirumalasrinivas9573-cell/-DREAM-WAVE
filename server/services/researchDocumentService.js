const crypto = require('crypto')
const ResearchSourceChunk = require('../models/ResearchSourceChunk')

const CHUNK_SIZE = 900
const CHUNK_OVERLAP = 120

function hashText(text) {
  return crypto.createHash('sha256').update(String(text || '')).digest('hex').slice(0, 32)
}

function splitIntoChunks(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return []
  const chunks = []
  let start = 0
  let order = 0
  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + CHUNK_SIZE)
    const slice = normalized.slice(start, end).trim()
    if (slice.length >= 40) {
      chunks.push({
        order,
        text: slice,
        wordCount: slice.split(/\s+/).length,
        contentHash: hashText(slice),
      })
      order += 1
    }
    if (end >= normalized.length) break
    start = Math.max(start + 1, end - CHUNK_OVERLAP)
  }
  return chunks
}

async function indexSourceText({ studentId, projectId, sourceId, rawText }) {
  await ResearchSourceChunk.deleteMany({ sourceId })
  const parts = splitIntoChunks(rawText)
  if (!parts.length) return { chunkCount: 0 }
  const docs = parts.map((chunk) => ({
    studentId,
    projectId,
    sourceId,
    ...chunk,
  }))
  await ResearchSourceChunk.insertMany(docs, { ordered: false })
  return { chunkCount: docs.length }
}

function scoreChunk(chunk, terms) {
  const lower = chunk.text.toLowerCase()
  let score = 0
  terms.forEach((term) => {
    if (term.length < 2) return
    score += (lower.split(term).length - 1) * (term.length > 4 ? 3 : 1)
  })
  return score
}

async function retrieveProjectChunks(projectId, query, { limit = 6, sourceIds = null } = {}) {
  const terms = String(query || '')
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2)
    .slice(0, 12)

  const filter = { projectId }
  if (sourceIds?.length) filter.sourceId = { $in: sourceIds }

  let chunks = await ResearchSourceChunk.find(filter).sort({ sourceId: 1, order: 1 }).lean()
  if (terms.length) {
    chunks = chunks
      .map((c) => ({ ...c, score: scoreChunk(c, terms) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
  }
  return chunks.slice(0, limit)
}

module.exports = {
  hashText,
  splitIntoChunks,
  indexSourceText,
  retrieveProjectChunks,
}
