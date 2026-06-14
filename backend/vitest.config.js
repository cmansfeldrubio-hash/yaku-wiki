import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // Test files share the local.db sqlite file; running them in parallel
    // causes SQLITE_BUSY errors on concurrent writes.
    fileParallelism: false,
  },
})
