/**
 * Product Filter Panel - Landing Page Style
 * Beige aesthetic matching the main landing page
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
import { X } from "lucide-react";

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
    <div className="sticky top-6 space-y-6 border border-[#1c1c1c]/10 bg-[#f7f4f0] p-6">
      {/* Header */}
      <div className="border-b border-[#1c1c1c]/10 pb-4">
        <h3 className="font-gloock text-2xl tracking-tight text-[#1c1c1c]">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-2 text-xs font-medium uppercase tracking-widest text-[#5c5c5c] transition-colors hover:text-[#1c1c1c]"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-xs font-medium uppercase tracking-widest text-[#1c1c1c]">
          Search
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search products..."
          value={filters.search || ""}
          onChange={(e) => setSearch(e.target.value || undefined)}
          className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c] placeholder:text-[#5c5c5c]/50 focus:border-[#1c1c1c]"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-xs font-medium uppercase tracking-widest text-[#1c1c1c]">
          Category
        </Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            setCategory(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger id="category" className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="border-[#1c1c1c]/20 bg-[#f2efe9]">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Face">Face</SelectItem>
            <SelectItem value="Hair">Hair Care</SelectItem>
            <SelectItem value="Beard">Beard</SelectItem>
            <SelectItem value="Bundles">Bundles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-widest text-[#1c1c1c]">
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
            className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c] placeholder:text-[#5c5c5c]/50"
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
            className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c] placeholder:text-[#5c5c5c]/50"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label htmlFor="sortBy" className="text-xs font-medium uppercase tracking-widest text-[#1c1c1c]">
          Sort By
        </Label>
        <Select
          value={filters.sortBy || "default"}
          onValueChange={(value) => {
            type SortByType = "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";
            setSortBy(value === "default" ? undefined : (value as SortByType));
          }}
        >
          <SelectTrigger id="sortBy" className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c]">
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent className="border-[#1c1c1c]/20 bg-[#f2efe9]">
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2 border-t border-[#1c1c1c]/10 pt-4">
          <Label className="text-xs font-medium uppercase tracking-widest text-[#1c1c1c]">
            Active
          </Label>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <button
                onClick={() => setCategory(undefined)}
                className="flex items-center gap-1 border border-[#1c1c1c]/20 bg-[#1c1c1c] px-2 py-1 text-xs text-[#f2efe9] transition-opacity hover:opacity-80"
              >
                {filters.category}
                <X className="h-3 w-3" />
              </button>
            )}
            {filters.search && (
              <button
                onClick={() => setSearch(undefined)}
                className="flex items-center gap-1 border border-[#1c1c1c]/20 bg-[#1c1c1c] px-2 py-1 text-xs text-[#f2efe9] transition-opacity hover:opacity-80"
              >
                {filters.search}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
