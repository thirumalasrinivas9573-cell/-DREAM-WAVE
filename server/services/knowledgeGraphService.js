const mongoose = require('mongoose')
const KnowledgeGraphEdge = require('../models/KnowledgeGraphEdge')
const Goal = require('../models/Goal')
const Task = require('../models/Task')
const Roadmap = require('../models/Roadmap')
const LibraryProgress = require('../models/LibraryProgress')
const StudentProfile = require('../models/StudentProfile')
const CareerProfile = require('../models/CareerProfile')

const ENTITY_TYPES_LIST = KnowledgeGraphEdge.ENTITY_TYPES
const RELATION_TYPES_LIST = KnowledgeGraphEdge.RELATION_TYPES

const syncCache = new Map()
const SYNC_TTL_MS = 5 * 60 * 1000

function validEntityType(type) {
  return ENTITY_TYPES_LIST.includes(type)
}

function validRelationType(type) {
  return RELATION_TYPES_LIST.includes(type)
}

function entityRef(type, id) {
  return `${type}:${String(id)}`
}

async function upsertEdge(studentId, {
  sourceType, sourceId, targetType, targetId, relationType,
  origin = 'SYSTEM_DERIVED', confidence = null, label = '', metadata = {},
}) {
  if (!validEntityType(sourceType) || !validEntityType(targetType)) {
    throw Object.assign(new Error('Invalid entity type'), { statusCode: 400, code: 'INVALID_ENTITY_TYPE' })
  }
  if (!validRelationType(relationType)) {
    throw Object.assign(new Error('Invalid relation type'), { statusCode: 400, code: 'INVALID_RELATION_TYPE' })
  }
  if (!sourceId || !targetId) {
    throw Object.assign(new Error('Entity id required'), { statusCode: 400, code: 'INVALID_ENTITY_ID' })
  }
  const payload = {
    studentId,
    sourceType,
    sourceId: String(sourceId),
    targetType,
    targetId: String(targetId),
    relationType,
    origin,
    label: String(label || '').slice(0, 200),
    metadata,
  }
  if (origin !== 'EXPLICIT' && confidence != null) payload.confidence = confidence

  return KnowledgeGraphEdge.findOneAndUpdate(
    {
      studentId,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId,
      targetType: payload.targetType,
      targetId: payload.targetId,
      relationType: payload.relationType,
    },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

async function removeEdgesForEntity(studentId, entityType, entityId) {
  const id = String(entityId)
  await KnowledgeGraphEdge.deleteMany({
    studentId,
    $or: [
      { sourceType: entityType, sourceId: id },
      { targetType: entityType, targetId: id },
    ],
  })
}

async function syncFromCanonical(studentId, { force = false } = {}) {
  const key = String(studentId)
  const cached = syncCache.get(key)
  if (!force && cached && Date.now() - cached.at < SYNC_TTL_MS) return cached.result

  const [goals, tasks, roadmaps, reading, profile, career] = await Promise.all([
    Goal.find({ userId: studentId, status: { $ne: 'archived' } }).select('_id title category skills').lean(),
    Task.find({ userId: studentId, status: { $ne: 'archived' } }).select('_id title goalId roadmapId').lean(),
    Roadmap.find({ userId: studentId, status: { $ne: 'archived' } }).populate('goalId', 'title').lean(),
    LibraryProgress.find({ userId: studentId, percent: { $gt: 0 } }).select('bookId percent').lean(),
    StudentProfile.findOne({ userId: studentId }).select('skills projects').lean(),
    CareerProfile.findOne({ userId: studentId }).select('targetCareer targetRoles requiredSkills currentSkills').lean(),
  ])

  let created = 0
  const studentRef = String(studentId)

  for (const goal of goals) {
    await upsertEdge(studentId, {
      sourceType: 'student', sourceId: studentRef,
      targetType: 'goal', targetId: goal._id,
      relationType: 'HAS_GOAL', origin: 'EXPLICIT', label: goal.title,
    })
    created += 1
    for (const skillName of (goal.skills || [])) {
      const skillId = skillName.toLowerCase().replace(/\s+/g, '-')
      await upsertEdge(studentId, {
        sourceType: 'goal', sourceId: goal._id,
        targetType: 'skill', targetId: skillId,
        relationType: 'REQUIRES_SKILL', origin: 'SYSTEM_DERIVED', label: skillName,
      })
      created += 1
    }
  }

  for (const roadmap of roadmaps) {
    const goalId = roadmap.goalId?._id || roadmap.goalId
    if (goalId) {
      await upsertEdge(studentId, {
        sourceType: 'goal', sourceId: goalId,
        targetType: 'roadmap', targetId: roadmap._id,
        relationType: 'PART_OF_ROADMAP', origin: 'SYSTEM_DERIVED',
      })
      created += 1
    }
    const stages = roadmap.learningStages || []
    for (let i = 0; i < stages.length; i += 1) {
      const stage = stages[i]
      const stageId = stage._id || stage.id || `${roadmap._id}-stage-${i}`
      await upsertEdge(studentId, {
        sourceType: 'roadmap', sourceId: roadmap._id,
        targetType: 'roadmap_stage', targetId: stageId,
        relationType: 'PART_OF_ROADMAP', origin: 'SYSTEM_DERIVED', label: stage.title,
      })
      created += 1
      if (i > 0) {
        const prev = stages[i - 1]
        const prevId = prev._id || prev.id || `${roadmap._id}-stage-${i - 1}`
        await upsertEdge(studentId, {
          sourceType: 'roadmap_stage', sourceId: prevId,
          targetType: 'roadmap_stage', targetId: stageId,
          relationType: 'NEXT_STAGE', origin: 'SYSTEM_DERIVED',
        })
        created += 1
      }
      for (const topic of stage.topics || stage.skills || []) {
        const topicId = String(topic).toLowerCase().replace(/\s+/g, '-')
        await upsertEdge(studentId, {
          sourceType: 'roadmap_stage', sourceId: stageId,
          targetType: 'topic', targetId: topicId,
          relationType: 'RELATED_TO', origin: 'SYSTEM_DERIVED', label: String(topic),
        })
        created += 1
      }
    }
  }

  for (const task of tasks) {
    await upsertEdge(studentId, {
      sourceType: 'student', sourceId: studentRef,
      targetType: 'task', targetId: task._id,
      relationType: 'HAS_TASK', origin: 'EXPLICIT', label: task.title,
    })
    created += 1
    if (task.goalId) {
      await upsertEdge(studentId, {
        sourceType: 'task', sourceId: task._id,
        targetType: 'goal', targetId: task.goalId,
        relationType: 'SUPPORTS_GOAL', origin: 'SYSTEM_DERIVED',
      })
      created += 1
    }
    if (task.roadmapId) {
      await upsertEdge(studentId, {
        sourceType: 'task', sourceId: task._id,
        targetType: 'roadmap', targetId: task.roadmapId,
        relationType: 'PART_OF_ROADMAP', origin: 'SYSTEM_DERIVED',
      })
      created += 1
    }
  }

  for (const item of reading) {
    if (!item.bookId) continue
    await upsertEdge(studentId, {
      sourceType: 'student', sourceId: studentRef,
      targetType: 'book', targetId: item.bookId,
      relationType: 'READING_RESOURCE', origin: 'EXPLICIT',
      metadata: { percent: item.percent },
    })
    created += 1
  }

  for (const skill of profile?.skills || []) {
    await upsertEdge(studentId, {
      sourceType: 'student', sourceId: studentRef,
      targetType: 'skill', targetId: skill._id || skill.name?.toLowerCase().replace(/\s+/g, '-'),
      relationType: 'HAS_SKILL', origin: 'EXPLICIT', label: skill.name,
      metadata: { proficiency: skill.proficiency },
    })
    created += 1
  }

  for (const project of profile?.projects || []) {
    await upsertEdge(studentId, {
      sourceType: 'student', sourceId: studentRef,
      targetType: 'project', targetId: project._id,
      relationType: 'PRACTICED_BY', origin: 'EXPLICIT', label: project.title,
    })
    created += 1
    if (project.goalId) {
      await upsertEdge(studentId, {
        sourceType: 'project', sourceId: project._id,
        targetType: 'goal', targetId: project.goalId,
        relationType: 'SUPPORTS_GOAL', origin: 'SYSTEM_DERIVED',
      })
      created += 1
    }
    for (const tech of project.technologies || []) {
      const skillId = tech.toLowerCase().replace(/\s+/g, '-')
      await upsertEdge(studentId, {
        sourceType: 'project', sourceId: project._id,
        targetType: 'skill', targetId: skillId,
        relationType: 'EVIDENCED_BY', origin: 'SYSTEM_DERIVED', label: tech,
      })
      created += 1
    }
  }

  if (career?.targetCareer || career?.targetRoles?.length) {
    const roleId = (career.targetCareer || career.targetRoles[0]).toLowerCase().replace(/\s+/g, '-')
    await upsertEdge(studentId, {
      sourceType: 'student', sourceId: studentRef,
      targetType: 'role', targetId: roleId,
      relationType: 'TARGETS_ROLE', origin: 'EXPLICIT',
      label: career.targetCareer || career.targetRoles[0],
    })
    created += 1
    for (const skill of career.requiredSkills || []) {
      const skillId = (skill.name || skill).toLowerCase().replace(/\s+/g, '-')
      await upsertEdge(studentId, {
        sourceType: 'role', sourceId: roleId,
        targetType: 'skill', targetId: skillId,
        relationType: 'REQUIRES_SKILL', origin: 'SYSTEM_DERIVED', label: skill.name || skill,
      })
      created += 1
    }
    for (const skill of career.currentSkills || []) {
      const skillId = (skill.name || skill).toLowerCase().replace(/\s+/g, '-')
      await upsertEdge(studentId, {
        sourceType: 'student', sourceId: studentRef,
        targetType: 'skill', targetId: skillId,
        relationType: 'HAS_SKILL', origin: 'EXPLICIT', label: skill.name || skill,
      })
      created += 1
    }
  }

  const result = { synced: true, edgeOperations: created, syncedAt: new Date().toISOString() }
  syncCache.set(key, { at: Date.now(), result })
  return result
}

async function getGraphSummary(studentId) {
  const [edgeCount, relationCounts] = await Promise.all([
    KnowledgeGraphEdge.countDocuments({ studentId }),
    KnowledgeGraphEdge.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(String(studentId)) } },
      { $group: { _id: '$relationType', count: { $sum: 1 } } },
    ]),
  ])
  return {
    schemaVersion: 'student-knowledge-graph-v3',
    edgeCount,
    relationCounts: Object.fromEntries(relationCounts.map((r) => [r._id, r.count])),
    entityTypes: ENTITY_TYPES_LIST,
    relationTypes: RELATION_TYPES_LIST,
  }
}

async function getRelatedContext(studentId, { entityType, entityId, limit = 8 } = {}) {
  const id = String(entityId)
  const edges = await KnowledgeGraphEdge.find({
    studentId,
    $or: [
      { sourceType: entityType, sourceId: id },
      { targetType: entityType, targetId: id },
    ],
  }).sort('-updatedAt').limit(limit).lean()
  return edges.map((edge) => ({
    relation: edge.relationType,
    origin: edge.origin,
    from: entityRef(edge.sourceType, edge.sourceId),
    to: entityRef(edge.targetType, edge.targetId),
    label: edge.label || null,
  }))
}

function isEnabled() {
  return process.env.INTELLIGENCE_V3_ENABLED !== 'false'
}

module.exports = {
  ENTITY_TYPES: ENTITY_TYPES_LIST,
  RELATION_TYPES: RELATION_TYPES_LIST,
  upsertEdge,
  removeEdgesForEntity,
  syncFromCanonical,
  getGraphSummary,
  getRelatedContext,
  isEnabled,
  validEntityType,
  validRelationType,
}
