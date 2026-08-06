// apps/app/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    env: {
      DATABASE_URL: "postgresql://mock:mock@localhost:5432/testdb",
    },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: ["next", "next-auth"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.ts", "actions/**/*.ts", "components/**/*.tsx"],
      // 2. Explicitly exclude glue files, UI components, pages, and config files
      exclude: [
        "components/**",
        "components/ui/**",
        "app/**/page.tsx",
        "app/**/layout.tsx",
        "**/*.d.ts",
        "**/*.test.ts",
        "node_modules/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "next/server": "next/server.js", // 🟢 Direct alias fix for Vitest ESM resolution
    },
  },
});
