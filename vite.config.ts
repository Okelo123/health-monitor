import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables from .env files
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.VITE_BASE_URL || '/',   // ✅ no "Process.env"
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  }
})
