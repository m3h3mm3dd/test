// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Extend the resolver to include specific file extensions
defaultConfig.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'json', 
  'cjs', 'mjs'
];

// Add additional node_modules paths in case of hoisting issues
defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Add additional asset extensions
defaultConfig.resolver.assetExts = [
  ...defaultConfig.resolver.assetExts,
  'ttf', 'otf', 'woff', 'woff2'
];

// Allow watchman to work with symlinks
defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = defaultConfig;