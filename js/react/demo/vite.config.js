import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The library is linked via "file:..", so its dist/ imports of the peer
  // dependencies would otherwise resolve to js/react/node_modules, bundling a
  // second copy of React and breaking hooks ("g.H is null" on useState).
  resolve: {
    dedupe: ['react', 'react-dom', 'plotly.js', 'react-plotly.js'],
  },
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
