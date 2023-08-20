import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  sourcemap: true,
  format: ["esm", "cjs"],
  dts: true,
  minify: false,
});
