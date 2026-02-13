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

      let url: string | null = null;
      for (const cell of cells) {
        const found = extractUrl(cell);
        if (found) { url = found; break; }
      }

      let price = "";
      for (const cell of cells) {
        if (/(?:Rs|₹|\$|€|£)[\s.]*[\d,]+/.test(cell)) { price = cell; break; }
      }

      let rating: number | null = null;
      let reviewCount: number | null = null;
      for (const cell of cells) {
        const rm = cell.match(/([\d.]+)\s*[\/\s]+5/i);
        const rvm = cell.match(/\(\s*(\d+)\s+reviews?\)/i);
        const sc = cell.match(/^\s*(\d+)\s*$/);
        if (rm && rating === null) rating = Number.parseFloat(rm[1]);
        if (rvm && reviewCount === null) reviewCount = Number.parseInt(rvm[1], 10);
        else if (sc && reviewCount === null && rating !== null) reviewCount = Number.parseInt(sc[1], 10);
      }

      return { name, price, rating, reviewCount, url };
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

    // Price: match "**Price:** Rs. 899.00" or "Price: Rs 899"
    const priceMatch = block.match(/\*\*Price[:\s]\*\*\s*([^\n]+)/i) || block.match(/Price[:\s]+([^\n]+)/i);
    const price = priceMatch ? priceMatch[1].replace(/\*\*/g, "").trim() : "";

    // Rating: match "4.5 / 5" or "4.5/5"
    const ratingMatch = block.match(/([\d.]+)\s*[\/\s]+5/i);
    const rating = ratingMatch ? Number.parseFloat(ratingMatch[1]) : null;

    // Reviews: match "(68 reviews)" or "68 reviews"
    const reviewMatch = block.match(/\(\s*(\d+)\s+reviews?\)/i);
    const reviewCount = reviewMatch ? Number.parseInt(reviewMatch[1], 10) : null;

    // URL: from block text or store lookup
    const url = extractUrl(block) ?? lookupProductUrl(name);

    products.push({ name, price, rating, reviewCount, url });
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
      return {
        name,
        price: m[2].trim(),
        rating: Number.parseFloat(m[3]),
        reviewCount: Number.parseInt(m[4], 10),
        url: m[5]?.trim() ?? lookupProductUrl(name),
      };
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
