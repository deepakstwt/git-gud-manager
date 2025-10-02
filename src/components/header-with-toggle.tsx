'use client';

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import dynamic from "next/dynamic";

// Dynamically import UserButton to prevent hydration issues
const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.UserButton })),
  {
    ssr: false,
    loading: () => (
      <div className="w-10 h-10 rounded-xl border-2 border-primary/20 bg-muted animate-pulse" />
    ),
  }
);

export function HeaderWithToggle() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="m-4 mb-0">
        <div className="glass-card rounded-2xl px-6 py-4 border-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSidebar}
                className="h-9 w-9 p-0 rounded-lg border-border/40 hover:bg-primary/10"
              >
                {open ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent gradient-shift drop-shadow-sm">
                  GitAid
                </h1>
                <p className="text-sm font-semibold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-md">
                  AI-Powered Git Management
                </p>
              </div>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-glow-secondary" />
                <span className="text-xs font-medium text-emerald-400">Live</span>
              </div>
              
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "size-10 rounded-xl border-2 border-primary/20 shadow-lg transition-all duration-200",
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
