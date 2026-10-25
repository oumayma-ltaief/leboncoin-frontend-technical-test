import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['.next/**', 'coverage/**', 'docs/**', 'server/**', '.claude/**', 'next-env.d.ts']),
  ...nextVitals,
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [eslint.configs.recommended, tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    files: ['src/**/*.spec.{ts,tsx}', 'src/test-*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off'
    }
  }
]);
