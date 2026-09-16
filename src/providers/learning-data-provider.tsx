"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createCoreLearningDataContext,
  type CoreLearningDataContext,
} from "@/data";

interface LearningDataValue {
  context: CoreLearningDataContext;
  revision: number;
  notifyDataChanged: () => void;
}

const LearningDataContext = createContext<LearningDataValue | null>(null);

export function LearningDataProvider({ children }: { children: ReactNode }) {
  const [context] = useState<CoreLearningDataContext>(() =>
    createCoreLearningDataContext(),
  );
  const [revision, setRevision] = useState(0);

  const notifyDataChanged = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      context,
      revision,
      notifyDataChanged,
    }),
    [context, revision, notifyDataChanged],
  );

  return (
    <LearningDataContext.Provider value={value}>
      {children}
    </LearningDataContext.Provider>
  );
}

export function useLearningData() {
  const value = useContext(LearningDataContext);

  if (!value) {
    throw new Error("useLearningData must be used within LearningDataProvider.");
  }

  return value;
}
