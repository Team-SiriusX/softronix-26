import React from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "../ui/sonner";
import { CartProvider } from "@/hooks/use-cart-store";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <CartProvider>
        <Toaster richColors />
        {children}
      </CartProvider>
    </QueryProvider>
  );
}

