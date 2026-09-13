export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    organisation TEXT NOT NULL DEFAULT '',
    plan_id TEXT NOT NULL,
    openstack_user_id TEXT NOT NULL,
    openstack_project_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS quota_changes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_plan_id TEXT,
    to_plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_pence INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'GBP',
    status TEXT NOT NULL,
    reference TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  "CREATE INDEX IF NOT EXISTS quota_changes_user_idx ON quota_changes(user_id, created_at)",
  "CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id, created_at)",
] as const;

export type UserRow = {
  id: string; email: string; first_name: string; last_name: string;
  organisation: string; plan_id: string; openstack_user_id: string;
  openstack_project_id: string; created_at: string; updated_at: string;
};
