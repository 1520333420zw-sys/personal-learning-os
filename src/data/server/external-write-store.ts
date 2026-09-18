import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ExternalWrite, ExternalWriteReceipt } from "@/domain/external-writes/command";

interface Statement {
  bind(...values: (string | number)[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
interface Database { prepare(query: string): Statement; }
interface Environment {
  EXTERNAL_INBOX_DB?: Database;
  EXTERNAL_WRITE_TOKEN?: string;
  EXTERNAL_SYNC_TOKEN?: string;
}
interface Row {
  seq: number; id: string; idempotency_key: string; content_hash: string; owner_id: string;
  status: ExternalWriteReceipt["status"]; command_json: string; created_at: string;
}

export async function externalWriteEnvironment(): Promise<Environment> {
  try { return (await getCloudflareContext({ async: true })).env as Environment; }
  catch { return {} as Environment; }
}

export function configured(env: Environment): boolean {
  return Boolean(env.EXTERNAL_INBOX_DB && env.EXTERNAL_WRITE_TOKEN && env.EXTERNAL_SYNC_TOKEN &&
    env.EXTERNAL_WRITE_TOKEN.length >= 32 && env.EXTERNAL_SYNC_TOKEN.length >= 32 &&
    env.EXTERNAL_WRITE_TOKEN !== env.EXTERNAL_SYNC_TOKEN);
}

export async function authorized(header: string | null, expected: string | undefined): Promise<boolean> {
  if (!expected || expected.length < 32 || !header?.startsWith("Bearer ")) return false;
  const received = header.slice(7);
  if (received.length !== expected.length) return false;
  const [a, b] = await Promise.all([received, expected].map((value) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
  const left = new Uint8Array(a); const right = new Uint8Array(b);
  let mismatch = 0;
  for (let index = 0; index < left.length; index++) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

function receipt(row: Row): ExternalWriteReceipt {
  return { id: row.id, status: row.status, command: JSON.parse(row.command_json) as ExternalWrite, createdAt: row.created_at };
}

export async function createExternalWrite(db: Database, ownerId: string, idempotencyKey: string, command: ExternalWrite) {
  const content = JSON.stringify(Object.fromEntries(Object.entries(command).sort(([left], [right]) => left.localeCompare(right))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const id = crypto.randomUUID(); const now = new Date().toISOString();
  await db.prepare("INSERT OR IGNORE INTO external_writes (id, idempotency_key, content_hash, owner_id, status, command_json, created_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)")
    .bind(id, idempotencyKey, hash, ownerId, content, now).run();
  const row = await db.prepare("SELECT * FROM external_writes WHERE owner_id = ? AND idempotency_key = ?")
    .bind(ownerId, idempotencyKey).first<Row>();
  if (!row) throw new Error("WRITE_NOT_FOUND_AFTER_INSERT");
  return { receipt: receipt(row), duplicate: row.id !== id, conflict: row.content_hash !== hash };
}

export async function listExternalWrites(db: Database, ownerId: string, after: number) {
  const rows = (await db.prepare("SELECT * FROM external_writes WHERE owner_id = ? AND seq > ? AND status IN ('pending', 'revoke_requested') ORDER BY seq ASC LIMIT 101")
    .bind(ownerId, after).all<Row>()).results;
  return { items: rows.slice(0, 100).map(receipt), nextCursor: rows.length > 100 ? rows[99].seq : null };
}

export async function changeExternalWriteStatus(db: Database, ownerId: string, id: string, from: string, to: string) {
  await db.prepare("UPDATE external_writes SET status = ?, updated_at = ? WHERE owner_id = ? AND id = ? AND status = ?")
    .bind(to, new Date().toISOString(), ownerId, id, from).run();
  const row = await db.prepare("SELECT * FROM external_writes WHERE owner_id = ? AND id = ?").bind(ownerId, id).first<Row>();
  return row ? receipt(row) : null;
}
