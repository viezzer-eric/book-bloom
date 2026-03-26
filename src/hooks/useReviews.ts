import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewRepository } from '@/repositories/reviewRepository';

export const useReviewsByProvider = (providerId: string | undefined | null) => {
  return useQuery({
    queryKey: ['reviews', 'provider', providerId],
    queryFn: () => reviewRepository.getReviewsByProviderId(providerId as string),
    enabled: !!providerId,
  });
};

export const useReviewsByClient = (clientId: string | undefined | null) => {
  return useQuery({
    queryKey: ['reviews', 'client', clientId],
    queryFn: () => reviewRepository.getReviewsByClientId(clientId as string),
    enabled: !!clientId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => reviewRepository.createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'provider', variables.provider_id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'client', variables.client_id] });
    },
  });
};
