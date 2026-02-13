# Chat Provider Usage Guide

## Overview

The Chat Provider wraps your entire application and provides comprehensive hooks to control product filtering, sorting, and chat state from anywhere in your application.

## Architecture

```
App Layout
  └── Providers
        └── QueryProvider
              └── ChatProvider  ← Wraps entire app
                    └── Your Components
```

## Available Hooks

### 1. `useChatContext()` - Access All Chat Features

Use this hook to access the complete chat context:

```tsx
import { useChatContext } from "@/components/providers/chat-provider";

function MyComponent() {
  const {
    // Chat state
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
    
    // Messages
    messages,
    addMessage,
    setMessages,
    clearMessages,
    
    // Filters
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    
    // Helper methods
    setCategory,
    setPriceRange,
    setSearch,
    setSortBy,
    setTags,
  } = useChatContext();
  
  // Your component logic
}
```

### 2. `useProductFilters()` - Access Product Filters Only

Use this if you only need to work with product filters:

```tsx
import { useProductFilters } from "@/components/providers/chat-provider";

function FilterPanel() {
  const { filters, updateFilters, clearFilters } = useProductFilters();
  
  return (
    <div>
      <button onClick={() => updateFilters({ category: "skincare" })}>
        Show Skincare
      </button>
      <button onClick={() => updateFilters({ sortBy: "price-asc" })}>
        Sort by Price
      </button>
      <button onClick={clearFilters}>
        Clear All Filters
      </button>
    </div>
  );
}
```

### 3. `useChatState()` - Access Chat Open/Close State

Use this if you only need to control the chat open/close state:

```tsx
import { useChatState } from "@/components/providers/chat-provider";

function CustomChatButton() {
  const { isChatOpen, openChat, closeChat, toggleChat } = useChatState();
  
  return (
    <button onClick={toggleChat}>
      {isChatOpen ? "Close Chat" : "Open Chat"}
    </button>
  );
}
```

### 4. `useChatMessages()` - Access Messages Only

Use this if you only need to work with chat messages:

```tsx
import { useChatMessages } from "@/components/providers/chat-provider";

function MessageList() {
  const { messages, addMessage, clearMessages } = useChatMessages();
  
  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Filter Types

The `ProductFilters` interface supports:

```typescript
interface ProductFilters {
  category?: string;           // e.g., "skincare", "haircare"
  minPrice?: number;           // Minimum price filter
  maxPrice?: number;           // Maximum price filter
  search?: string;             // Search query
  sortBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";
  tags?: string[];             // Product tags for filtering
}
```

## Common Use Cases

### Example 1: Update Filters from Chat Response

```tsx
import { useChatContext } from "@/components/providers/chat-provider";

function ChatHandler() {
  const { updateFilters, addMessage } = useChatContext();
  
  const handleUserQuery = async (query: string) => {
    // Parse user intent from query
    if (query.includes("under $50")) {
      updateFilters({ maxPrice: 50 });
      addMessage({
        role: "assistant",
        content: "I've filtered products under $50 for you!"
      });
    }
    
    if (query.includes("skincare")) {
      updateFilters({ category: "skincare" });
    }
  };
  
  return <div>...</div>;
}
```

### Example 2: Create a Filter Control Panel

```tsx
import { useProductFilters } from "@/components/providers/chat-provider";

function FilterPanel() {
  const { filters, updateFilters, clearFilters } = useProductFilters();
  
  return (
    <div className="p-4 space-y-4">
      {/* Category Filter */}
      <select
        value={filters.category || ""}
        onChange={(e) => updateFilters({ category: e.target.value || undefined })}
      >
        <option value="">All Categories</option>
        <option value="skincare">Skincare</option>
        <option value="haircare">Haircare</option>
      </select>
      
      {/* Sort By */}
      <select
        value={filters.sortBy || ""}
        onChange={(e) => updateFilters({ 
          sortBy: e.target.value as any || undefined 
        })}
      >
        <option value="">Default Sort</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A-Z</option>
        <option value="newest">Newest First</option>
      </select>
      
      {/* Price Range */}
      <div>
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ""}
          onChange={(e) => updateFilters({ 
            minPrice: e.target.value ? Number(e.target.value) : undefined 
          })}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ""}
          onChange={(e) => updateFilters({ 
            maxPrice: e.target.value ? Number(e.target.value) : undefined 
          })}
        />
      </div>
      
      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={filters.search || ""}
        onChange={(e) => updateFilters({ search: e.target.value || undefined })}
      />
      
      {/* Clear All */}
      <button onClick={clearFilters}>
        Clear All Filters
      </button>
    </div>
  );
}
```

### Example 3: Use Helper Methods

The provider includes convenient helper methods for common operations:

```tsx
import { useChatContext } from "@/components/providers/chat-provider";

function QuickFilters() {
  const { 
    setCategory, 
    setPriceRange, 
    setSearch, 
    setSortBy,
    setTags 
  } = useChatContext();
  
  return (
    <div>
      <button onClick={() => setCategory("skincare")}>
        Skincare
      </button>
      <button onClick={() => setPriceRange(0, 50)}>
        Under $50
      </button>
      <button onClick={() => setSortBy("price-asc")}>
        Cheapest First
      </button>
      <button onClick={() => setTags(["organic", "vegan"])}>
        Organic & Vegan
      </button>
    </div>
  );
}
```

### Example 4: AI Chat Integration

Here's how to integrate with your AI chat to update filters based on user queries:

```tsx
import { useChatContext } from "@/components/providers/chat-provider";

function AIChat() {
  const { 
    messages, 
    addMessage, 
    updateFilters, 
    openChat 
  } = useChatContext();
  
  const handleAIResponse = (response: string, intent: any) => {
    // Add AI message
    addMessage({ role: "assistant", content: response });
    
    // Update filters based on AI's understanding
    if (intent.category) {
      updateFilters({ category: intent.category });
    }
    if (intent.priceRange) {
      updateFilters({ 
        minPrice: intent.priceRange.min, 
        maxPrice: intent.priceRange.max 
      });
    }
    if (intent.sortPreference) {
      updateFilters({ sortBy: intent.sortPreference });
    }
  };
  
  return <div>...</div>;
}
```

### Example 5: Programmatically Open Chat with Filters

```tsx
import { useChatContext } from "@/components/providers/chat-provider";

function ProductCard({ product }) {
  const { openChat, updateFilters, addMessage } = useChatContext();
  
  const handleAskAboutProduct = () => {
    // Set filters to show similar products
    updateFilters({ category: product.category });
    
    // Add a message
    addMessage({
      role: "user",
      content: `Tell me more about ${product.name}`
    });
    
    // Open chat
    openChat();
  };
  
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAskAboutProduct}>
        Ask AI about this product
      </button>
    </div>
  );
}
```

## Integration with React Query

The Products component automatically uses filters from the context:

```tsx
// In Products component
import { useProductFilters } from "@/components/providers/chat-provider";
import { useProducts } from "@/services/queries/products";

function Products() {
  const { filters } = useProductFilters();
  const { data, isLoading } = useProducts(filters); // Automatically uses context filters!
  
  // Products will re-fetch when filters change
}
```

## Best Practices

1. **Use specific hooks** when you don't need the entire context (better performance)
2. **Update filters in batches** using `updateFilters({ multiple: "values" })`
3. **Clear filters** when navigating away or resetting state
4. **Use helper methods** like `setCategory()` for cleaner code
5. **Access filters reactively** - components will re-render when filters change

## Example: Complete Chat-Driven Shopping Experience

```tsx
import { useChatContext } from "@/components/providers/chat-provider";

function IntelligentShoppingAssistant() {
  const context = useChatContext();
  
  const processQuery = async (userMessage: string) => {
    // Add user message
    context.addMessage({ role: "user", content: userMessage });
    
    // Simulate AI processing
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: userMessage })
    });
    
    const { reply, filters, products } = await response.json();
    
    // Update filters based on AI understanding
    if (filters) {
      context.updateFilters(filters);
    }
    
    // Add AI response with products
    context.addMessage({
      role: "assistant",
      content: reply,
      products: products
    });
  };
  
  return (
    <div>
      <ChatInterface onMessage={processQuery} />
      <ProductGrid /> {/* Automatically filtered! */}
    </div>
  );
}
```

## Notes

- All filter updates trigger automatic re-fetching of products via React Query
- The chat state persists across page navigation (within the same session)
- Messages are stored in the context and survive chat open/close
- Use `clearMessages()` to reset the chat history
- Use `clearFilters()` to reset all product filters
