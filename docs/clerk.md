# Clerk AI Assistant Module

The `(clerk)` folder contains a comprehensive AI-powered shopping assistant system built with Hono.js, OpenRouter, and vector search capabilities. This module enables conversational shopping experiences with features like product search, price negotiation, coupon generation, and real-time UI actions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module Structure](#module-structure)
3. [Types](#types)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Chat Handler](#chat-handler)
7. [OpenRouter Client](#openrouter-client)
8. [Tool Executor](#tool-executor)
9. [Product Extractors](#product-extractors)
10. [Response Formatters](#response-formatters)
11. [Utilities](#utilities)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Client                              │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        clerk.ts (Hono API)                          │
│  ┌─────────────┐  ┌────────────────┐  ┌──────────────────────────┐  │
│  │ GET /       │  │ POST /search   │  │ POST /                   │  │
│  │ (info)      │  │ (products)     │  │ (chat with AI)           │  │
│  └─────────────┘  └────────────────┘  └──────────────────────────┘  │
│  ┌───────────────────┐  ┌────────────────────────────────────────┐  │
│  │ POST /product/:id │  │ POST /coupon/verify & /coupon/redeem   │  │
│  └───────────────────┘  └────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      chat-handler.ts                                 │
│  - RAG: Vector search for relevant products                         │
│  - Builds enhanced system prompt with context                       │
│  - Iterative tool execution loop                                    │
│  - Captures products, functions, and RPC calls                      │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
│ openrouter-      │ │ tool-          │ │ product-         │
│ client.ts        │ │ executor.ts    │ │ extractors.ts    │
│ - Send chat      │ │ - Search       │ │ - Table parser   │
│   requests to    │ │ - Get details  │ │ - Heading parser │
│   OpenRouter     │ │ - UI actions   │ │ - List parser    │
│                  │ │ - Coupons      │ │                  │
└──────────────────┘ └────────────────┘ └──────────────────┘
```

---

## Module Structure

| File                     | Description                                                |
|--------------------------|------------------------------------------------------------|
| `index.ts`               | Main export barrel file for all modules                    |
| `types.ts`               | TypeScript type definitions                                |
| `config.ts`              | System prompt and tool definitions for OpenRouter          |
| `clerk.ts`               | Hono API routes and handlers                               |
| `chat-handler.ts`        | Main chat logic with RAG and tool calling                  |
| `openrouter-client.ts`   | OpenRouter SDK wrapper                                     |
| `tool-executor.ts`       | Executes AI-requested function calls                       |
| `product-extractors.ts`  | Parses product data from AI text responses                 |
| `response-formatters.ts` | Cleans AI responses for chat display                       |
| `utils.ts`               | JSON repair, argument parsing, error extraction            |

---

## Types

### `types.ts`

#### ChatbotProduct
Represents a product extracted from AI responses or search results.

```typescript
type ChatbotProduct = {
  name: string;
  price: string;
  rating: number | null;
  reviewCount: number | null;
  url: string | null;
};
```

#### ClerkRpcCall
RPC-like function call that the frontend should execute based on AI decisions.

```typescript
type ClerkRpcCall = {
  name: string;           // Frontend function name
  args: Record<string, unknown>;  // Arguments for the function
};
```

**Available RPC Functions:**
| Function             | Description                                    |
|----------------------|------------------------------------------------|
| `sortProducts`       | Sort the product listing                       |
| `filterProducts`     | Apply filters (category, price, rating, stock) |
| `navigateToProduct`  | Scroll/navigate to a specific product          |
| `showRecommendations`| Show personalized product recommendations      |
| `highlightProduct`   | Visually highlight a product card              |
| `applyVibeFilter`    | Apply vibe-based layout ("cheaper", "premium") |
| `clearFilters`       | Reset all active filters                       |
| `openProductDetail`  | Open product detail view/modal                 |
| `addToCart`          | Add a product to the cart                      |
| `applyCoupon`        | Apply a coupon code to the cart                |

#### ClerkResponse
Response structure from the chat handler.

```typescript
type ClerkResponse = {
  text: string;                    // AI response text
  toolProducts: ChatbotProduct[];  // Products from tool calls
  functions: ClerkRpcCall[];       // Frontend RPC calls
};
```

#### ConversationMessage
Message format for conversation history.

```typescript
type ConversationMessage = {
  role: string;    // "user" | "assistant" | "system"
  content: string;
};
```

#### ToolFunction
OpenRouter tool definition format.

```typescript
type ToolFunction = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, unknown>;
      required: string[];
    };
  };
};
```

---

## Configuration

### `config.ts`

#### System Prompt
The AI is configured with a comprehensive system prompt that defines its behavior:

- **Role**: AI shopping clerk for the store
- **Capabilities**: Product search, availability checks, price negotiation
- **Guidelines**: Friendly, conversational, uses semantic search
- **Haggle Mode**: Can negotiate discounts (max 20% off, never below 70%)
- **Negative Behavior Handling**: Price increase (5%) for rude customers

#### Available AI Tools

| Tool Name           | Description                                      |
|---------------------|--------------------------------------------------|
| `searchProducts`    | Semantic search for products                     |
| `getProductDetails` | Get detailed info about a product                |
| `checkAvailability` | Check if a product is in stock                   |
| `applyDiscount`     | Apply discount (max 20%, min 70% of price)       |
| `triggerUIAction`   | Trigger frontend UI changes in real-time         |
| `generateCoupon`    | Generate unique coupon codes (stored in DB)      |
| `adjustPrice`       | Increase price for negative behavior (max 10%)   |

#### UI Actions (via `triggerUIAction`)

| Action               | Arguments                                         |
|----------------------|---------------------------------------------------|
| `sortProducts`       | `{ sortBy: "price"|"rating"|"name"|"reviews", order: "asc"|"desc" }` |
| `filterProducts`     | `{ category?, minPrice?, maxPrice?, minRating?, inStock?, search? }` |
| `navigateToProduct`  | `{ productId: string }`                           |
| `showRecommendations`| `{ basedOn: "past_activity"|"current_chat"|"trending"|"similar", productIds? }` |
| `highlightProduct`   | `{ productId: string, duration?: number }`        |
| `applyVibeFilter`    | `{ vibe: "cheaper"|"premium"|"trending"|"best_rated"|"new_arrivals" }` |
| `clearFilters`       | `{}`                                              |
| `openProductDetail`  | `{ productId: string }`                           |
| `addToCart`          | `{ productId: string, quantity?: number }`        |
| `applyCoupon`        | `{ couponCode: string, productId: string }`       |

---

## API Endpoints

### `clerk.ts`

#### `GET /`
Returns basic clerk endpoint information.

**Response:**
```json
{
  "message": "CLERK ENDPOINT",
  "store": "Store Name",
  "totalProducts": 100
}
```

#### `POST /search`
Search products using vector similarity.

**Request Body:**
```json
{
  "query": "moisturizing cream",
  "maxResults": 5
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "searchQuery": "moisturizing cream"
}
```

#### `POST /product/:id`
Get details for a specific product.

**Response:**
```json
{
  "success": true,
  "product": { ... }
}
```

#### `POST /`
Main chat endpoint - converse with the AI clerk.

**Request Body:**
```json
{
  "userMessage": "Show me face creams under $50",
  "conversationHistory": [
    { "role": "user", "content": "hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Here are some face creams under $50...",
  "products": [...],
  "functions": [
    { "name": "filterProducts", "args": { "maxPrice": 50, "category": "face cream" } }
  ],
  "conversationHistory": [...] // dev mode only
}
```

#### `POST /coupon/verify`
Verify a coupon code without redeeming it.

**Request Body:**
```json
{
  "code": "BDAY-15-ABCD",
  "productId": "product-123"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "code": "BDAY-15-ABCD",
    "productId": "product-123",
    "productName": "Product Name",
    "discountPercentage": 15,
    "originalPrice": 100,
    "discountedPrice": 85,
    "expiresAt": "2026-02-14T12:00:00.000Z"
  }
}
```

#### `POST /coupon/redeem`
Redeem (use) a coupon code.

**Request Body:**
```json
{
  "code": "BDAY-15-ABCD",
  "productId": "product-123"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": { ... },
  "message": "Coupon redeemed successfully!"
}
```

---

## Chat Handler

### `chat-handler.ts`

#### `chatWithClerk(userMessage, conversationHistory, userId?): Promise<ClerkResponse>`

Main entry point for AI conversations. Implements a RAG (Retrieval-Augmented Generation) pipeline with tool calling.

**Flow:**
1. **RAG Retrieval**: Query vector database for relevant products based on user message
2. **Context Enhancement**: Build system prompt with retrieved product context
3. **Initial API Call**: Send messages to OpenRouter with tools enabled
4. **Tool Execution Loop**: Execute tool calls iteratively (max 5 iterations)
5. **Response Processing**: Capture products, functions, and final text response

**Tool Call Handling:**
- `searchProducts` → Captures products into `toolProducts`
- `triggerUIAction` → Captures as frontend RPC call
- `generateCoupon` → Auto-triggers `applyCoupon` RPC call
- `adjustPrice` → Captures price adjustment RPC call

---

## OpenRouter Client

### `openrouter-client.ts`

#### `sendOpenRouterChat(messages: Message[]): Promise<Response>`

Sends chat completion requests to OpenRouter API.

**Configuration:**
- **Model**: `nvidia/nemotron-3-nano-30b-a3b:free`
- **Tools**: All configured tools from `config.ts`
- **Tool Choice**: `auto`

**Error Handling:**
Extracts provider-specific error messages for better debugging.

---

## Tool Executor

### `tool-executor.ts`

#### `executeFunctions(functionName, functionArgs, userId?): Promise<Result>`

Executes AI-requested tool calls with comprehensive validation.

**Supported Functions:**

##### `searchProducts`
- Uses Upstash vector search for semantic similarity
- Falls back to local text search if vector search fails
- Returns formatted product results with relevance scores

##### `getProductDetails`
- Returns complete product info including:
  - Basic info (name, price, category)
  - Extended description
  - Reviews (rating, count, summary)
  - Key features, benefits, ingredients
  - Images and URLs

##### `checkAvailability`
- Returns stock status for a product

##### `applyDiscount`
- Validates discount percentage (max 20%)
- Enforces minimum price (70% of original)
- Returns calculated discounted price

##### `triggerUIAction`
- Validates action name and arguments
- Implements per-action validation rules
- Returns sanitized args for frontend execution

##### `generateCoupon`
- Requires authenticated user
- Generates unique code: `{PREFIX}-{DISCOUNT}-{RANDOM}`
- Stores coupon in database with 24-hour expiry
- Validates discount limits (max 20%, min 70% of price)

##### `adjustPrice`
- Increases price for negative behavior
- Caps increase at 10%

**Validation Helpers:**
- `requireString()` - Validates required string arguments
- `requireProductExists()` - Validates product ID exists
- `requireEnum()` - Validates enum values
- `validateUIActionArgs()` - Per-action argument validation

---

## Product Extractors

### `product-extractors.ts`

Extracts product information from AI text responses using multiple parsing strategies.

#### `extractProductsFromResponse(responseText): ChatbotProduct[]`

Main extraction function that tries strategies in order:
1. **Markdown Table** → `extractFromTable()`
2. **Heading + Lists** → `extractFromHeadingList()`
3. **Numbered List** → `extractFromNumberedList()`

#### `extractFromTable(responseText): ChatbotProduct[]`

Parses markdown tables like:
```markdown
| Product | Price | Rating |
|---------|-------|--------|
| Cream A | Rs. 500 | 4.5/5 |
```

#### `extractFromHeadingList(responseText): ChatbotProduct[]`

Parses heading-based product listings:
```markdown
### 1. Glow Face Wash
- **Price:** Rs. 899.00
- **Rating:** 4.5/5 (68 reviews)
```

#### `extractFromNumberedList(responseText): ChatbotProduct[]`

Parses simple numbered lists:
```
1. Product Name — Rs. 500 | ⭐ 4.5/5 (100 reviews)
```

#### Helper Functions

| Function           | Description                                |
|--------------------|--------------------------------------------|
| `extractUrl()`     | Extracts URLs from markdown/text           |
| `lookupProductUrl()`| Finds product URL by name from store data |

---

## Response Formatters

### `response-formatters.ts`

#### `cleanResponseForChat(text): string`

Cleans AI responses for display by removing:
- Markdown table rows
- Product heading lines (`### 1. Product Name`)
- Metadata bullet points (Price, Rating, Link)
- Angle-bracket URLs (`<https://...>`)
- Markdown links (keeps text, removes URL)
- Bare URLs
- Excessive blank lines (collapses 3+ to 2)

#### `buildFallbackClerkResponse(userMessage, relevantProducts): string`

Generates a fallback response when OpenRouter is unavailable:
- Shows top 3 products from RAG results
- Includes basic product info (name, price, rating, reviews)
- Offers to refine by budget, brand, skin type, or ingredients

---

## Utilities

### `utils.ts`

#### `repairIncompleteJson(input): string`

Repairs truncated JSON by:
- Tracking brace/bracket depth
- Closing unclosed strings
- Adding missing closing brackets/braces

#### `parseToolArguments(rawArguments): Record<string, unknown>`

Safely parses tool arguments:
- Handles object, string, or null inputs
- Attempts JSON parse with repair fallback
- Returns raw value wrapper if parsing fails completely

#### `extractProviderErrorMessage(error): string | null`

Extracts meaningful error messages from OpenRouter errors:
- Parses JSON-like error bodies
- Extracts provider name and message
- Falls back to standard Error message

#### `normalizeAssistantContent(content): string`

Normalizes OpenRouter message content:
- Handles string content directly
- Flattens array content (text parts)
- Returns empty string for invalid content

---

## Usage Examples

### Basic Chat Interaction

```typescript
import { chatWithClerk } from "./chat-handler";

const response = await chatWithClerk(
  "Show me the best face creams",
  [], // empty history
  "user-123" // optional userId for coupons
);

console.log(response.text);          // AI response
console.log(response.toolProducts);  // Products from search
console.log(response.functions);     // UI actions to execute
```

### Direct Product Search

```typescript
import { executeFunctions } from "./tool-executor";

const results = await executeFunctions("searchProducts", {
  query: "anti-aging serum",
  maxResults: 10
});

console.log(results.results); // Array of products
```

### Generate and Apply Coupon

```typescript
const couponResult = await executeFunctions("generateCoupon", {
  productId: "product-123",
  discountPercentage: 15,
  reason: "Birthday discount",
  sentiment: "positive",
  codePrefix: "BDAY"
}, "user-123");

// Result includes applyCoupon RPC call for frontend
console.log(couponResult.coupon.code); // "BDAY-15-ABCD"
```

---

## Error Handling

All endpoints and functions implement consistent error handling:

```typescript
{
  success: false,
  error: "Error message description"
}
```

HTTP status codes:
- `400` - Bad request / validation error
- `401` - Authentication required
- `403` - Forbidden (e.g., coupon belongs to another user)
- `404` - Resource not found
- `500` - Server error

---

## Dependencies

| Package           | Usage                                     |
|-------------------|-------------------------------------------|
| `hono`            | HTTP framework                            |
| `@hono/zod-validator` | Request validation                    |
| `zod`             | Schema validation                         |
| `@openrouter/sdk` | OpenRouter API client                     |
| `@upstash/vector` | Vector database for semantic search       |
| `prisma`          | Database ORM (coupons)                    |
