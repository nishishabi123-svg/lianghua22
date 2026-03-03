import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 1. 引入 path 模块

export default defineConfig({
  plugins: [react()],
  // 2. 新增 resolve 配置，让 @ 指向 src 目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          charts: ['echarts', 'echarts-for-react'],
          router: ['react-router-dom']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  base: '/',
  define: {
    __VUE_PROD_DEVTOOLS__: false
  }
})