import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$components: path.resolve('src/components')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
