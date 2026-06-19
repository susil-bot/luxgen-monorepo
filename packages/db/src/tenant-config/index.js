'use strict';
/**
 * Centralized Tenant Configuration Export
 *
 * This file exports all tenant configurations from the backend.
 * Each tenant has its own secure configuration folder.
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.mergeTenantConfig = exports.defaultTenantConfig = exports.acmeCorp = exports.ideaVibes = exports.demo = void 0;
var demo_1 = require('./demo');
Object.defineProperty(exports, 'demo', {
  enumerable: true,
  get: function () {
    return __importDefault(demo_1).default;
  },
});
var idea_vibes_1 = require('./idea-vibes');
Object.defineProperty(exports, 'ideaVibes', {
  enumerable: true,
  get: function () {
    return __importDefault(idea_vibes_1).default;
  },
});
var acme_corp_1 = require('./acme-corp');
Object.defineProperty(exports, 'acmeCorp', {
  enumerable: true,
  get: function () {
    return __importDefault(acme_corp_1).default;
  },
});
var default_1 = require('./default');
Object.defineProperty(exports, 'defaultTenantConfig', {
  enumerable: true,
  get: function () {
    return default_1.defaultTenantConfig;
  },
});
Object.defineProperty(exports, 'mergeTenantConfig', {
  enumerable: true,
  get: function () {
    return default_1.mergeTenantConfig;
  },
});
