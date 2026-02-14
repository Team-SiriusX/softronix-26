/**
 * Custom event bus for agent → page communication.
 * The agent dispatches typed events; pages listen and act.
 *
 * Uses a "sticky event" buffer so that events dispatched before
 * a page mounts are replayed when the page's listener registers.
 */

export type AgentEventType =
  | "agent:fillAddress"
  | "agent:selectAddress"
  | "agent:proceedToPayment"
  | "agent:submitAddress";

export interface AgentFillAddressPayload {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export type AgentEventPayload = {
  "agent:fillAddress": AgentFillAddressPayload;
  "agent:selectAddress": { addressIndex: number };
  "agent:proceedToPayment": Record<string, never>;
  "agent:submitAddress": Record<string, never>;
};

// ── Sticky event buffer ──
// Stores dispatched events so that late-registering listeners can pick them up.
const pendingEvents = new Map<string, unknown[]>();

export function dispatchAgentEvent<T extends AgentEventType>(
  type: T,
  detail: AgentEventPayload[T]
) {
  // Fire immediately for already-mounted listeners
  window.dispatchEvent(new CustomEvent(type, { detail }));

  // Also buffer the event for listeners that haven't mounted yet
  if (!pendingEvents.has(type)) pendingEvents.set(type, []);
  pendingEvents.get(type)!.push(detail);

  // Auto-clean the buffer after 10s (prevents stale replays)
  setTimeout(() => {
    const q = pendingEvents.get(type);
    if (q) {
      q.shift(); // remove oldest
      if (q.length === 0) pendingEvents.delete(type);
    }
  }, 10_000);
}

export function onAgentEvent<T extends AgentEventType>(
  type: T,
  handler: (payload: AgentEventPayload[T]) => void
) {
  // Replay any pending (buffered) events immediately for this type
  const pending = pendingEvents.get(type);
  if (pending && pending.length > 0) {
    const items = [...pending];
    pendingEvents.delete(type);
    // Fire with a microtask delay so the component is fully ready
    for (const detail of items) {
      queueMicrotask(() => handler(detail as AgentEventPayload[T]));
    }
  }

  // Register for future events
  const listener = (e: Event) => {
    const detail = (e as CustomEvent).detail as AgentEventPayload[T];
    handler(detail);
    // If this event was also in the buffer, remove it to avoid double-fire
    const q = pendingEvents.get(type);
    if (q) {
      const idx = q.indexOf(detail);
      if (idx >= 0) q.splice(idx, 1);
    }
  };
  window.addEventListener(type, listener);
  return () => window.removeEventListener(type, listener);
}
