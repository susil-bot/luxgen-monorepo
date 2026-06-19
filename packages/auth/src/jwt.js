'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jsonwebtoken_1.default.verify(token, secret);
  } catch (_error) {
    return null;
  }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
  try {
    return jsonwebtoken_1.default.decode(token);
  } catch (_error) {
    return null;
  }
};
exports.decodeToken = decodeToken;
