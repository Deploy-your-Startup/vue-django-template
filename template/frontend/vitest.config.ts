import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // User-visible behaviour is covered by E2E tests against the real backend
      // (docs/architecture/0001); Vitest stays ready for frontend tests that
      // need no browser and no stubbed network.
      passWithNoTests: true,
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url))
    }
  })
)
