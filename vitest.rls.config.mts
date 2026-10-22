import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["supabase/tests/rls.test.ts"],
    exclude: [],
  },
});
