const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-maps derruba o Expo Go mesmo sem uso direto — excluir do bundle.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /node_modules[/\\]react-native-maps[/\\].*/,
];

module.exports = config;
