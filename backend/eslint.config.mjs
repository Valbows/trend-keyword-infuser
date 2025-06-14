import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  // General JSON file configuration (excluding package-lock.json)
  {
    files: ['**/*.json', '!**/package-lock.json'], // Apply to all .json files except package-lock.json
    plugins: {
      json: json, // The imported 'json' plugin from '@eslint/json'
    },
    languageOptions: {
      parser: json.parser, // The parser from the 'json' plugin
    },
    rules: {
      ...json.configs.recommended.rules, // Apply recommended JSON rules
      // Add or override general JSON rules here if needed
    },
  },
  // Specific override for package-lock.json
  {
    files: ['**/package-lock.json'], // Target only package-lock.json files
    plugins: {
      json: json, // The imported 'json' plugin
    },
    languageOptions: {
      parser: json.parser, // The parser from the 'json' plugin
    },
    rules: {
      ...json.configs.recommended.rules, // Start with recommended rules
      'json/no-empty-keys': 'off',      // Specifically disable the rule for empty keys
      'max-len': 'off',                 // Disable max-len for package-lock.json
    },
  },
  // Configuration for Jest test files
  {
    files: ['tests/**/*.test.js'], // Apply to all .test.js files within the tests directory
    languageOptions: {
      globals: {
        ...globals.jest, // Enable Jest global variables
      },
    },
  },
  eslintPluginPrettierRecommended,
]);
