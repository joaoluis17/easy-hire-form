import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { localFormApiPlugin } from './server/localFormApi'

export default defineConfig({
  plugins: [vue(), localFormApiPlugin()],
})
