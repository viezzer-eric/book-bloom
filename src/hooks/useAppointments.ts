import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentRepository } from '@/repositories/appointmentRepository';

export const useAppointmentsByProvider = (providerId: string | undefined | null) => {
  return useQuery({
    queryKey: ['appointments', 'provider', providerId],
    queryFn: () => appointmentRepository.getAppointmentsByProviderId(providerId as string),
    enabled: !!providerId,
  });
};

export const useAppointmentsByClient = (clientId: string | undefined | null) => {
  return useQuery({
    queryKey: ['appointments', 'client', clientId],
    queryFn: () => appointmentRepository.getAppointmentsByClientId(clientId as string),
    enabled: !!clientId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => appointmentRepository.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => appointmentRepository.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
