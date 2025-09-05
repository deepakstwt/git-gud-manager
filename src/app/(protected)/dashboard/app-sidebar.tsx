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
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Sidebar collapsible="icon" variant="floating">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            V
          </div>
          {open && <span className="text-lg font-bold">VrindaHelp</span>}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Application
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                  return(
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                              <Link href={item.url} className={cn({
                                  "!text-white": pathname === item.url
                        })} style={pathname === item.url ? {backgroundColor: 'hsl(349.7, 89.2%, 60.2%)'} : {}}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Your Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects === undefined ? (
                // Loading state
                <div className="flex items-center justify-center py-4">
                  <div className="text-xs text-muted-foreground">Loading projects...</div>
                </div>
              ) : projects.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center py-4 text-center">
                  <div className="text-xs text-muted-foreground mb-2">No projects yet</div>
                  {open && (
                    <Link href="/create">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Plus className="w-3 h-3 mr-1"/>
                        Create your first project
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                // Projects list
                projects.map((project: any) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton 
                      className={cn(
                        "flex items-center gap-3 cursor-pointer transition-all duration-200",
                        isMounted && project.id === projectId 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => setProjectId(project.id)}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-medium",
                        isMounted && project.id === projectId
                          ? "bg-primary-foreground text-primary"
                          : "bg-primary text-white"
                      )}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
              
              {projects && projects.length > 0 && <div className="h-2"></div>}

              {/* Create Project Button - only show if we have projects or sidebar is open */}
              {open && projects && projects.length > 0 && (
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button variant="outline" className="w-fit">
                      <Plus className="w-4 h-4 mr-2"/>
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>    
  );
}