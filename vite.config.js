import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/playbook/',
  server: {
    host: true, // permite acesso por localhost e pela rede
    port: 5173, // porta padrão, pode ajustar
  },
})
