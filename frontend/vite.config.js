// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Utilities
import { defineConfig } from 'vite'
import { federation } from '@module-federation/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    ViteFonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900',
          },
        ],
      },
    }),
    federation({
      name: 'coretools',
      filename: 'remoteEntry.js',
      exposes: {
        './auth-store': './src/stores/auth.store.js',
        './auth-callback': './src/views/login/LoginCallbackView.vue',
        './navbar': './src/layouts/dashboard/NavBar.vue',
        './user-menu': './src/components/shared/UserMenu.vue',
      },
      shared: ['vue', 'pinia', 'vue-router', 'vue3-gettext'],
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/new-admin/' : '/',
  define: { 'process.env': {}, __VUE_OPTIONS_API__: false },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target:
          process.env.DOCKER == 'yes'
            ? 'https://api:8000'
            : 'http://127.0.0.1:8000',
        secure: false,
      },
    },
    https: true,
  },
  build: {
    emptyOutDir: true,
    outDir: '../modoboa/frontend_dist',
  },
})
