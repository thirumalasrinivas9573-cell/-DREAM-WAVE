const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    title: { type: String, required: true },
    career: { type: String, required: true },
    description: { type: String, default: '' },
    kind: {
      type: String,
      enum: ['career', 'skill', 'semester', 'placement', 'certification'],
      default: 'career',
      index: true,
    },
    semesterLabel: { type: String, default: '', maxlength: 40 },
    placementFocus: { type: String, default: '', maxlength: 160 },
    skills: [
      {
        name: String,
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        progress: { type: Number, min: 0, max: 100, default: 0 },
      },
    ],
    timeline: [
      {
        phase: Number,
        title: String,
        duration: String,
        topics: [String],
        completed: { type: Boolean, default: false },
      },
    ],
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    adaptive: {
      lastAdaptedAt: { type: Date, default: null },
      dependencies: [
        {
          skill: String,
          dependsOn: String,
          reason: String,
        },
      ],
      milestones: [
        {
          key: String,
          title: String,
          dueHint: String,
          completed: { type: Boolean, default: false },
          topics: [String],
          weight: { type: Number, default: 0 },
        },
      ],
    },
  },
  { timestamps: true }
);

roadmapSchema.index({ user: 1, createdAt: -1 });
roadmapSchema.index({ organizationId: 1, user: 1 });
roadmapSchema.index({ user: 1, kind: 1, status: 1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
