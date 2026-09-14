import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Forward /api to the Express mock server (server/index.ts).
const proxy = { '/api': `http://127.0.0.1:${process.env.OWI_API_PORT ?? 8787}` };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
});
