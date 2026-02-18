import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'build', emptyOutDir: true },
  optimizeDeps: {
    include: ['neural-activity-visualizer-react'],
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  esbuild: {
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    loader: 'jsx',
  },
})
