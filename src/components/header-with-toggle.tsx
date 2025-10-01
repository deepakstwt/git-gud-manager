'use client';

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

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
              
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Git Gud Manager
              </h1>
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
