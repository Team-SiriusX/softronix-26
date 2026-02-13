import { Index } from "@upstash/vector";

let _index: Index | null = null;

export function getUpstashIndex(): Index {
  if (!_index) {
    _index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }
  return _index;
}

// Keep backward-compatible export (lazy getter)
export const upstash_index = new Proxy({} as Index, {
  get(_target, prop) {
    return (getUpstashIndex() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
