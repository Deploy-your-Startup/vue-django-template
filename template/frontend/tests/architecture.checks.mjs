import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function checkFixture(change = () => {}) {
  const directory = mkdtempSync(join(tmpdir(), 'startup-architecture-'))
  try {
    for (const name of ['src', 'tsconfig.app.json', 'package.json', '.dependency-cruiser.cjs']) {
      cpSync(join(frontend, name), join(directory, name), { recursive: true })
    }
    symlinkSync(join(frontend, 'node_modules'), join(directory, 'node_modules'), 'dir')
    change(directory)
    const result = spawnSync(
      join(frontend, 'node_modules/.bin/depcruise'),
      ['--config', '.dependency-cruiser.cjs', 'src', '--output-type', 'err-long'],
      { cwd: directory, encoding: 'utf8', timeout: 30000 },
    )
    assert.equal(result.error, undefined)
    return result
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('GIVEN the shipped Vue application WHEN cruising THEN real modules and aliases pass', () => {
  const result = checkFixture()
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /no dependency violations/)
  assert.match(result.stdout, /\([1-9]\d* modules, [1-9]\d* dependencies cruised\)/)
})

for (const [dependency, rule] of [
  ["import '@/composables/not-present'", 'no-unresolved-imports'],
  ["import '@/views/HomeView.vue'", 'no-cycles'],
  ["import '@/composables/probe.test'", 'production-does-not-import-tests'],
]) {
  test(`GIVEN ${rule} is violated WHEN cruising THEN lint rejects it`, () => {
    const result = checkFixture((directory) => {
      // Mutate the real SFC: this also verifies Vue parsing and the @ alias.
      const path = join(directory, 'src/views/HomeView.vue')
      writeFileSync(
        path,
        readFileSync(path, 'utf8').replace('<script setup lang="ts">', `<script setup lang="ts">\n${dependency}`),
      )
      writeFileSync(join(directory, 'src/composables/probe.test.ts'), 'export const probe = true\n')
    })
    assert.notEqual(result.status, 0)
    assert.match(result.stdout + result.stderr, new RegExp(rule))
    assert.match(result.stdout + result.stderr, /src\/views\/HomeView.vue/)
  })
}
