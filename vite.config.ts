import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/migusto-day/',
  plugins: [
    react(),
    {
      name: 'strict-base-redirect',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/migusto-day' || req.originalUrl === '/migusto-day') {
            res.statusCode = 301;
            res.setHeader('Location', '/migusto-day/');
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
});
