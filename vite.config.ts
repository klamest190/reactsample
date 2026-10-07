import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// Vite-Konfiguration.
// - plugin-react: JSX-Transform + Fast Refresh (Hot Reload im Browser)
// - tailwindcss: Tailwind v4 laeuft als Vite-Plugin, es gibt keine tailwind.config.js mehr.
//   Konfiguriert wird direkt in src/index.css per @theme.
// - worker.format 'es': Die Typprüfung (src/learning/typeCheck.worker.ts) ist ein ES-Modul-Worker.
// - optimizeDeps.exclude: PGlite (PostgreSQL für Teil 9, src/sql/worker.ts) findet seine
//   .wasm- und .data-Dateien über import.meta.url - das Vorbündeln im Dev-Server würde die Pfade brechen.
// - test: Vitest in three projects
//     unit     pure logic in Node            src/**/*.test.ts
//     dom      hooks and components (jsdom)  src/**/*.test.tsx
//     content  every course example on the runtimes of parts 7-9 (Java, Spring, Docker, PostgreSQL)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'], exclude: ['src/**/*.content.test.ts'] },
      },
      {
        extends: true,
        test: { name: 'dom', environment: 'jsdom', include: ['src/**/*.test.tsx'], setupFiles: ['src/test/setup.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'content',
          environment: 'node',
          include: ['src/**/*.content.test.ts'],
          // PGlite (WASM) is more reliable in child processes than in worker threads.
          pool: 'forks',
          testTimeout: 60_000,
          hookTimeout: 60_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/course/**', 'src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/**/*.worker.ts', 'src/selftest/main.ts', 'src/test/**'],
      reporter: ['text-summary', 'html', 'json-summary', 'lcov'],
      // A few points below the measured values - coverage may only go up.
      thresholds: { statements: 50, branches: 44, functions: 40, lines: 52 },
    },
  },
})
