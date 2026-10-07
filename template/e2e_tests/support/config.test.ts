import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { test } from "node:test";

function databaseUrl(overrides: Record<string, string>) {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  delete env.E2E_DATABASE_URL;
  delete env.E2E_POSTGRES_PORT;
  delete env.E2E_DB_PORT;
  delete env.E2E_DB_NAME;
  return execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import { databaseUrl } from ${JSON.stringify(new URL("./config.ts", import.meta.url).href)}; process.stdout.write(databaseUrl);`,
    ],
    { env: { ...env, ...overrides }, encoding: "utf-8" },
  );
}

test("an inherited development URL never selects the E2E database", () => {
  assert.equal(
    databaseUrl({
      DATABASE_URL: "postgres://development@localhost:5432/valuable_data",
      E2E_DB_NAME: "isolated_e2e",
      E2E_POSTGRES_PORT: "55433",
    }),
    "postgres://admin:admin@127.0.0.1:55433/isolated_e2e",
  );
});

test("an explicit E2E URL selects the supplied disposable database", () => {
  const disposable = "postgres://test@localhost:5434/throwaway_e2e";
  assert.equal(
    databaseUrl({
      DATABASE_URL: "postgres://development@localhost:5432/valuable_data",
      E2E_DATABASE_URL: disposable,
    }),
    disposable,
  );
});
