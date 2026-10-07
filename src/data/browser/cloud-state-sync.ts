import type { BetaEntity, BetaState, BetaSyncDeletion } from "@/domain/beta";
import { migrateBetaState, serializeBetaState } from "./beta-store";

export const CLOUD_SYNC_STATUS_EVENT = "plos:cloud-sync-status";
export const CLOUD_SYNC_METADATA_KEY = "personal-learning-os:cloud:v1";

export const syncCollections = [
  "knowledgePoints", "tasks", "studySessions", "pomodoroSessions", "studyProgress", "reviewItems", "questionAttempts",
  "wrongQuestions", "favorites", "vocabulary", "reading", "readingNotes", "recitations", "notes", "books",
  "englishContent", "subjectiveQuestions", "currentAffairs", "pdfDocuments", "pdfNotes", "resources", "habits", "exercises", "sleep",
  "finance", "goals", "courseProgress", "chapterProgress", "chapterMindMaps", "sectionProgress", "feynmanAttempts",
] as const;

type SyncCollection = typeof syncCollections[number];
interface Metadata { accountId: string; deviceId: string; revision: number; }
export interface CloudSyncStatus { status: "disconnected" | "syncing" | "synced" | "conflict" | "failed"; revision?: number; message?: string; }

const comparable = (value: unknown) => JSON.stringify(value, (key, item) => key === "updatedAt" ? undefined : item);
const rows = (state: BetaState, collection: SyncCollection) => state[collection] as BetaEntity[];

export function stampBetaMutation(current: BetaState, next: BetaState, now = new Date().toISOString()): BetaState {
  const deletions = new Map(next.cloudSync.deletions.map((item) => [`${item.collection}:${item.id}`, item]));
  for (const collection of syncCollections) {
    const before = new Map(rows(current, collection).map((item) => [item.id, item]));
    for (const item of rows(next, collection)) {
      const prior = before.get(item.id);
      if (!prior || comparable(prior) !== comparable(item)) item.updatedAt = now;
      before.delete(item.id);
      deletions.delete(`${collection}:${item.id}`);
    }
    for (const item of before.values()) deletions.set(`${collection}:${item.id}`, { collection, id: item.id, deletedAt: now });
  }
  next.cloudSync.deletions = [...deletions.values()];
  return next;
}

export function mergeCloudStates(localValue: unknown, remoteValue: unknown): BetaState {
  const local = migrateBetaState(localValue); const remote = migrateBetaState(remoteValue);
  const merged = structuredClone(remote);
  const deletionMap = new Map<string, BetaSyncDeletion>();
  for (const deletion of [...remote.cloudSync.deletions, ...local.cloudSync.deletions]) {
    const key = `${deletion.collection}:${deletion.id}`; const prior = deletionMap.get(key);
    if (!prior || deletion.deletedAt > prior.deletedAt) deletionMap.set(key, deletion);
  }
  for (const collection of syncCollections) {
    const union = new Map<string, BetaEntity>();
    for (const item of [...rows(remote, collection), ...rows(local, collection)]) {
      const prior = union.get(item.id);
      if (!prior || item.updatedAt > prior.updatedAt) union.set(item.id, item);
    }
    (merged[collection] as BetaEntity[]) = [...union.values()].filter((item) => {
      const deleted = deletionMap.get(`${collection}:${item.id}`);
      return !deleted || deleted.deletedAt < item.updatedAt;
    });
  }
  merged.cloudSync.deletions = [...deletionMap.values()];
  const receipts = new Map([...remote.externalWriteReceipts, ...local.externalWriteReceipts].map((item) => [item.id, item]));
  merged.externalWriteReceipts = [...receipts.values()].map((item) => {
    const left=local.externalWriteReceipts.find((entry)=>entry.id===item.id);const right=remote.externalWriteReceipts.find((entry)=>entry.id===item.id);
    if(left?.revertedAt && (!right?.revertedAt||left.revertedAt>right.revertedAt))return left;return right??left??item;
  });
  if ((local.planningProfile?.updatedAt ?? "") > (remote.planningProfile?.updatedAt ?? "")) merged.planningProfile = local.planningProfile;
  const vocabularyState = new Map(Object.entries(remote.contentVocabularyState ?? {}));
  for (const [id, value] of Object.entries(local.contentVocabularyState ?? {})) {
    const prior = vocabularyState.get(id);
    if (!prior || value.updatedAt > prior.updatedAt) vocabularyState.set(id, value);
  }
  merged.contentVocabularyState = Object.fromEntries(vocabularyState);
  merged.pomodoroRuntime = local.pomodoroRuntime ?? remote.pomodoroRuntime;
  return migrateBetaState(merged);
}

export function readCloudMetadata(): Metadata | null {
  try { const value = JSON.parse(localStorage.getItem(CLOUD_SYNC_METADATA_KEY) ?? "null") as Metadata | null; return value?.accountId && value.deviceId ? value : null; }
  catch { return null; }
}
export function writeCloudMetadata(value: Metadata) { localStorage.setItem(CLOUD_SYNC_METADATA_KEY, JSON.stringify(value)); }
export function clearCloudMetadata() { localStorage.removeItem(CLOUD_SYNC_METADATA_KEY); }
export function deviceId() { const prior=readCloudMetadata()?.deviceId; return prior ?? crypto.randomUUID(); }
export function hasPersonalData(state: BetaState) {
  if (syncCollections.some((collection) => !["knowledgePoints", "recitations", "subjectiveQuestions"].includes(collection) && rows(state, collection).length > 0)) return true;
  if (state.knowledgePoints.some((item) => item.personalNote || item.favorite || item.mastery !== "new" || item.lastStudiedAt || item.nextReviewAt)) return true;
  if (state.subjectiveQuestions.some((item) => item.ownAnswer.trim())) return true;
  if (state.recitations.some((item) => item.favorite || item.status !== "today" || (item.reviewCount ?? 0) > 0 || !item.id.startsWith("recitation-system-"))) return true;
  if (Object.keys(state.contentVocabularyState ?? {}).length) return true;
  return Boolean(state.planningProfile || state.externalWriteReceipts.length);
}
export function cloudPayload(state: BetaState) { return JSON.parse(serializeBetaState(state)) as unknown; }
