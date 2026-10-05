// @ts-check
//
// Flat config, modelled on bike24/collect-and-ride's frontend config:
// recommended bases first, the prettier compatibility layer last so formatting
// stays Prettier's job and ESLint never argues with it.
//
// This replaces an .eslintrc.cjs that eslint 10 could not read at all -- that
// format was removed in v9/v10, so `npm run lint` had been failing outright.
//
// Requires TypeScript <6.1: typescript-eslint 8.67, its newest release, peers
// `typescript >=4.8.4 <6.1.0`. See the typescript pin in package.json.
import eslint from '@eslint/js'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default defineConfigWithVueTs(
  {
    ignores: [
      'dist/**',
      'public/**',
      // Generated from the backend's OpenAPI spec; not ours to lint.
      'src/services/backend/generated/**',
    ],
  },
  eslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    languageOptions: { globals: globals.browser },
  },
  // Must stay last: switches off every rule that would fight the formatter.
  skipFormatting,
)
