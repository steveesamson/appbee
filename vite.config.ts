import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		// testTimeout: 10000,
		coverage: {
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/**/*.ts'],
		},
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
});
