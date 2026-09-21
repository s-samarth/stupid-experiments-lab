"use client";

import { useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

/**
 * Saves `value` a moment after it stops changing (a "debounce"), so typing
 * doesn't fire a request per keystroke. Warns before closing the tab with
 * unsaved changes.
 */
export function useAutosave<T>(value: T, save: (value: T) => Promise<string | null>, delay = 1200) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const serialized = JSON.stringify(value);
  const lastSaved = useRef(serialized);
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (serialized === lastSaved.current) return;
    setStatus("unsaved");
    const timer = setTimeout(async () => {
      setStatus("saving");
      const err = await saveRef.current(JSON.parse(serialized) as T).catch((e: Error) => e.message);
      if (err) {
        setError(err);
        setStatus("error");
      } else {
        lastSaved.current = serialized;
        setError(null);
        setStatus("saved");
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [serialized, delay]);

  useEffect(() => {
    if (status === "saved") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  return { status, error };
}
