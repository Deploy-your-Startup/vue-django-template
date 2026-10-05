import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { databaseUrl } from "./config";

export function seed(plan: {
  flush?: boolean;
  create: {
    factory: "Entry";
    kwargs?: Record<string, unknown>;
    count?: number;
  }[];
}) {
  if (process.env.E2E_BASE_URL)
    throw new Error("Never seed or flush an external deployment.");
  const output = execFileSync(
    "uv",
    ["run", "python", "manage.py", "e2e_seed"],
    {
      cwd: fileURLToPath(new URL("../../backend", import.meta.url)),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      input: JSON.stringify(plan),
      encoding: "utf-8",
      timeout: 300_000,
    },
  );
  return JSON.parse(output.trim().split("\n").at(-1) || "{}");
}
