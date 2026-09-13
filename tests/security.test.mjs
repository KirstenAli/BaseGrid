import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("database schema does not persist passwords or API tokens", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  assert.doesNotMatch(schema, /password|api_token|credential/i);
});

test("registration sends the password only to the provisioning adapter", async () => {
  const route = await readFile(new URL("../app/api/register/route.ts", import.meta.url), "utf8");
  assert.match(route, /provisionUser\(\{[^}]*password:/s);
  assert.doesNotMatch(route, /createAccount\(\{[^}]*password:/s);
});
