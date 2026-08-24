import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Flat config has no "extends" key -- shared configs are spread into the array
// directly. The generated config shipped with an "extends" entry, which made
// `npm run lint` fail outright rather than report any findings.
export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // JSX-only components read as "unused" to the base rule.
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      // All logging goes through src/lib/logger so verbosity is centrally
      // controlled; logger.js itself is exempt below.
      'no-console': 'error',
      // React Compiler-era rules surfaced by the react-hooks v7 upgrade.
      // They correctly flag legacy patterns (fetch-on-mount effects, card
      // components defined inside pages) but fixing them is a dedicated
      // refactor; kept visible as warnings until that lands.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    files: ['src/lib/logger.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
