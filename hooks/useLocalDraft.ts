"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Local draft persistence with debounced saving.
 *
 * Drafts live only in this browser's localStorage. Each stored draft is
 * wrapped in a versioned envelope so that missing, corrupted, or outdated
 * data is detected and discarded instead of crashing the form.
 */

export interface StoredDraft<T> {
  version: number;
  savedAt: string;
  data: T;
}

export type DraftLoadIssue = "corrupted" | "outdated";
export type DraftSaveStatus = "idle" | "unsaved" | "saved" | "error";

export type DraftParser<T> = (data: unknown) => T | null;

export interface ReadDraftResult<T> {
  draft: StoredDraft<T> | null;
  issue: DraftLoadIssue | null;
}

export function getBrowserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    // Accessing localStorage can throw when storage is blocked (e.g. some privacy modes).
    return undefined;
  }
}

function safeRemove(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore: nothing else we can do if storage is unavailable.
  }
}

export function readDraft<T>(
  storage: Storage | undefined,
  key: string,
  version: number,
  parse: DraftParser<T>,
): ReadDraftResult<T> {
  if (!storage) return { draft: null, issue: null };

  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { draft: null, issue: null };
  }
  if (raw === null) return { draft: null, issue: null };

  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    safeRemove(storage, key);
    return { draft: null, issue: "corrupted" };
  }

  if (
    typeof envelope !== "object" ||
    envelope === null ||
    typeof (envelope as StoredDraft<unknown>).version !== "number" ||
    typeof (envelope as StoredDraft<unknown>).savedAt !== "string"
  ) {
    safeRemove(storage, key);
    return { draft: null, issue: "corrupted" };
  }

  const candidate = envelope as StoredDraft<unknown>;
  if (candidate.version !== version) {
    safeRemove(storage, key);
    return { draft: null, issue: "outdated" };
  }

  const data = parse(candidate.data);
  if (data === null) {
    safeRemove(storage, key);
    return { draft: null, issue: "corrupted" };
  }

  return { draft: { version, savedAt: candidate.savedAt, data }, issue: null };
}

export function writeDraft<T>(storage: Storage | undefined, key: string, version: number, data: T): StoredDraft<T> {
  if (!storage) throw new Error("Local storage is not available in this browser.");
  const envelope: StoredDraft<T> = { version, savedAt: new Date().toISOString(), data };
  storage.setItem(key, JSON.stringify(envelope));
  return envelope;
}

export function removeDraft(storage: Storage | undefined, key: string) {
  if (storage) safeRemove(storage, key);
}

interface UseLocalDraftOptions<T> {
  key: string;
  version: number;
  parse: DraftParser<T>;
  debounceMs?: number;
}

export interface UseLocalDraftResult<T> {
  /** The draft found when the hook first ran, if any. */
  initialDraft: T | null;
  /** Set when a stored draft could not be used and was removed. */
  loadIssue: DraftLoadIssue | null;
  dismissLoadIssue: () => void;
  status: DraftSaveStatus;
  lastSavedAt: string | null;
  /** Save after a short pause; repeated calls reset the timer. */
  scheduleSave: (data: T) => void;
  /** Save immediately. Returns false if the browser refused to store it. */
  saveNow: (data: T) => boolean;
  clearDraft: () => void;
}

/**
 * Must run on the client only (see useIsClient), because it reads
 * localStorage during its first render to restore the draft synchronously.
 */
export function useLocalDraft<T>({ key, version, parse, debounceMs = 800 }: UseLocalDraftOptions<T>): UseLocalDraftResult<T> {
  const [initial] = useState(() => readDraft(getBrowserStorage(), key, version, parse));
  const [loadIssue, setLoadIssue] = useState<DraftLoadIssue | null>(initial.issue);
  const [status, setStatus] = useState<DraftSaveStatus>(initial.draft ? "saved" : "idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initial.draft?.savedAt ?? null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ data: T } | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveNow = useCallback(
    (data: T) => {
      cancelTimer();
      pendingRef.current = null;
      try {
        const stored = writeDraft(getBrowserStorage(), key, version, data);
        setLastSavedAt(stored.savedAt);
        setStatus("saved");
        return true;
      } catch {
        setStatus("error");
        return false;
      }
    },
    [cancelTimer, key, version],
  );

  const scheduleSave = useCallback(
    (data: T) => {
      pendingRef.current = { data };
      setStatus("unsaved");
      cancelTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (pendingRef.current) saveNow(pendingRef.current.data);
      }, debounceMs);
    },
    [cancelTimer, debounceMs, saveNow],
  );

  const clearDraft = useCallback(() => {
    cancelTimer();
    pendingRef.current = null;
    removeDraft(getBrowserStorage(), key);
    setStatus("idle");
    setLastSavedAt(null);
  }, [cancelTimer, key]);

  const dismissLoadIssue = useCallback(() => setLoadIssue(null), []);

  // If the member leaves before the debounce finishes, write the latest changes.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingRef.current) {
        try {
          writeDraft(getBrowserStorage(), key, version, pendingRef.current.data);
        } catch {
          // Storage unavailable; nothing to flush to.
        }
        pendingRef.current = null;
      }
    };
  }, [key, version]);

  return {
    initialDraft: initial.draft?.data ?? null,
    loadIssue,
    dismissLoadIssue,
    status,
    lastSavedAt,
    scheduleSave,
    saveNow,
    clearDraft,
  };
}
