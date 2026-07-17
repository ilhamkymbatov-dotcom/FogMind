import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The shared packages are consumed as source rather than as installed
      // dependencies, so Vite transpiles them alongside the app. Must stay in
      // step with the paths entries in tsconfig.app.json.
      '@fogmind/backend': fileURLToPath(new URL('../backend/src', import.meta.url)),
      '@fogmind/design': fileURLToPath(new URL('../design/src', import.meta.url)),
    },
  },
})
