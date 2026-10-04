"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BetaState } from "@/domain/beta";
import { BETA_STORAGE_KEY, createInitialBetaState, migrateBetaState, saveBetaState, tryLoadBetaState } from "@/data/browser";
import { browserPdfStorage } from "@/data/storage/pdf-storage";
import { stampBetaMutation } from "@/data/browser/cloud-state-sync";

interface BetaDataValue {
  state: BetaState;
  ready: boolean;
  mutate: (recipe: (draft: BetaState) => void) => void;
  importJson: (json: string) => { ok: true } | { ok: false; error: string };
  replaceState: (state: BetaState) => void;
  exportJson: () => string;
  clearAll: () => void;
}

const BetaDataContext = createContext<BetaDataValue | null>(null);

export function BetaDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BetaState | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const skipNextSave = useRef(false);

  const load = useCallback(() => {
    const result = tryLoadBetaState();
    if (result.ok) {
      skipNextSave.current = true;
      setState(result.state);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(load, 0);
    const sync = (event: StorageEvent) => {
      if (event.key !== BETA_STORAGE_KEY) return;
      const result = tryLoadBetaState();
      if (result.ok) {
        skipNextSave.current = true;
        setState(result.state);
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("storage", sync);
    };
  }, [load]);

  useEffect(() => {
    if (!ready || loadError || !state) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      saveBetaState(state);
    } catch (error) {
      console.error("beta_state_save_failed", error instanceof Error ? error.message : "unknown");
    }
  }, [ready, loadError, state]);

  const mutate = useCallback((recipe: (draft: BetaState) => void) => {
    setState((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      recipe(next);
      return stampBetaMutation(current, next);
    });
  }, []);

  const importJson = useCallback((json: string) => {
    try {
      const parsed: unknown = JSON.parse(json);
      const migrated = migrateBetaState(parsed);
      setState((current) => {
        const next = current ? stampBetaMutation(current, migrated) : migrated;
        saveBetaState(next);
        return next;
      });
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "INVALID_JSON" };
    }
  }, []);

  const replaceState = useCallback((next: BetaState) => {
    saveBetaState(next);
    setState(next);
  }, []);

  const clearAll = useCallback(() => {
    const next = createInitialBetaState();
    saveBetaState(next);
    setState(next);
    void browserPdfStorage.clear().catch(() => undefined);
  }, []);

  const value = useMemo<BetaDataValue>(() => ({
    state: state!, ready, mutate, importJson, replaceState,
    exportJson: () => JSON.stringify(state!, null, 2),
    clearAll,
  }), [state, ready, mutate, importJson, replaceState, clearAll]);

  if (ready && loadError) {
    return <main className="grid min-h-screen place-items-center bg-canvas px-6">
      <section className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 text-center">
        <h1 className="type-h2 text-primary">无法读取本地学习数据</h1>
        <p className="type-small mt-3 text-secondary">原数据仍保留在当前浏览器中，没有被覆盖。请重试；如果问题持续，请先保留此浏览器并联系支持。</p>
        <p className="type-caption mt-2 text-muted">Local learning data could not be loaded. Your stored data has not been overwritten.</p>
        <button type="button" className="mt-5 min-h-11 rounded-md bg-accent px-5 type-label text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" onClick={() => { setReady(false); load(); }}>重试 / Retry</button>
      </section>
    </main>;
  }

  if (!ready || !state) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted" aria-busy="true">Personal Learning OS</div>;
  }

  return <BetaDataContext.Provider value={value}>{children}</BetaDataContext.Provider>;
}

export function useBetaData(): BetaDataValue {
  const value = useContext(BetaDataContext);
  if (!value) throw new Error("useBetaData must be used within BetaDataProvider");
  return value;
}
