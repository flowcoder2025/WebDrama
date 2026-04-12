import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/editor/compositions/**"],
    },
  },
  resolve: {
    alias: {
      "@common": "./src/common",
      "@research": "./src/research",
      "@story": "./src/story",
      "@asset": "./src/asset",
      "@editor": "./src/editor",
    },
  },
});
