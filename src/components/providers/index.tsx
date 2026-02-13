import React from "react";
import { QueryProvider } from "./query-provider";
import { ChatProvider } from "./chat-provider";
import { Toaster } from "../ui/sonner";
import { CartProvider } from "@/hooks/use-cart-store";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
<<<<<<< HEAD
      <CartProvider>
        <Toaster richColors />
        {children}
      </CartProvider>
=======
      <ChatProvider>
        <Toaster richColors />
        {children}
      </ChatProvider>
>>>>>>> d2bca92b9ed5287aff10a83178020c8897e78bef
    </QueryProvider>
  );
}

