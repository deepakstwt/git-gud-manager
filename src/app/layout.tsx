import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "GitAid - AI-Powered Git Management",
  description: "Intelligent GitHub repository manager with AI-powered commit analysis and semantic search capabilities",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={geist.variable} suppressHydrationWarning>
        <body className={cn(
            geist.className,
            "antialiased min-h-screen bg-black text-[#E0E0E0]"
          )} suppressHydrationWarning>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}