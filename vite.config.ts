/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/domain/**/*.{ts,tsx}',
        'src/presentation/hooks/**/*.{ts,tsx}',
        'src/infrastructure/utils/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.d.ts', '**/index.ts', '**/types.ts'],
      // Ratchet: línea base medida 2026-11-21 (6.6/69.4/45.6). Solo subir.
      thresholds: { lines: 6, statements: 6, branches: 65, functions: 45 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@application': path.resolve(__dirname, './src/application'),
      '@icons': path.resolve(__dirname, './src/icons'),
      '@errors': path.resolve(__dirname, './src/lib/errors'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // maplibre-gl es pesado (~800KB) y solo lo usan las páginas de
          // detalle/formularios (ya lazy-loaded); pinearlo evita que Rollup
          // duplique su código entre esos chunks.
          'maplibre': ['maplibre-gl'],
          // react/react-router/framer-motion se usan eager desde App.tsx y
          // Navbar en TODAS las rutas, así que igual viajan en el primer
          // request. Los agrupamos en un vendor chunk aparte (en vez de
          // dejar que Rollup los mezcle con el código de la app) para que
          // el hash de este chunk no cambie en cada deploy: el navegador lo
          // sirve desde cache (Cache-Control immutable) en vez de volver a
          // descargarlo cada vez que se toca código propio.
          'vendor': ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          // lucide-react NO se fuerza a un chunk global: dejamos que Rollup
          // lo agrupe por límite de import dinámico, así los íconos
          // exclusivos de páginas lazy (admin, chat, asesor, etc.) no
          // inflan el bundle inicial.
        },
      },
    },
    chunkSizeWarningLimit: 400,
    sourcemap: false,
  },
});
