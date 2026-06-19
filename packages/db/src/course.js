'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Course = exports.CourseStatus = void 0;
const mongoose_1 = require('mongoose');
var CourseStatus;
(function (CourseStatus) {
  CourseStatus['DRAFT'] = 'DRAFT';
  CourseStatus['PUBLISHED'] = 'PUBLISHED';
  CourseStatus['COMPLETED'] = 'COMPLETED';
  CourseStatus['CANCELLED'] = 'CANCELLED';
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
const courseSchema = new mongoose_1.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tenant: {
      type: mongoose_1.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
  },
  {
    timestamps: true,
  },
);
exports.Course = (0, mongoose_1.model)('Course', courseSchema);
