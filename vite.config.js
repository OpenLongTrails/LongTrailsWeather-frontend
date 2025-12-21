import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [
    preact(),
    {
      name: 'dev-server-reminder',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          setTimeout(() => {
            console.log('\nAccess the forecast app at http://localhost:8080/forecast.html\n')
          }, 100)
        })
      }
    }
  ],
  server: {
    port: 8080,
    fs: {
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      input: './forecast.html'
    }
  }
})
