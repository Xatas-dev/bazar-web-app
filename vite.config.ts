import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'
  const localMockTarget = 'http://localhost:8080' // json-server для локальной разработки

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false, // For self-signed certs if needed, though localhost usually http
        },
        '/bazar-space': {
          target: mode === 'development' ? localMockTarget : target,
          changeOrigin: true,
          secure: false,
        },
        '/bazar-persona': {
          target: mode === 'development' ? localMockTarget : target,
          changeOrigin: true,
          secure: false,
        },
        '/bazar-chat': {
          target: mode === 'development' ? localMockTarget : target,
          changeOrigin: true,
          secure: false,
        },
        '/bazar-storage': {
          target: mode === 'development' ? localMockTarget : target,
          changeOrigin: true,
          secure: false,
        },
        '/bazar-authorization': {
          target: mode === 'development' ? localMockTarget : target,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
            target: target,
            ws: true,
            changeOrigin: true,
            secure: false
        },
        '/logout': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/oauth': {
          target: target,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
