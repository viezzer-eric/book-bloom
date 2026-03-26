import { supabase } from "@/integrations/supabase/client";

export const appointmentRepository = {
  async getAppointmentsByProviderId(providerId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, service:services(name, duration_minutes)')
      .eq('provider_id', providerId)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos do profissional:', error);
      throw error;
    }

    return data;
  },

  async getAppointmentsByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, provider:provider_profiles(business_name, id), service:services(name, duration_minutes, price)')
      .eq('client_id', clientId)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos do cliente:', error);
      throw error;
    }

    return data;
  },

  async createAppointment(appointmentData: any) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }

    return data;
  },

  async updateAppointmentStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      throw error;
    }

    return data;
  }
};
