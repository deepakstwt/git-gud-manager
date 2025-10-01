'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Bot,
  Presentation,
  CreditCard,
  Plus,
  Menu,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import { useState, useEffect } from "react";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen, toggleSidebar } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // If there's only one project, select it automatically
    if (projects?.length === 1 && !projectId && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId, setProjectId]);

  // Handle project selection
  const handleProjectClick = (id: string) => {
    setProjectId(id);
    if (pathname.startsWith('/meetings')) {
      router.push(`/meetings/${id}`);
    }
  };

  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar" 
      className="!border-0"
    >
      <div className={cn(
        "h-full glass-card !rounded-2xl !border-0 overflow-hidden transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16"
      )}>
        {/* Ambient Sidebar Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-card via-card/80 to-card/60" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        
        {/* Header */}
        <SidebarHeader className={cn(
          "relative z-10 transition-all duration-300 ease-in-out",
          open ? "p-6" : "p-4"
        )}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "neo-card !rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300",
                  open ? "w-10 h-10" : "w-8 h-8"
                )}>
                  <span className={cn(
                    "relative z-10 text-white font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent transition-all duration-300",
                    open ? "text-lg" : "text-sm"
                  )}>
                    V
                  </span>
                </div>
                {/* Floating particles around logo - only show when expanded */}
                {open && (
                  <>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full floating" />
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-secondary/40 rounded-full floating-delayed" />
                  </>
                )}
              </div>
              
              {/* Text only shows when expanded */}
              {open && (
                <div className="space-y-1 transition-all duration-300">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent whitespace-nowrap">
                    VrindaHelp
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    Next-Gen Dashboard
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="relative z-10">
          <SidebarGroup>
            {/* Group label only shows when expanded */}
            {open && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/80 font-semibold px-6 mb-2 transition-all duration-300">
                Application
              </SidebarGroupLabel>
            )}

            <SidebarGroupContent className={cn(
              "transition-all duration-300",
              open ? "px-3" : "px-2"
            )}>
              <SidebarMenu className="space-y-2">
                {items.map(item => {
                  const isActive = pathname === item.url;
                  return(
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          href={item.url} 
                          className={cn(
                            "relative group rounded-xl transition-all duration-300 overflow-hidden flex items-center",
                            open ? "px-3 py-2 justify-start" : "px-2 py-2 justify-center",
                            isActive 
                              ? "neo-card !bg-gradient-to-r !from-primary !to-secondary text-white shadow-lg" 
                              : ""
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && open && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-primary to-secondary rounded-r-full" />
                          )}
                          
                          {/* Icon with enhanced styling */}
                          <div className={cn(
                            "relative transition-all duration-300 flex-shrink-0",
                            isActive 
                              ? "text-white transform scale-110" 
                              : "text-muted-foreground",
                            open ? "" : "mx-auto"
                          )}>
                            <item.icon className="w-5 h-5" />
                            {isActive && (
                              <div className="absolute inset-0 bg-white/20 rounded blur-sm scale-150" />
                            )}
                          </div>
                          
                          {/* Text only shows when expanded */}
                          {open && (
                            <span className={cn(
                              "font-medium transition-all duration-300 ml-3 whitespace-nowrap",
                              isActive 
                                ? "text-white font-semibold" 
                                : ""
                            )}>
                              {item.title}
                            </span>
                          )}
                          
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Projects Section */}
          <SidebarGroup className="mt-6">
            {/* Group label only shows when expanded */}
            {open && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/80 font-semibold px-6 mb-2 transition-all duration-300">
                Your Projects
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent className={cn(
              "transition-all duration-300",
              open ? "px-3" : "px-2"
            )}>
              <SidebarMenu className="space-y-2">
                {projects === undefined ? (
                  // Enhanced Loading state
                  <div className={cn(
                    "flex flex-col items-center space-y-3",
                    open ? "py-6" : "py-3"
                  )}>
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    </div>
                    {open && (
                      <div className="shimmer-loading h-3 w-24 rounded bg-muted/30" />
                    )}
                  </div>
                ) : projects.length === 0 ? (
                  // Enhanced Empty state
                  <div className={cn(
                    "flex flex-col items-center text-center space-y-4",
                    open ? "py-6" : "py-3"
                  )}>
                    <div className="relative">
                      <div className={cn(
                        "neo-card rounded-2xl flex items-center justify-center transition-all duration-300",
                        open ? "w-12 h-12" : "w-8 h-8"
                      )}>
                        <Plus className={cn(
                          "text-primary transition-all duration-300",
                          open ? "w-6 h-6" : "w-4 h-4"
                        )} />
                      </div>
                      {open && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent/40 rounded-full floating" />
                      )}
                    </div>
                    {open && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">No projects yet</p>
                        <Link href="/create">
                          <Button className="magnetic-button text-xs h-8 px-3 bg-gradient-to-r from-primary to-secondary border-0">
                            <Plus className="w-3 h-3 mr-1"/>
                            Create your first project
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  // Enhanced Projects list
                  projects.map((project: any) => {
                    const isSelected = isMounted && project.id === projectId;
                    return (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton 
                          className={cn(
                            "relative group rounded-xl transition-all duration-300 overflow-hidden cursor-pointer flex items-center",
                            open ? "px-3 py-2 justify-start" : "px-2 py-2 justify-center",
                            isSelected 
                              ? "neo-card !bg-gradient-to-r !from-accent !to-primary text-white shadow-lg" 
                              : ""
                          )}
                          onClick={() => setProjectId(project.id)}
                        >
                          {/* Selected indicator */}
                          {isSelected && open && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-accent to-primary rounded-l-full" />
                          )}
                          
                          {/* Project Avatar */}
                          <div className={cn(
                            "relative transition-all duration-300 flex-shrink-0",
                            isSelected 
                              ? "transform scale-110" 
                              : "",
                            open ? "" : "mx-auto"
                          )}>
                            <div className={cn(
                              "rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                              open ? "w-8 h-8" : "w-6 h-6",
                              isSelected
                                ? "bg-white/20 text-white shadow-lg"
                                : "bg-gradient-to-br from-primary to-secondary text-white"
                            )}>
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm scale-150" />
                            )}
                          </div>
                          
                          {/* Project Name - only shows when expanded */}
                          {open && (
                            <span className={cn(
                              "text-sm font-medium transition-all duration-300 flex-1 truncate ml-3 whitespace-nowrap",
                              isSelected 
                                ? "text-white font-semibold" 
                                : ""
                            )}>
                              {project.name}
                            </span>
                          )}
                          
                          {/* Active project pulse - only shows when expanded */}
                          {isSelected && open && (
                            <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-glow-secondary" />
                          )}
                          
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })
                )}
                
                {/* Create Project Button - only shows when expanded */}
                {open && (
                  <>
                    <div className="h-4" />
                    <SidebarMenuItem>
                      <Link href="/create" className="block">
                        <Button className="w-full magnetic-button justify-start text-sm h-10 bg-gradient-to-r from-muted to-muted/80 border border-border/40 text-muted-foreground transition-all duration-300">
                          <Plus className="w-4 h-4 mr-2"/>
                          Create Project
                        </Button>
                      </Link>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </div>
    </Sidebar>
  );
}

export default AppSidebar;