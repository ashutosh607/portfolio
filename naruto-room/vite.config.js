import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/three/') || id.includes('\\three\\')) return 'vendor-three';
          if (
            id.includes('@react-three/') ||
            id.includes('three-stdlib')
          ) {
            return 'vendor-r3f';
          }
          if (id.includes('gsap') || id.includes('lucide-react')) {
            return 'vendor-motion';
          }
          if (
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('/react-dom/') ||
            id.includes('\\react-dom\\') ||
            id.includes('react-router')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
