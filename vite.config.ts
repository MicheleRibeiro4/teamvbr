
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Permite o uso de process.env.API_KEY no código front-end
    'process.env': process.env
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  }
});
