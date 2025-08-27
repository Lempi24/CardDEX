import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		host: true,
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'.ngrok-free.app',
			'e1a9-37-248-218-81.ngrok-free.app',
		],
	},
});
