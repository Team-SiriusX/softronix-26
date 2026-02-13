export function cleanResponseForChat(text: string): string {
  const lines = text.split("\n");

  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    // Remove markdown table rows (| ... |) and divider rows (|---|---|)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) return false;
    // Remove product heading lines like "### 1. Glow Face Wash"
    if (/^#{1,4}\s*\d+[\.)\s]/.test(trimmed)) return false;
    // Remove bullet lines with product metadata (Price, Rating, Category, Product link)
    if (/^[-*]\s*\*\*(?:Price|Rating|Category|Product\s*link|Availability|Reviews?|Link)[:\s]*\*\*/i.test(trimmed)) return false;
    return true;
  });

  let result = cleaned.join("\n");

  // Remove angle-bracket URLs: <https://...>
  result = result.replace(/<(https?:\/\/[^>\s]+)>/gi, "");

  // Replace markdown links [text](url) with just the text
  result = result.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1");

  // Remove bare URLs
  result = result.replace(/https?:\/\/\S+/gi, "");

  // Collapse 3+ consecutive blank lines into 2
  result = result.replace(/(\n\s*){3,}/g, "\n\n");

  return result.trim();
}

export function buildFallbackClerkResponse(
  userMessage: string,
  relevantProducts: Array<{ id: string; metadata?: Record<string, unknown> }> | undefined
): string {
  if (!relevantProducts || relevantProducts.length === 0) {
    return "I'm having trouble reaching my AI provider right now, but I can still help. I couldn't find strong product matches yet—please share a bit more detail like category, budget, or skin type and I'll narrow it down.";
  }

  const topProducts = relevantProducts.slice(0, 3);
  const lines = topProducts.map((product, index) => {
    const name = (product.metadata?.name as string) || "Product";
    const price = (product.metadata?.formatted_price as string) || "Price unavailable";
    const rating = (product.metadata?.rating as number) || 0;
    const reviewCount = (product.metadata?.review_count as number) || 0;
    const url = (product.metadata?.url as string) || "";

    return `${index + 1}. ${name} — ${price} | ⭐ ${rating}/5 (${reviewCount} reviews)${url ? ` | ${url}` : ""}`;
  });

  return [
    "I'm having trouble reaching my AI provider right now, but I can still help using available product matches.",
    `Based on your request: \"${userMessage}\"`,
    "",
    "Top suggestions:",
    ...lines,
    "",
    "If you want, I can refine these by budget, brand, skin type, or ingredient preference.",
  ].join("\n");
}
