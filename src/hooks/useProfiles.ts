import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileRepository } from "@/repositories/profileRepository";

export const useProfile = (user_id: string | undefined | null) => {
  return useQuery({
    queryKey: ["profiles", user_id],
    queryFn: () => profileRepository.getProfileById(user_id as string),
    enabled: !!user_id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      profileRepository.updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profiles", variables.id] });
    },
  });
};
