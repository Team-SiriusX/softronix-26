/**
 * Custom event bus for agent → page communication.
 * The agent dispatches typed events; pages listen and act.
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

export function dispatchAgentEvent<T extends AgentEventType>(
  type: T,
  detail: AgentEventPayload[T]
) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function onAgentEvent<T extends AgentEventType>(
  type: T,
  handler: (payload: AgentEventPayload[T]) => void
) {
  const listener = (e: Event) => {
    handler((e as CustomEvent).detail);
  };
  window.addEventListener(type, listener);
  return () => window.removeEventListener(type, listener);
}
