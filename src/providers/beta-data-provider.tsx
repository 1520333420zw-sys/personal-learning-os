"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BetaState } from "@/domain/beta";
import { BETA_STORAGE_KEY, createInitialBetaState, isBetaState, loadBetaState, saveBetaState } from "@/data/browser";

interface BetaDataValue {
  state: BetaState;
  ready: boolean;
  mutate: (recipe: (draft: BetaState) => void) => void;
  importJson: (json: string) => { ok: true } | { ok: false; error: string };
  exportJson: () => string;
  clearAll: () => void;
}

const BetaDataContext = createContext<BetaDataValue | null>(null);

export function BetaDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BetaState>(() => createInitialBetaState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setState(loadBetaState());
      setReady(true);
    }, 0);
    const sync = (event: StorageEvent) => {
      if (event.key === BETA_STORAGE_KEY) setState(loadBetaState());
    };
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const mutate = useCallback((recipe: (draft: BetaState) => void) => {
    setState((current) => {
      const next = structuredClone(current);
      recipe(next);
      saveBetaState(next);
      return next;
    });
  }, []);

  const importJson = useCallback((json: string) => {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!isBetaState(parsed)) return { ok: false as const, error: "INVALID_DATA" };
      saveBetaState(parsed);
      setState(parsed);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "INVALID_JSON" };
    }
  }, []);

  const clearAll = useCallback(() => {
    const next = createInitialBetaState();
    saveBetaState(next);
    setState(next);
  }, []);

  const value = useMemo<BetaDataValue>(() => ({
    state, ready, mutate, importJson,
    exportJson: () => JSON.stringify(state, null, 2),
    clearAll,
  }), [state, ready, mutate, importJson, clearAll]);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted" aria-busy="true">Personal Learning OS</div>;
  }

  return <BetaDataContext.Provider value={value}>{children}</BetaDataContext.Provider>;
}

export function useBetaData(): BetaDataValue {
  const value = useContext(BetaDataContext);
  if (!value) throw new Error("useBetaData must be used within BetaDataProvider");
  return value;
}
