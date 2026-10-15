// Flat config bawaan Expo (eslint-config-expo >= 9).
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['**/node_modules/**', '**/.expo/**', '**/dist/**', '**/android/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
