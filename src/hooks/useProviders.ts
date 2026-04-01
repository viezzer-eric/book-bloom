import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerRepository } from '@/repositories/providerRepository';

export const useProviders = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: () => providerRepository.getAllProviders(),
  });
};

export const useProviderById = (id: string | undefined | null) => {
  return useQuery({
    queryKey: ['providers', 'id', id],
    queryFn: () => providerRepository.getProviderById(id as string),
    enabled: !!id,
  });
};

export const useProviderByUserId = (userId: string | undefined | null, userRole?: string | null) => {
  return useQuery({
    queryKey: ['providers', 'userId', userId],
    queryFn: () => providerRepository.getProviderByUserId(userId as string),
    enabled: !!userId && userRole === 'provider',
    retry: false,
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => providerRepository.updateProviderProfile(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['providers', 'userId', variables.userId] });
    },
  });
};

export const useUpsertProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => providerRepository.upsertProviderProfile(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['providers', 'userId', variables.user_id] });
    },
  });
};
export const useProviderPlan = (userId: string | undefined | null) => {
  return useQuery({
    queryKey: ['providerPlan', userId],
    queryFn: () => providerRepository.getProviderPlan(userId as string),
    enabled: !!userId,
  });
};
