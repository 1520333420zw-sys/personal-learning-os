import { getCloudflareContext } from "@opennextjs/cloudflare";

interface Statement { bind(...values: (string | number | null)[]): Statement; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; run(): Promise<unknown>; }
export interface CloudAccountDatabase { prepare(query: string): Statement; }
interface Environment { EXTERNAL_INBOX_DB?: CloudAccountDatabase; }
export const CLOUD_SESSION_COOKIE = "plos_cloud_account";
const lifetimeSeconds = 60 * 60 * 24 * 30;

export async function cloudAccountDatabase() {
  try { return ((await getCloudflareContext({ async: true })).env as Environment).EXTERNAL_INBOX_DB; } catch { return undefined; }
}
const hex = (bytes: Uint8Array) => [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
async function hash(value: string) { return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))); }
export function validRecoveryKey(value: unknown): value is string { return typeof value === "string" && /^plos-[A-Za-z0-9_-]{43}$/.test(value); }
export function sameOrigin(request: Request) { const origin=request.headers.get("origin"); return Boolean(origin && origin === new URL(request.url).origin); }
function cookie(request: Request, name: string) { return request.headers.get("cookie")?.split(";").map((part)=>part.trim()).find((part)=>part.startsWith(`${name}=`))?.slice(name.length+1); }
export function sessionCookie(value: string, maxAge=lifetimeSeconds) { return `${CLOUD_SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`; }

export async function registerAccount(db: CloudAccountDatabase, recoveryKey: string, stateJson: string, deviceId: string) {
  const now=new Date().toISOString(); const accountId=crypto.randomUUID(); const recoveryHash=await hash(recoveryKey);
  await db.prepare("INSERT INTO cloud_account (id, recovery_hash, created_at, updated_at) VALUES (?, ?, ?, ?)").bind(accountId,recoveryHash,now,now).run();
  await db.prepare("INSERT INTO cloud_state (account_id, revision, state_json, updated_at, updated_by_device) VALUES (?, 1, ?, ?, ?)").bind(accountId,stateJson,now,deviceId).run();
  const token=await createSession(db,accountId); return { accountId, revision:1, token };
}
async function createSession(db:CloudAccountDatabase,accountId:string){const bytes=crypto.getRandomValues(new Uint8Array(32));const token=hex(bytes);const now=new Date();const expires=new Date(now.getTime()+lifetimeSeconds*1000).toISOString();await db.prepare("INSERT INTO cloud_account_session (token_hash, account_id, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(await hash(token),accountId,expires,now.toISOString()).run();return token;}
export async function loginAccount(db:CloudAccountDatabase,recoveryKey:string){const row=await db.prepare("SELECT id FROM cloud_account WHERE recovery_hash = ?").bind(await hash(recoveryKey)).first<{id:string}>();if(!row)return null;return {accountId:row.id,token:await createSession(db,row.id)};}
export async function accountFromRequest(db:CloudAccountDatabase,request:Request){const token=cookie(request,CLOUD_SESSION_COOKIE);if(!token)return null;return db.prepare("SELECT account_id FROM cloud_account_session WHERE token_hash = ? AND expires_at > ?").bind(await hash(token),new Date().toISOString()).first<{account_id:string}>();}
export async function logoutAccount(db:CloudAccountDatabase,request:Request){const token=cookie(request,CLOUD_SESSION_COOKIE);if(token)await db.prepare("DELETE FROM cloud_account_session WHERE token_hash = ?").bind(await hash(token)).run();}

export async function getCloudState(db:CloudAccountDatabase,accountId:string){return db.prepare("SELECT revision, state_json, updated_at, updated_by_device FROM cloud_state WHERE account_id = ?").bind(accountId).first<{revision:number;state_json:string;updated_at:string;updated_by_device:string}>();}
export async function updateCloudState(db:CloudAccountDatabase,accountId:string,baseRevision:number,stateJson:string,deviceId:string){const current=await getCloudState(db,accountId);if(!current||current.revision!==baseRevision)return {conflict:current};const now=new Date().toISOString();const backupId=crypto.randomUUID();await db.prepare("INSERT INTO cloud_state_backup (id, account_id, revision, state_json, reason, created_at) VALUES (?, ?, ?, ?, 'automatic', ?)").bind(backupId,accountId,current.revision,current.state_json,now).run();const next=baseRevision+1;await db.prepare("UPDATE cloud_state SET revision = ?, state_json = ?, updated_at = ?, updated_by_device = ? WHERE account_id = ? AND revision = ?").bind(next,stateJson,now,deviceId,accountId,baseRevision).run();await db.prepare("DELETE FROM cloud_state_backup WHERE account_id = ? AND id NOT IN (SELECT id FROM cloud_state_backup WHERE account_id = ? ORDER BY created_at DESC LIMIT 20)").bind(accountId,accountId).run();return {revision:next,updatedAt:now};}
export async function createCloudBackup(db:CloudAccountDatabase,accountId:string){const current=await getCloudState(db,accountId);if(!current)return null;const id=crypto.randomUUID();const now=new Date().toISOString();await db.prepare("INSERT INTO cloud_state_backup (id, account_id, revision, state_json, reason, created_at) VALUES (?, ?, ?, ?, 'manual', ?)").bind(id,accountId,current.revision,current.state_json,now).run();return {id,revision:current.revision,createdAt:now};}
export async function listCloudBackups(db:CloudAccountDatabase,accountId:string){return (await db.prepare("SELECT id, revision, reason, created_at FROM cloud_state_backup WHERE account_id = ? ORDER BY created_at DESC LIMIT 20").bind(accountId).all<{id:string;revision:number;reason:string;created_at:string}>()).results;}
export async function restoreCloudBackup(db:CloudAccountDatabase,accountId:string,id:string,deviceId:string){const backup=await db.prepare("SELECT state_json FROM cloud_state_backup WHERE account_id = ? AND id = ?").bind(accountId,id).first<{state_json:string}>();const current=await getCloudState(db,accountId);if(!backup||!current)return null;return updateCloudState(db,accountId,current.revision,backup.state_json,deviceId);}
