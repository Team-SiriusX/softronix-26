"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/constants/store";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "rating-desc" | "rating-asc" | "reviews-desc";
  tags?: string[];
}

export interface AppliedCoupon {
  couponCode: string;
  productId: string;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  formattedOriginalPrice: string;
  formattedDiscountedPrice: string;
}

export interface AdjustedPrice {
  productId: string;
  adjustedPrice: number;
  formattedPrice: string;
  increasePercentage: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

interface ChatContextType {
  // Chat state
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearMessages: () => void;

  // Product filters
  filters: ProductFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>;
  updateFilters: (partialFilters: Partial<ProductFilters>) => void;
  clearFilters: () => void;

  // Coupons & price adjustments
  appliedCoupons: AppliedCoupon[];
  addCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: (productId: string) => void;
  getCouponForProduct: (productId: string) => AppliedCoupon | undefined;
  adjustedPrices: AdjustedPrice[];
  addAdjustedPrice: (adjustment: AdjustedPrice) => void;
  getAdjustedPrice: (productId: string) => AdjustedPrice | undefined;
  couponDiscount: number;

  // Helper methods
  setCategory: (category?: string) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setSearch: (search?: string) => void;
  setSortBy: (sortBy?: ProductFilters["sortBy"]) => void;
  setTags: (tags?: string[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessage: Message = {
  role: "assistant",
  content:
    "Welcome to Echo! I'm your personal grooming assistant. How can I help you today?",
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [adjustedPrices, setAdjustedPrices] = useState<AdjustedPrice[]>([]);

  // Chat controls
  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);

  // Message controls
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([initialMessage]);
  }, []);

  // Filter controls
  const updateFilters = useCallback(
    (partialFilters: Partial<ProductFilters>) => {
      setFilters((prev) => ({ ...prev, ...partialFilters }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Coupon controls
  const addCoupon = useCallback((coupon: AppliedCoupon) => {
    setAppliedCoupons((prev) => {
      // Replace if same product already has a coupon
      const filtered = prev.filter((c) => c.productId !== coupon.productId);
      return [...filtered, coupon];
    });
  }, []);

  const removeCoupon = useCallback((productId: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const getCouponForProduct = useCallback(
    (productId: string) => appliedCoupons.find((c) => c.productId === productId),
    [appliedCoupons],
  );

  // Total coupon discount
  const couponDiscount = appliedCoupons.reduce(
    (sum, c) => sum + (c.originalPrice - c.discountedPrice),
    0,
  );

  // Price adjustment controls (rude user penalty)
  const addAdjustedPrice = useCallback((adjustment: AdjustedPrice) => {
    setAdjustedPrices((prev) => {
      const filtered = prev.filter((a) => a.productId !== adjustment.productId);
      return [...filtered, adjustment];
    });
  }, []);

  const getAdjustedPrice = useCallback(
    (productId: string) => adjustedPrices.find((a) => a.productId === productId),
    [adjustedPrices],
  );

  // Convenience setters
  const setCategory = useCallback(
    (category?: string) => updateFilters({ category }),
    [updateFilters],
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      updateFilters({ minPrice: min, maxPrice: max });
    },
    [updateFilters],
  );

  const setSearch = useCallback(
    (search?: string) => updateFilters({ search }),
    [updateFilters],
  );

  const setSortBy = useCallback(
    (sortBy?: ProductFilters["sortBy"]) => updateFilters({ sortBy }),
    [updateFilters],
  );

  const setTags = useCallback(
    (tags?: string[]) => updateFilters({ tags }),
    [updateFilters],
  );

  const value: ChatContextType = {
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

    // Coupons & price adjustments
    appliedCoupons,
    addCoupon,
    removeCoupon,
    getCouponForProduct,
    adjustedPrices,
    addAdjustedPrice,
    getAdjustedPrice,
    couponDiscount,

    // Helper methods
    setCategory,
    setPriceRange,
    setSearch,
    setSortBy,
    setTags,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to access the chat context from any component
 * @throws Error if used outside ChatProvider
 */
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}

/**
 * Hook to access just the product filters
 */
export function useProductFilters() {
  const { filters, updateFilters, clearFilters } = useChatContext();
  return { filters, updateFilters, clearFilters };
}

/**
 * Hook to access just the chat state
 */
export function useChatState() {
  const { isChatOpen, openChat, closeChat, toggleChat } = useChatContext();
  return { isChatOpen, openChat, closeChat, toggleChat };
}

/**
 * Hook to access just the messages
 */
export function useChatMessages() {
  const { messages, addMessage, setMessages, clearMessages } = useChatContext();
  return { messages, addMessage, setMessages, clearMessages };
}
