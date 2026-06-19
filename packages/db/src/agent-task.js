'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AgentTask = void 0;
const mongoose_1 = require('mongoose');
const agentTaskSchema = new mongoose_1.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: [
        'created',
        'running',
        'staged',
        'validating',
        'pending_review',
        'committed',
        'merged',
        'failed',
        'cancelled',
      ],
      default: 'created',
    },
    mode: { type: String, enum: ['interactive', 'headless'], default: 'interactive' },
    prompt: { type: String },
    files: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    git: { type: mongoose_1.Schema.Types.Mixed },
    validation: { type: mongoose_1.Schema.Types.Mixed },
    metadata: {
      model: String,
      toolCallCount: Number,
      iterationCount: Number,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      completedAt: Date,
    },
  },
  { timestamps: false },
);
agentTaskSchema.index({ tenantId: 1, 'metadata.updatedAt': -1 });
exports.AgentTask = (0, mongoose_1.model)('AgentTask', agentTaskSchema);
