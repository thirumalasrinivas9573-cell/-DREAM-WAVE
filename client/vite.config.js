import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-axios':  ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },

  server: {
    port: 5173,
    // Bind IPv4 so http://127.0.0.1:5173 works (macOS often prefers ::1 only)
    host: '127.0.0.1',
    // Proxy /api → backend in development
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
        rewrite: path => path, // keep /api prefix
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map((c) =>
                c.replace(/;\s*Secure/gi, '').replace(/;\s*Domain=[^;]+/gi, '')
              )
            }
          })
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 'framer-motion', 'axios',
    ],
  },
})
