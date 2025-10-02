import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./dashboard/app-sidebar";
import { HeaderWithToggle } from "@/components/header-with-toggle";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider defaultOpen={false}>
      {/* Enhanced Ambient Background Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl floating" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-pink-500/15 via-blue-500/8 to-transparent rounded-full blur-3xl floating-delayed" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-500/12 via-pink-500/6 to-transparent rounded-full blur-3xl floating" />
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 rounded-full blur-2xl floating-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/8 to-purple-500/4 rounded-full blur-xl floating-slow-delayed" />
        
        {/* Enhanced Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'grid-move 20s linear infinite'
        }} />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />
      </div>

      <AppSidebar />
      
      <SidebarInset>
        {/* Top Navigation Header with Toggle */}
        <HeaderWithToggle />

        {/* Main Content Area */}
        <div className="p-4 pt-4 w-full">
          <div className="glass-card rounded-3xl border-0 min-h-[calc(100vh-8rem)] overflow-hidden w-full">
            {/* Content Wrapper with Enhanced Padding */}
            <div className="relative">
              {/* Inner Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              
              <div className="relative p-8 w-full">
                <React.Suspense 
                  fallback={
                    <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                          <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="shimmer-loading h-4 w-32 rounded bg-muted/50" />
                          <p className="text-sm text-muted-foreground font-medium">Initializing workspace...</p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  {children}
                </React.Suspense>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;