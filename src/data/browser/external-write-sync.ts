import type { BetaState } from "@/domain/beta";
import type { ExternalWriteReceipt } from "@/domain/external-writes/command";
import { applyExternalWrite, revertExternalWrite } from "./external-write-merge";

export type ExternalWriteStatusAction = "applied" | "reject" | "reverted";

export interface ExternalWriteAcknowledgement {
  id: string;
  action: ExternalWriteStatusAction;
}

export interface ExternalWriteSyncResult {
  state: BetaState;
  changed: boolean;
  acknowledgements: ExternalWriteAcknowledgement[];
  skipped: string[];
}

/** Applies inbox rows to one cloned BetaState before any server receipt is acknowledged. */
export function mergeExternalWrites(state: BetaState, items: ExternalWriteReceipt[]): ExternalWriteSyncResult {
  const next = structuredClone(state);
  const acknowledgements: ExternalWriteAcknowledgement[] = [];
  const skipped: string[] = [];
  let changed = false;

  for (const item of items) {
    const receipt = next.externalWriteReceipts.find((entry) => entry.id === item.id);
    try {
      if (item.status === "pending") {
        if (receipt?.revertedAt) {
          acknowledgements.push({ id: item.id, action: "reject" });
        } else {
          if (!receipt) {
            applyExternalWrite(next, item);
            changed = true;
          }
          acknowledgements.push({ id: item.id, action: "applied" });
        }
      } else if (item.status === "revoke_requested" && receipt) {
        if (!receipt.revertedAt) {
          revertExternalWrite(next, item.id);
          changed = true;
        }
        acknowledgements.push({ id: item.id, action: "reverted" });
      } else {
        // A revoke must be handled by the browser that imported it; another browser cannot safely acknowledge it.
        skipped.push(item.id);
      }
    } catch {
      skipped.push(item.id);
    }
  }

  return { state: next, changed, acknowledgements, skipped };
}

export async function listExternalWrites(): Promise<{ response: Response; items: ExternalWriteReceipt[] }> {
  const items: ExternalWriteReceipt[] = [];
  let cursor: number | null = 0;
  let response: Response;
  do {
    response = await fetch(`/api/external-writes?after=${cursor}`, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) return { response, items: [] };
    const page = await response.json() as { items: ExternalWriteReceipt[]; nextCursor: number | null };
    items.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);
  return { response: response!, items };
}

export async function acknowledgeExternalWrite({ id, action }: ExternalWriteAcknowledgement): Promise<boolean> {
  const response = await fetch(`/api/external-writes/${id}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  return response.ok;
}
