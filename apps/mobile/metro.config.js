const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  '@luxgen/design-tokens': path.resolve(workspaceRoot, 'packages/design-tokens/src'),
  '@luxgen/types': path.resolve(workspaceRoot, 'packages/types/src'),
  '@luxgen/native-ui': path.resolve(workspaceRoot, 'packages/native-ui/src'),
};

module.exports = config;
