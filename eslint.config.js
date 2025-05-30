import js from '@eslint/js';
import react from 'eslint-plugin-react';

export default [
  js.config({
    files: ['**/*.{js,jsx}'],
    ignores: ['dist/', 'node_modules/'],
  }),
  {
    plugins: { react },
    rules: {
      ...react.configs.recommended.rules,
    },
  },
]; 