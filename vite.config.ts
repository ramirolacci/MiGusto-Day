import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/disculpas/',
  plugins: [
    react(),
    {
      name: 'strict-base-redirect',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/disculpas' || req.originalUrl === '/disculpas') {
            res.statusCode = 301;
            res.setHeader('Location', '/disculpas/');
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
});
