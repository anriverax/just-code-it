// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginUnusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
	...nextVitals,
	...nextTs,

	// Reglas generales (JS + TS)
	{
		files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
		plugins: {
			'unused-imports': pluginUnusedImports,
		},
		rules: {
			'no-console': 'warn',
			'unused-imports/no-unused-imports': 'error',
			'react/jsx-sort-props': [
				'error',
				{ callbacksLast: true, shorthandFirst: true, noSortAlphabetically: true },
			],
			'react-hooks/exhaustive-deps': 'warn',
		},
	},

	// Reglas exclusivas de TypeScript
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/explicit-module-boundary-types': 'warn',
		},
	},

	globalIgnores(['.next/**', 'out/**', 'build/**', 'dist/**', 'next-env.d.ts']),
]);
