"use client";

import { useCallback, useRef, useState } from "react";

/** A single bottom-centre message ("Image added", "Upload failed…") that fades after a few seconds. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const notify = useCallback((text: string) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), 3500);
  }, []);

  const toast = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center">
      {message && <p className="rounded-note bg-ink px-4 py-2 text-[14px] text-paper shadow-lg">{message}</p>}
    </div>
  );
  return { toast, notify };
}
