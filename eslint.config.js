import globals from 'globals'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  {
    ignores: [
      'src/legacy/container',
      'node_modules',
      'public',
      'dist',
      'build',
      'coverage',
      '*.config.js',
      '*.config.ts',
      '**/stories/*',
      'vitest.workspace.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json'],
        tsconfigRootDir: new URL('.', import.meta.url),
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      react,
      prettier,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // React
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Console
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Import
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: 'react*', group: 'builtin', position: 'before' },
            { pattern: '@/atoms/*', group: 'internal', position: 'before' },
            { pattern: '@/molecules/*', group: 'internal', position: 'before' },
            { pattern: '@/organisms/*', group: 'internal', position: 'before' },
            { pattern: '@/*', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: [],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Prettier
      'prettier/prettier': 'warn',

      // React Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['*.js', '*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
)
