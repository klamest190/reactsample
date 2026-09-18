import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Vite-Konfiguration.
// - plugin-react: JSX-Transform + Fast Refresh (Hot Reload im Browser)
// - tailwindcss: Tailwind v4 laeuft als Vite-Plugin, es gibt keine tailwind.config.js mehr.
//   Konfiguriert wird direkt in src/index.css per @theme.
// - worker.format 'es': Die Typprüfung (src/lernen/typpruefung.worker.ts) ist ein ES-Modul-Worker.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
})
