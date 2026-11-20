import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    loader: 'jsx',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'NeuralActivityVisualizerReact',
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
      // Vite 6+ names lib CSS after the package by default; pin to style.css
      // to keep the published "./style.css" export path stable.
      cssFileName: 'style',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime',
        'plotly.js', 'react-plotly.js'],
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
    exclude: ['demo/**', 'node_modules/**'],
  },
})
