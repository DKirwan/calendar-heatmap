const js = require('@eslint/js');
const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  js.configs.recommended,
  {
    files: ['packages/**/src/**/*.{ts,js,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      camelcase: 'error',
      curly: 'error',
      eqeqeq: 'error',
      'no-bitwise': 'error',
      'no-empty': 'error',
      'no-new': 'error',
      'no-redeclare': 'off',
      'no-trailing-spaces': 'error',
      'no-unused-vars': 'off',
      'no-plusplus': 'off',
      quotes: ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/no-redeclare': 'error'
    }
  }
];
