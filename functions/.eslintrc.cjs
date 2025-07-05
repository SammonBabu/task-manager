/* eslint-env node */
'use strict';

// @ts-check

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: [
    '/lib/**/*',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-unresolved': 'off',
    'object-curly-spacing': ['error', 'always'],
    'max-len': ['error', { code: 120 }],
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'quote-props': ['error', 'as-needed'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-import': 'off',
    'node/no-unpublished-import': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
