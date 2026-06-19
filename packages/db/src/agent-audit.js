'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AgentAuditEntry = void 0;
const mongoose_1 = require('mongoose');
const agentAuditSchema = new mongoose_1.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'created',
        'run_started',
        'staged',
        'validated',
        'approved',
        'committed',
        'merged',
        'discarded',
        'failed',
        'enqueued',
      ],
      required: true,
    },
    details: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);
agentAuditSchema.index({ sessionId: 1, timestamp: -1 });
exports.AgentAuditEntry = (0, mongoose_1.model)('AgentAuditEntry', agentAuditSchema);
