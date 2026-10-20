import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    // Keep the VUE_APP_ prefix so existing .env files and docker-compose overrides keep working.
    envPrefix: ['VITE_', 'VUE_APP_'],
    plugins: [
      vue(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        manifest: {
          name: 'Serverless Invoices',
          short_name: 'Invoices',
          theme_color: '#edeff1',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'img/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'img/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'img/icons/android-chrome-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable',
            },
            {
              src: 'img/icons/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          globIgnores: ['**/.htaccess*'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Bootstrap 5.3 still uses @import and global Sass functions.
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8080,
      allowedHosts: true,
      watch: {
        usePolling: env.CHOKIDAR_USEPOLLING === 'true',
      },
      // By default the HMR client connects to the page's own host and port, which works
      // through a reverse proxy. Override only if the proxy exposes HMR elsewhere.
      ws: env.DEV_SERVER_HMR_HOST ? {
        host: env.DEV_SERVER_HMR_HOST,
        clientPort: Number(env.DEV_SERVER_HMR_PORT) || undefined,
      } : undefined,
    },
  };
});
