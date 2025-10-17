import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		plugins: [
			TanStackRouterVite({ autoCodeSplitting: true }),
			viteReact(),
			tailwindcss(),
		],
		test: {
			globals: true,
			environment: 'jsdom',
		},
		resolve: {
			alias: {
				'@': resolve(__dirname, './src'),
			},
		},
		server: {
			host: '0.0.0.0',
			port: 8080,
			strictPort: true,
			// When running via the Vite server (e.g. `dev` mode), proxy API requests to the Go backend
			proxy: {
				'/api':
					mode == 'development'
						? 'http://api:3000'
						: 'http://localhost:0',
			},
		},
	};
});
