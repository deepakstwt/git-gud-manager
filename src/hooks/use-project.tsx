import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { user } = useUser();
  const { data: projects, refetch: refetchProjects } = api.project.getProjects.useQuery(
    undefined,
    {
      enabled: !!user, // Only run the query when user is authenticated
    }
  );
  const [projectId, setProjectId] = useLocalStorage('dionysus-projectId', '');
  const project = projects?.find(project => project.id === projectId);
  
  return {
    projects,
    project,
    projectId,
    setProjectId,
    refetchProjects,
  };
};

export default useProject;