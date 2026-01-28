import { supabase } from "@/integrations/supabase/client";

export const providerRepository = {

  async countProviders(): Promise<number> {
    const { count, error } = await supabase
      .from('provider_profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erro ao contar profissionais:', error);
      throw error;
    }

    return count ?? 0;
  },

  async getAllProviders() {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*');

    if (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw error;
    }

    return data;
  },

  async getProviderById(id: string) {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar profissional:', error);
      throw error;
    }

    return data;
  },

  async getProviderByUserId(userId: string) {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) {
      console.error('Erro ao buscar profissional:', error);
      throw error;
    }

    return data;
  },
};
