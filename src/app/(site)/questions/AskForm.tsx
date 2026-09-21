"use client";

import { useActionState, useState } from "react";
import { askQuestion, type AskState } from "./actions";

const MAX = 280;

/**
 * `useActionState` runs the server action on submit and hands back its result,
 * plus a `pending` flag while it's in flight. Works even before JS loads.
 */
export function AskForm() {
  const [state, formAction, pending] = useActionState<AskState, FormData>(askQuestion, null);
  const [length, setLength] = useState(0);

  if (state?.ok) {
    return <p className="rounded-note bg-sticky px-4 py-4 font-hand text-[22px] leading-snug">{state.message}</p>;
  }

  return (
    <form action={formAction} className="rounded-note border border-line-strong bg-card p-4">
      <label htmlFor="ask-text" className="font-mono text-[12px]">
        Ask the lab a question
      </label>
      <textarea
        id="ask-text"
        name="text"
        required
        minLength={10}
        maxLength={MAX}
        rows={3}
        onChange={(e) => setLength(e.target.value.length)}
        placeholder="Why do queues at the other counter always move faster?"
        aria-describedby="ask-help ask-error"
        className="mt-2 w-full resize-y rounded-note border border-line bg-paper px-3 py-2 font-serif text-[18px] placeholder:text-muted focus:border-ink focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label htmlFor="ask-name" className="sr-only">Your name (optional)</label>
        <input
          id="ask-name"
          name="name"
          maxLength={40}
          placeholder="Your name (optional)"
          className="min-w-0 flex-1 rounded-note border border-line bg-paper px-3 py-1.5 text-[14px] placeholder:text-muted focus:border-ink focus:outline-none"
        />
        {/* Honeypot, hidden from people and screen readers. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <span id="ask-help" className="font-mono text-[11px] text-muted">
          {length}/{MAX}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-note bg-ink px-4 py-1.5 text-[14px] text-paper transition-opacity disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send it"}
        </button>
      </div>
      <p id="ask-error" role="alert" className="mt-2 min-h-5 text-[13px] text-red">
        {state && !state.ok ? state.message : ""}
      </p>
      <p className="text-[12px] text-muted">No sign-in. I read every question before it shows up here.</p>
    </form>
  );
}
