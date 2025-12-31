// examples/internal/example.ts
import * as dotenv from "dotenv";

export function loadEnv() {
  dotenv.config({ path: ".env" });
}

export function env(name: string): string {
  return (process.env[name] || "").trim();
}

export function skipIfMissing(...required: string[]): boolean {
  const missing = required.filter((k) => !env(k));
  if (missing.length === 0) return false;

  console.log("Skipping example: missing env:", missing.join(", "));
  console.log("Tip: copy .env.example to .env and fill values, then re-run.");
  return true;
}

export function printJSON(v: unknown) {
  console.log(JSON.stringify(v, null, 2));
}

export function truncate(s: string, n: number) {
  if (n <= 0) return "";
  return s.length <= n ? s : s.slice(0, n) + "...";
}