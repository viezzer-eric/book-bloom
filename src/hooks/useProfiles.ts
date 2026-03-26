import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileRepository } from '@/repositories/profileRepository';

export const useProfile = (id: string | undefined | null) => {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: () => profileRepository.getProfileById(id as string),
    enabled: !!id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => profileRepository.updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profiles', variables.id] });
    },
  });
};
