import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'https://localhost:7091',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
