import eslint from '@eslint/js'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'public/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  skipFormatting,
)
