import { store } from "@/constants/store";
import type { ChatbotProduct } from "./types";

export function extractUrl(value: string): string | null {
  const markdownMatch = value.match(/\((https?:\/\/[^)\s]+)\)/i);
  if (markdownMatch?.[1]) return markdownMatch[1];

  const angleBracketMatch = value.match(/<(https?:\/\/[^>\s]+)>/i);
  if (angleBracketMatch?.[1]) return angleBracketMatch[1];

  const plainMatch = value.match(/(https?:\/\/\S+)/i);
  if (plainMatch?.[1]) return plainMatch[1].replace(/[)>.,]$/, "");

  return null;
}

export function lookupProductUrl(name: string): string | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = store.products.find((p) => {
    const pNormalized = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return pNormalized === normalized || pNormalized.includes(normalized) || normalized.includes(pNormalized);
  });
  return match?.url ?? null;
}

export function lookupProductId(name: string): string | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = store.products.find((p) => {
    const pNormalized = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return pNormalized === normalized || pNormalized.includes(normalized) || normalized.includes(pNormalized);
  });
  return match?.id ?? null;
}

export function extractFromTable(responseText: string): ChatbotProduct[] {
  const lines = responseText.split("\n").map((l) => l.trim());

  return lines
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) => line.split("|").slice(1, -1).map((c) => c.trim()))
    .filter((cells) => cells.length >= 3)
    .filter((cells) => {
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) return false;
      const headerKws = ["product", "price", "rating", "reviews", "link", "category", "quick link", "name", "status", "stock", "availability"];
      const hits = cells.filter((c) => {
        const lower = c.toLowerCase().replace(/[^a-z\s]/g, "").trim();
        return headerKws.some((kw) => lower === kw || lower.includes(kw));
      });
      return hits.length < 2;
    })
    .map((cells): ChatbotProduct | null => {
      const name = cells[0].replace(/\*\*/g, "").trim();
      const id = lookupProductId(name);
      if (!id) return null;
      return { id, name };
    })
    .filter((item): item is ChatbotProduct => item !== null);
}

export function extractFromHeadingList(responseText: string): ChatbotProduct[] {
  // Split on heading patterns like "### 1. Glow Face Wash" or "## 2) Product"
  const blocks = responseText.split(/(?=#{1,4}\s*\d+[.)\s])/g);
  const products: ChatbotProduct[] = [];

  for (const block of blocks) {
    const headerMatch = block.match(/#{1,4}\s*\d+[.)\s]+(.+)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].replace(/\*\*/g, "").trim();
    const id = lookupProductId(name);
    if (id) {
      products.push({ id, name });
    }
  }

  return products;
}

export function extractFromNumberedList(responseText: string): ChatbotProduct[] {
  const lines = responseText.split("\n").map((l) => l.trim());

  return lines
    .map((line): ChatbotProduct | null => {
      const m = line.match(/^\d+[.)\s]+\*{0,2}(.+?)\*{0,2}\s+[—–\-]\s+(.+?)\s+\|\s+[⭐★]\s*([\d.]+)\s*\/\s*5\s*\((\d+)\s+reviews?\)\s*(?:\|\s*(https?:\/\/\S+))?$/i);
      if (!m) return null;

      const name = m[1].trim();
      const id = lookupProductId(name);
      if (!id) return null;
      return { id, name };
    })
    .filter((item): item is ChatbotProduct => item !== null);
}

export function extractProductsFromResponse(responseText: string): ChatbotProduct[] {
  // Strategy 1: Markdown table
  const tableProducts = extractFromTable(responseText);
  if (tableProducts.length > 0) return tableProducts;

  // Strategy 2: Heading + bullet list (### 1. Product Name / - **Price:** ...)
  const headingProducts = extractFromHeadingList(responseText);
  if (headingProducts.length > 0) return headingProducts;

  // Strategy 3: Simple numbered list (1. Name — Price | ⭐ ...)
  return extractFromNumberedList(responseText);
}
