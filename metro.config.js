// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// ✅ Add alias for @ and handle .ts/.tsx
config.resolver.alias = {
  ...config.resolver.alias,
  "@": path.resolve(__dirname),
};

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
];

module.exports = config;
