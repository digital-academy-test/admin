import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'   // ← add this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // ← add this
  ],
})