"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

/**
 * Saves `value` a moment after it stops changing (a "debounce"), so typing
 * doesn't fire a request per keystroke. Saves never overlap: each one waits for
 * the previous to finish, which matters because the first save of a new post
 * creates it. `flush()` saves right now (used before publishing).
 * Warns before closing the tab with unsaved changes.
 */
export function useAutosave<T>(value: T, save: (value: T) => Promise<string | null>, delay = 1200) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const serialized = JSON.stringify(value);
  const lastSaved = useRef(serialized);
  const latest = useRef(serialized);
  const saveRef = useRef(save);
  const queue = useRef<Promise<string | null>>(Promise.resolve(null));

  // Refs are synced after render, never written during it.
  useEffect(() => {
    saveRef.current = save;
    latest.current = serialized;
  });

  const run = useCallback((snapshot: string) => {
    // Chain onto the previous save so two saves are never in flight at once.
    queue.current = queue.current.then(async () => {
      if (snapshot === lastSaved.current) return null;
      setStatus("saving");
      const err = await saveRef.current(JSON.parse(snapshot) as T).catch((e: Error) => e.message);
      if (err) {
        setError(err);
        setStatus("error");
        return err;
      }
      lastSaved.current = snapshot;
      setError(null);
      setStatus(latest.current === snapshot ? "saved" : "unsaved");
      return null;
    });
    return queue.current;
  }, []);

  useEffect(() => {
    if (serialized === lastSaved.current) return;
    setStatus("unsaved");
    const timer = setTimeout(() => void run(serialized), delay);
    return () => clearTimeout(timer);
  }, [serialized, delay, run]);

  const flush = useCallback(() => run(latest.current), [run]);

  useEffect(() => {
    if (status === "saved") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  return { status, error, flush };
}
