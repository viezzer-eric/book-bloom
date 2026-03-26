import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRepository } from '@/repositories/serviceRepository';

export const useServicesByProvider = (providerId: string | undefined | null) => {
  return useQuery({
    queryKey: ['services', providerId],
    queryFn: () => serviceRepository.getServicesByProviderId(providerId as string),
    enabled: !!providerId,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => serviceRepository.createService(data),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['services', variables.provider_id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => serviceRepository.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceRepository.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
