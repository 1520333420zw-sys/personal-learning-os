"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { syncLearningMirror } from "@/data/browser/learning-mirror-sync";
import { useBetaData } from "@/providers";
import { EXTERNAL_SYNC_CONNECTED_EVENT } from "./external-write-auto-sync";

const debounceMilliseconds = 1_500;

export function LearningMirrorAutoSync() {
  const { state } = useBetaData();
  const running = useRef(false);

  const synchronize = useEffectEvent(async () => {
    if (running.current) return;
    running.current = true;
    try { await syncLearningMirror(state); }
    catch (error) { console.error("learning_mirror_auto_sync_failed", error instanceof Error ? error.message : "unknown_error"); }
    finally { running.current = false; }
  });

  useEffect(() => {
    const timer = window.setTimeout(() => { void synchronize(); }, debounceMilliseconds);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") void synchronize(); };
    const onConnected = () => { void synchronize(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(EXTERNAL_SYNC_CONNECTED_EVENT, onConnected);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(EXTERNAL_SYNC_CONNECTED_EVENT, onConnected);
    };
  }, []);

  return null;
}
