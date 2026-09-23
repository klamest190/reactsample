import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Vite-Konfiguration.
// - plugin-react: JSX-Transform + Fast Refresh (Hot Reload im Browser)
// - tailwindcss: Tailwind v4 laeuft als Vite-Plugin, es gibt keine tailwind.config.js mehr.
//   Konfiguriert wird direkt in src/index.css per @theme.
// - worker.format 'es': Die Typprüfung (src/lernen/typpruefung.worker.ts) ist ein ES-Modul-Worker.
// - optimizeDeps.exclude: PGlite (PostgreSQL für Teil 9, src/sql/worker.ts) findet seine
//   .wasm- und .data-Dateien über import.meta.url - das Vorbündeln im Dev-Server würde die Pfade brechen.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
})
