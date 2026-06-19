'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const default_1 = require('../default');
// Demo tenant configuration - extends default with custom overrides
const demoConfig = {
  id: 'demo',
  name: 'Demo Company',
  subdomain: 'demo',
  branding: {
    logo: {
      src: '/logos/demo-logo.svg',
      alt: 'Demo Company Logo',
      text: 'Demo Company',
      href: '/',
    },
    favicon: '/favicons/demo-favicon.ico',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
    },
  },
  settings: {
    allowRegistration: true,
    requireEmailVerification: false,
    maxUsers: 100,
  },
};
// Merge with default configuration
const demo = (0, default_1.mergeTenantConfig)(demoConfig);
exports.default = demo;
