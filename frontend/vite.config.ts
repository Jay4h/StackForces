import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
    https: false, // Set to true when using ngrok for mobile testing
    // Allow ngrok hosts for mobile testing
    allowedHosts: [
      '1b30460bb018.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
