import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: [
      '.DS_Store',
      '**/.DS_Store',
      '.env*',
      '.prettierignore',
      'package-lock.json',
      'package.json',
      'server.log',
      'dist/',
      'build/',
      'node_modules/',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  // General JSON file configuration (excluding package-lock.json)
  {
    files: ['**/*.json', '!**/package-lock.json'],
    plugins: { json },
    languageOptions: { parser: json.parser },
    rules: { ...json.configs.recommended.rules },
  },
  // Specific override for package-lock.json
  {
    files: ['**/package-lock.json'],
    plugins: { json },
    languageOptions: { parser: json.parser },
    rules: {
      ...json.configs.recommended.rules,
      'json/no-empty-keys': 'off',
      'max-len': 'off',
    },
  },
  // Configuration for Jest test files
  {
    files: ['tests/**/*.test.js'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  eslintPluginPrettierRecommended,
];
