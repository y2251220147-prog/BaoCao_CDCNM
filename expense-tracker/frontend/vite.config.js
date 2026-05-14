import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Đọc .env từ thư mục cha nếu tồn tại (local + Docker),
// fallback về thư mục hiện tại (Vercel build environment)
const parentEnvExists = existsSync(resolve(__dirname, '../.env'));

export default defineConfig({
  plugins: [react()],
  envDir: parentEnvExists ? '../' : './',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

