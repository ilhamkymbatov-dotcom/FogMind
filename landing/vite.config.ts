import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The shared design package is consumed as source rather than as an
      // installed dependency. Must stay in step with the paths entry in
      // tsconfig.app.json.
      '@fogmind/design': fileURLToPath(new URL('../design/src', import.meta.url)),
    },
  },
})
