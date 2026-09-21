/**
 * Browser-side event sender. `sendBeacon` queues the request with the browser,
 * so it still goes out if the reader closes the tab straight away.
 */
export type TrackEvent =
  | { type: "read"; postId: number; referrer: string; ref: string | null }
  | { type: "depth"; postId: number; depth: 25 | 50 | 75 | 100 }
  | { type: "share"; postId: number; channel: string };

export function sendEvent(event: TrackEvent): void {
  const body = JSON.stringify(event);
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // Fall through to fetch.
  }
  fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(
    () => {},
  );
}

export function trackShare(postId: number, channel: string): void {
  sendEvent({ type: "share", postId, channel });
}
