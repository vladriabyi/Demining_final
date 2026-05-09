import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",   // потрібно для Docker
    proxy: {
      // У Docker-мережі бекенд доступний за іменем сервісу "backend",
      // а не "localhost". Vite проксіює /api та /uploads до бекенду.
      "/api":     { target: "http://backend:8000", changeOrigin: true },
      "/uploads": { target: "http://backend:8000", changeOrigin: true },
    },
  },
})
