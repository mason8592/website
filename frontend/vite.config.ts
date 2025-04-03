import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const outDir = path.resolve(__dirname, "../dist/frontend")

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    outDir: outDir
  },
  resolve: {
    alias: {
      "@hooks": path.resolve(__dirname, "src/hooks"),
    }
  }
})