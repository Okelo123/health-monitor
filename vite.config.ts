import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: Process.env.VITE_BASE_URL || '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
