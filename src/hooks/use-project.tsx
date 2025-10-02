import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { user, isLoaded } = useUser();
  const { data: projects, refetch: refetchProjects, isLoading, error } = api.project.getProjects.useQuery(
    undefined,
    {
      enabled: !!user && isLoaded, // Only run the query when user is authenticated and loaded
    }
  );
  const [projectId, setProjectId] = useLocalStorage('dionysus-projectId', '');
  const project = projects?.find(project => project.id === projectId);
  
  // Debug logging
  console.log("useProject hook state:", {
    user: user ? "authenticated" : "not authenticated",
    isLoaded,
    projects: projects?.length || 0,
    isLoading,
    error: error?.message,
    projectId,
    project: project?.name || "none selected"
  });
  
  return {
    projects,
    project,
    projectId,
    setProjectId,
    refetchProjects,
    isLoading,
    error,
  };
};

export default useProject;