/**
 * Exit 0 when MongoDB accepts connections (used by Docker entrypoints).
 * Usage: node scripts/docker/wait-for-mongo.js
 */
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 3000 })
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
