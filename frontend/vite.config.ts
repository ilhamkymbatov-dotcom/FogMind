import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The backend package is consumed as TypeScript source rather than as an
      // installed dependency, so Vite transpiles it alongside the app. Must stay
      // in step with the paths entry in tsconfig.app.json.
      '@fogmind/backend': fileURLToPath(new URL('../backend/src', import.meta.url)),
    },
  },
})
