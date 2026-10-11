// Oxlint (.oxlintrc.json) lints all JavaScript and TypeScript. ESLint runs only
// for the Vue template rules Oxlint does not cover yet; eslint-plugin-oxlint
// switches off every rule Oxlint already checks.
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import oxlint from 'eslint-plugin-oxlint'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist/**', 'public/**', 'src/services/backend/generated/**'] },
  ...pluginVue.configs['flat/essential'],
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  ...oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  skipFormatting,
]
