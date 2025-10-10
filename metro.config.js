const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add alias configuration
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@components': path.resolve(__dirname, './components'),
  '@screens': path.resolve(__dirname, './screens'),
  '@utils': path.resolve(__dirname, './utils'),
  '@assets': path.resolve(__dirname, './assets'),
  '@services': path.resolve(__dirname, './services'),
  '@hooks': path.resolve(__dirname, './hooks'),
  '@constants': path.resolve(__dirname, './constants'),
  '@navigation': path.resolve(__dirname, './navigation'),
};

module.exports = config;
