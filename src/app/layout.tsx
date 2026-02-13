import { ourFileRouter } from "@/app/api/uploadthing/core";
import Providers from "@/components/providers";
import FloatingChatButton from "@/components/chat/floating-chat-button";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Echo - AI Shopping Assistant",
  description: "Your intelligent grooming companion powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/cwg6wqv.css" />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
        suppressHydrationWarning
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Providers>
          {children}
          <FloatingChatButton />
        </Providers>
      </body>
    </html>
  );
}
