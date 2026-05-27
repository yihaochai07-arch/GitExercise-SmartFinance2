import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/brankas-api': {
        target: 'https://direct.sandbox.bnk.to',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/brankas-api/, ''),
      },
    },
  },
});
