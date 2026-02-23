import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    lib: {
      name: 'act-master',
      entry: ['src/index.ts', 'src/vue/index.ts', 'src/test-utils/index.ts'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
    },
  },
});
