import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  dts: true,
  tsconfig: true,
  platform: 'node',
  format: ['commonjs', 'esm'],
  clean: true,
});
