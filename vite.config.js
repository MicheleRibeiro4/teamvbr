
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  // process.cwd() é o diretório raiz
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY globalmente para o código client-side
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  };
});
