"use client";

/**
 * `const values = await ask({ title, fields })` from anywhere under the provider.
 * Built on the native <dialog>, which gives focus trapping and Esc-to-close.
 * The pattern: context exposes a function that returns a Promise, and the
 * provider keeps that promise's `resolve` until the dialog closes.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type PromptField = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
  options?: string[];
  required?: boolean;
};
export type PromptRequest = { title: string; fields: PromptField[]; submitLabel?: string };
export type Ask = (req: PromptRequest) => Promise<Record<string, string> | null>;

const PromptContext = createContext<Ask>(async () => null);

export const usePrompt = () => useContext(PromptContext);

const input = "w-full rounded-note border border-line-strong bg-paper px-3 py-2 text-[15px] focus:border-ink focus:outline-none";

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<PromptRequest | null>(null);
  const resolver = useRef<((v: Record<string, string> | null) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const ask = useCallback<Ask>((req) => {
    resolver.current?.(null);
    setRequest(req);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  useEffect(() => {
    if (request && !dialog.current?.open) dialog.current?.showModal();
  }, [request]);

  const finish = (value: Record<string, string> | null) => {
    resolver.current?.(value);
    resolver.current = null;
    dialog.current?.close();
    setRequest(null);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    finish(Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v).trim()])));
  };

  return (
    <PromptContext.Provider value={ask}>
      {children}
      <dialog
        ref={dialog}
        onCancel={() => finish(null)}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-note border border-line-strong bg-card p-0 text-ink backdrop:bg-ink/30"
      >
        {request && (
          <form onSubmit={onSubmit} className="space-y-3 p-5">
            <h2 className="font-serif text-[20px]">{request.title}</h2>
            {request.fields.map((f, i) => (
              <label key={f.name} className="block">
                <span className="mb-1 block text-[13px] text-muted">{f.label}</span>
                {f.options ? (
                  <select name={f.name} defaultValue={f.defaultValue} className={input}>
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.multiline ? (
                  <textarea name={f.name} defaultValue={f.defaultValue} placeholder={f.placeholder} required={f.required} rows={4} autoFocus={i === 0} className={`${input} font-mono text-[14px]`} />
                ) : (
                  <input name={f.name} defaultValue={f.defaultValue} placeholder={f.placeholder} required={f.required} autoFocus={i === 0} className={input} />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => finish(null)} className="rounded-note px-3 py-1.5 text-[14px] text-muted hover:text-ink">
                Cancel
              </button>
              <button type="submit" className="rounded-note bg-ink px-4 py-1.5 text-[14px] text-paper">
                {request.submitLabel ?? "Insert"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </PromptContext.Provider>
  );
}
