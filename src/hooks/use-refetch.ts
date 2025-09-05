import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

const useRefetch = () => {
  const queryClient = useQueryClient();
  
  const refetchAll = async () => {
    await queryClient.refetchQueries({
      type: 'active'
    });
  };

  const refetchProjects = async () => {
    await queryClient.invalidateQueries({
      queryKey: [['project', 'getProjects']]
    });
  };

  const refetchSpecific = async (queryKey: string[]) => {
    await queryClient.invalidateQueries({
      queryKey: [queryKey]
    });
  };

  return {
    refetchAll,
    refetchProjects,
    refetchSpecific,
    // Default export for backward compatibility
    refetch: refetchAll
  };
};

export default useRefetch;
