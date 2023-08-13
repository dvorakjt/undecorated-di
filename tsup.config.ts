import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./test/index.ts'],
  sourcemap: true,
  format: ['esm', 'cjs'],
  dts: true,
  minify: false
});
