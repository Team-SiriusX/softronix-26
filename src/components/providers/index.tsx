import React from "react";
import { QueryProvider } from "./query-provider";
import { ChatProvider } from "./chat-provider";
import { Toaster } from "../ui/sonner";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <ChatProvider>
        <Toaster richColors />
        {children}
      </ChatProvider>
    </QueryProvider>
  );
}
