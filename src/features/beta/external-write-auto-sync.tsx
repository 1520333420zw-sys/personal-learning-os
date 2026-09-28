"use client";

import { useCallback, useEffect, useRef } from "react";
import { acknowledgeExternalWrite, listExternalWrites, mergeExternalWrites } from "@/data/browser/external-write-sync";
import { useBetaData } from "@/providers";

export const EXTERNAL_SYNC_CONNECTED_EVENT = "plos:external-sync-connected";
const minimumRefreshInterval = 60_000;

export function ExternalWriteAutoSync() {
  const { state, importJson } = useBetaData();
  const stateRef = useRef(state);
  const running = useRef(false);
  const lastCheckedAt = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const synchronize = useCallback(async (force = false) => {
    if (running.current || (!force && Date.now() - lastCheckedAt.current < minimumRefreshInterval)) return;
    running.current = true;
    lastCheckedAt.current = Date.now();
    try {
      const inbox = await listExternalWrites();
      if (!inbox.response.ok || inbox.items.length === 0) return;
      const result = mergeExternalWrites(stateRef.current, inbox.items);
      if (result.changed && !importJson(JSON.stringify(result.state)).ok) return;
      for (const acknowledgement of result.acknowledgements) {
        await acknowledgeExternalWrite(acknowledgement);
      }
    } catch (error) {
      console.error("external_write_auto_sync_failed", error instanceof Error ? error.message : "unknown_error");
    } finally {
      running.current = false;
    }
  }, [importJson]);

  useEffect(() => {
    void synchronize(true);
    const onVisible = () => { if (document.visibilityState === "visible") void synchronize(); };
    const onConnected = () => { void synchronize(true); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(EXTERNAL_SYNC_CONNECTED_EVENT, onConnected);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(EXTERNAL_SYNC_CONNECTED_EVENT, onConnected);
    };
  }, [synchronize]);

  return null;
}
