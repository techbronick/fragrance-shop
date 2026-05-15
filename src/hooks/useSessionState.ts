// src/hooks/useSessionState.ts
//
// useState-backed by sessionStorage, keyed by the caller. Used to preserve
// list-view state (filters, sort, query, visibleCount) across navigations
// so that a user returning to a page via the browser Back button lands on
// the same view they left — not at the top of a freshly-reset list.
//
// Keys should be scoped per history entry (e.g. include `useLocation().key`)
// so unrelated visits to the same path don't bleed state into each other.

import { useEffect, useRef, useState } from "react";

const PREFIX = "appstate:";

export function useSessionState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Read once on mount; later writes are persisted via the effect below.
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = sessionStorage.getItem(PREFIX + key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // If the caller changes the key (rare), pick up the new bucket's value.
  const prevKey = useRef(key);
  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    try {
      const raw = sessionStorage.getItem(PREFIX + key);
      setValue(raw != null ? (JSON.parse(raw) as T) : initial);
    } catch {
      setValue(initial);
    }
  }, [key, initial]);

  useEffect(() => {
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota / disabled — ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
