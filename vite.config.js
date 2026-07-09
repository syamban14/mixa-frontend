import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import net from 'net'

// Fungsi untuk mengecek apakah port lokal terbuka (Radar)
function isPortOpen(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(500)
    
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    
    socket.on('error', () => {
      resolve(false)
    })
    
    socket.connect(port, host)
  })
}

export default defineConfig(async () => {
  // Tembakkan radar ke localhost:8000
  const isLocalUp = await isPortOpen(8000)
  const apiTarget = isLocalUp ? 'http://localhost:8000' : 'http://103.93.160.96'
  
  console.log(`\n🚀 [Auto-Fallback] Backend Target disetel ke: ${apiTarget}\n`)

  return {
    plugins: [tailwindcss(), svelte()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        }
      }
    }
  }
})
