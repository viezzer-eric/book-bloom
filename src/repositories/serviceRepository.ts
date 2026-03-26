import { supabase } from "@/integrations/supabase/client";

export const serviceRepository = {
  async getServicesByProviderId(providerId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId);

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }

    return data;
  },

  async getAllActiveServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('Erro ao buscar serviços ativos:', error);
      throw error;
    }

    return data;
  },

  async createService(serviceData: any) {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }

    return data;
  },

  async updateService(id: string, serviceData: any) {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }

    return data;
  },

  async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
    
    return true;
  }
};
