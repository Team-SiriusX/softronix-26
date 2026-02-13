/**
 * Example Filter Panel Component
 * 
 * This demonstrates how to use the ChatProvider hooks to create
 * an interactive filter panel that updates products in real-time.
 * 
 * You can place this component anywhere in your app (e.g., in a sidebar)
 * and it will control the product filtering globally.
 */

"use client";

import { useChatContext } from "@/components/providers/chat-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search, DollarSign, ArrowUpDown } from "lucide-react";

export function ProductFilterPanel() {
  const {
    filters,
    clearFilters,
    setCategory,
    setPriceRange,
    setSearch,
    setSortBy,
  } = useChatContext();

  const hasActiveFilters =
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search ||
    filters.sortBy;

  return (
    <div className="w-full max-w-sm p-6 space-y-6 bg-card rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setCategory(undefined)}
              />
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSearch(undefined)}
              />
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              ${filters.minPrice || 0} - ${filters.maxPrice || "∞"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setPriceRange(undefined, undefined)}
              />
            </Badge>
          )}
          {filters.sortBy && (
            <Badge variant="secondary" className="gap-1">
              Sort: {filters.sortBy}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSortBy(undefined)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          Search
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search products..."
          value={filters.search || ""}
          onChange={(e) => setSearch(e.target.value || undefined)}
          className="w-full"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            setCategory(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="skincare">Skincare</SelectItem>
            <SelectItem value="haircare">Haircare</SelectItem>
            <SelectItem value="bodycare">Body Care</SelectItem>
            <SelectItem value="shaving">Shaving</SelectItem>
            <SelectItem value="fragrance">Fragrance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Price Range
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setPriceRange(value, filters.maxPrice);
            }}
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setPriceRange(filters.minPrice, value);
            }}
            min={0}
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label htmlFor="sortBy" className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          Sort By
        </Label>
        <Select
          value={filters.sortBy || "default"}
          onValueChange={(value) => {
            type SortByType = "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";
            setSortBy(value === "default" ? undefined : (value as SortByType));
          }}
        >
          <SelectTrigger id="sortBy">
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filter Buttons */}
      <div className="space-y-2">
        <Label>Quick Filters</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange(0, 25)}
            className="text-xs"
          >
            Under $25
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange(0, 50)}
            className="text-xs"
          >
            Under $50
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategory("skincare");
              setSortBy("price-asc");
            }}
            className="text-xs"
          >
            Skincare Deals
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy("newest")}
            className="text-xs"
          >
            New Arrivals
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Example usage in a page component:
 * 
 * import { ProductFilterPanel } from "@/components/product/product-filter-panel";
 * import { Products } from "@/components/product/products";
 * 
 * export default function ProductsPage() {
 *   return (
 *     <div className="flex gap-6">
 *       <aside className="w-80">
 *         <ProductFilterPanel />
 *       </aside>
 *       <main className="flex-1">
 *         <Products />
 *       </main>
 *     </div>
 *   );
 * }
 */
