import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {viteSingleFile} from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteSingleFile({ removeViteModuleLoader: true, deleteInlinedFiles: true })],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/_util.scss";
        `
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
