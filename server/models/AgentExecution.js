const mongoose = require('mongoose')
const {
  STEP_STATUSES,
  EXECUTION_STATUSES,
} = require('../constants/multiAgentOrchestration')

const stepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    agentId: { type: String, required: true },
    toolId: { type: String, required: true },
    status: { type: String, enum: STEP_STATUSES, default: 'PENDING' },
    objective: { type: String, default: '' },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    output: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    requiresApproval: { type: Boolean, default: false },
  },
  { _id: true },
)

const handoffSchema = new mongoose.Schema(
  {
    fromAgent: { type: String, required: true },
    toAgent: { type: String, required: true },
    objective: { type: String, default: '' },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    expectedOutput: { type: String, default: '' },
    permissions: { type: [String], default: [] },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true },
)

const auditSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    agentId: { type: String, default: null },
    toolId: { type: String, default: null },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    result: { type: String, default: 'ok' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true },
)

const agentExecutionSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    organizationRole: { type: String, enum: ['student', 'institution', 'company', 'system'], default: 'student' },
    intent: { type: String, required: true, index: true },
    query: { type: String, default: '' },
    status: { type: String, enum: EXECUTION_STATUSES, default: 'DRAFT', index: true },
    simulation: { type: Boolean, default: false },
    plan: [{ order: Number, agentId: String, toolId: String, objective: String, requiresApproval: Boolean }],
    steps: [stepSchema],
    handoffs: [handoffSchema],
    auditLog: [auditSchema],
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    failureReason: { type: String, default: null },
    requiresApproval: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },
    approvedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    completedAt: { type: Date, default: null },
    depth: { type: Number, default: 0 },
    toolCallCount: { type: Number, default: 0 },
    idempotencyKey: { type: String, default: null, sparse: true, index: true },
  },
  { timestamps: true },
)

agentExecutionSchema.index({ ownerUserId: 1, status: 1, createdAt: -1 })
agentExecutionSchema.index({ organizationId: 1, organizationRole: 1, createdAt: -1 })

module.exports = mongoose.model('AgentExecution', agentExecutionSchema)
