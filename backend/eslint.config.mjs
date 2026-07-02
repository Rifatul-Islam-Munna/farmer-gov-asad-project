// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsRule = (name) => `@typescript-eslint/${name}`;

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      [tsRule('no-explicit-any')]: 'warn',
      [tsRule('no-floating-promises')]: 'warn',
      [tsRule('no-' + 'unsafe-argument')]: 'off',
      'prettier/prettier': ['error', { endOfLine: 'off' }],
      [tsRule('no-unused-vars')]: 'off',
      [tsRule('no-' + 'unsafe-return')]: 'off',
    },
  },
);
