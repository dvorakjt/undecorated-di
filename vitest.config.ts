import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      100: true,
      include: ["src/**"],
      exclude: [
        "src/index.ts",
        "src/__test__/**",
        "**/*.config.ts",
        "**/*.interface.ts",
        "**/*.type.ts",
      ],
      reporter: [
        [ 'json', { file: 'coverage-summary.json'}]
      ]
    },
  },
});
