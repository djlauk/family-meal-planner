import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })],
	server: {
		port: Number(process.env.PORT) || 5173
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node',
		// Vitest skips CSS by default; the contrast test reads app.css as text.
		css: { include: [/app\.css/] }
	}
});
