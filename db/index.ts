import { env } from "cloudflare:workers";
import { SCHEMA, type UserRow } from "./schema";

type AccountInput = Omit<UserRow, "created_at" | "updated_at">;

export const getDb = () => env.DB;

export async function ensureSchema() {
  const db = getDb();
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
}

export async function findUser(email: string) {
  await ensureSchema();
  return getDb().prepare("SELECT * FROM users WHERE email = ?").bind(email).first<UserRow>();
}

export async function getUsage(excludeUserId = "") {
  await ensureSchema();
  const row = await getDb().prepare("SELECT plan_id FROM users WHERE id != ?").bind(excludeUserId).all<{ plan_id: string }>();
  return row.results;
}

export async function createAccount(input: AccountInput) {
  await ensureSchema();
  const now = new Date().toISOString();
  await getDb().batch(accountStatements(input, now));
  return findUser(input.email);
}

function accountStatements(input: AccountInput, now: string) {
  const db = getDb();
  return [
    db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(input.id, input.email, input.first_name, input.last_name, input.organisation, input.plan_id, input.openstack_user_id, input.openstack_project_id, now, now),
    db.prepare("INSERT INTO quota_changes VALUES (?, ?, NULL, ?, 'applied', ?)").bind(crypto.randomUUID(), input.id, input.plan_id, now),
    db.prepare("INSERT INTO payments VALUES (?, ?, 0, 'GBP', 'poc_credit', 'POC-ACCESS', ?)").bind(crypto.randomUUID(), input.id, now),
  ];
}

export async function getAccount(email: string) {
  const user = await findUser(email);
  if (!user) return null;
  const [changes, payments] = await Promise.all([quotaHistory(user.id), paymentHistory(user.id)]);
  return { user, changes, payments };
}

const quotaHistory = (id: string) => getDb().prepare("SELECT * FROM quota_changes WHERE user_id = ? ORDER BY created_at DESC LIMIT 12").bind(id).all();
const paymentHistory = (id: string) => getDb().prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 12").bind(id).all();

export async function savePlanChange(user: UserRow, planId: string) {
  const now = new Date().toISOString();
  await getDb().batch([
    getDb().prepare("UPDATE users SET plan_id = ?, updated_at = ? WHERE id = ?").bind(planId, now, user.id),
    getDb().prepare("INSERT INTO quota_changes VALUES (?, ?, ?, ?, 'applied', ?)").bind(crypto.randomUUID(), user.id, user.plan_id, planId, now),
  ]);
  return getAccount(user.email);
}
