import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  define: {
    ENVIRONMENT: '"test"',
  },
  test: {
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.json',
        },
      },
    },
  },
})
