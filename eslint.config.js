// eslint.config.js
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  pluginJs.configs.recommended, // Basic recommended JavaScript rules
  ...tseslint.configs.recommended, // Recommended TypeScript rules
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Browser environment globals
        ...globals.node, // Node.js environment globals
      },
      parserOptions: {
        project: ['./tsconfig.json'], // Path to your tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Root directory for tsconfig
      },
    },
    rules: {
      // Custom rules or overrides
      semi: ['off'], // Enforce semicolons
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ], // Warn on unused variables, allow _ prefixed
      '@typescript-eslint/explicit-function-return-type': 'off', // Disable explicit return type requirement
      // Add more custom rules as needed
    },
    // Specify files to apply this configuration to
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist/', 'node_modules/', '*.config.*'], // Files/folders to ignore
  }
)
