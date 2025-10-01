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
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl floating" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent rounded-full blur-3xl floating-delayed" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-full blur-3xl floating" />
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
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