import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@application': path.resolve(__dirname, './src/application'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
});
