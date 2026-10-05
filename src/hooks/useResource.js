import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

// Tiny stale-while-revalidate cache shared by the data hooks. Returning to a
// page renders cached data immediately (no skeleton flash) and refreshes in
// the background once it's older than staleTime. In-flight requests are
// de-duplicated per key, which also absorbs StrictMode's double effects.
const entries = new Map(); // key -> { data, error, updatedAt, promise }
const listeners = new Map(); // key -> Set<fn>

const getEntry = (key) => entries.get(key) || null;

const emit = (key) => listeners.get(key)?.forEach((fn) => fn());

const subscribe = (key, fn) => {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(fn);
  return () => listeners.get(key)?.delete(fn);
};

const run = (key, fetcher) => {
  const current = getEntry(key) || {};
  if (current.promise) return current.promise;

  const promise = Promise.resolve()
    .then(fetcher)
    .then(
      (data) => {
        const now = Date.now();
        entries.set(key, { data, error: null, updatedAt: now, checkedAt: now, promise: null });
        emit(key);
        return data;
      },
      (error) => {
        // checkedAt (not updatedAt) moves on failure, so a failing background
        // refresh waits a full staleTime before trying again.
        entries.set(key, { ...getEntry(key), error, checkedAt: Date.now(), promise: null });
        emit(key);
        throw error;
      }
    );

  entries.set(key, { ...current, promise });
  emit(key);
  return promise;
};

// Drop cached data for every key starting with prefix, refetching any that
// are currently mounted.
export const invalidate = (prefix) => {
  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) {
      const entry = entries.get(key);
      entries.set(key, { ...entry, checkedAt: 0 });
      emit(key);
    }
  }
};

// Store data the app just received from the backend (e.g. from another
// endpoint) as fresh, so the next read doesn't spend a request re-fetching it.
export const setResourceData = (key, updater) => {
  const entry = getEntry(key) || {};
  const now = Date.now();
  const data = typeof updater === "function" ? updater(entry.data) : updater;
  entries.set(key, { ...entry, data, error: null, updatedAt: now, checkedAt: now });
  emit(key);
};

export default function useResource(key, fetcher, { enabled = true, staleTime = 30000 } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const snapshot = useSyncExternalStore(
    useCallback((fn) => (key ? subscribe(key, fn) : () => {}), [key]),
    () => (key ? getEntry(key) : null)
  );

  const refetch = useCallback(() => {
    if (!key) return Promise.resolve();
    return run(key, () => fetcherRef.current()).catch(() => {});
  }, [key]);

  const updatedAt = snapshot?.updatedAt ?? 0;
  const checkedAt = snapshot?.checkedAt ?? 0;
  const inFlight = Boolean(snapshot?.promise);
  const failedWithoutData = Boolean(snapshot?.error) && snapshot?.data === undefined;

  useEffect(() => {
    if (!enabled || !key || inFlight) return;
    // A first load that failed isn't retried automatically (avoids hammering
    // a rate-limited backend); the UI offers an explicit Retry instead.
    if (failedWithoutData) return;
    // !checkedAt: never fetched (or invalidated) — must load even when
    // staleTime is Infinity, where the age comparison is never true.
    if (!checkedAt || Date.now() - checkedAt > staleTime) refetch();
  }, [enabled, key, checkedAt, inFlight, failedWithoutData, staleTime, refetch]);

  const data = snapshot?.data;
  return {
    data,
    error: snapshot?.error || null,
    updatedAt: updatedAt || null,
    isLoading: enabled && data === undefined && !snapshot?.error,
    isFetching: inFlight,
    refetch,
  };
}
