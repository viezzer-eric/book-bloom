import { supabase } from "@/integrations/supabase/client";

export const reviewRepository = {
  async getReviewsByProviderId(providerId: string) {
    const { data, error } = await supabase
      .from('provider_reviews' as any)
      .select('*, profiles(first_name, last_name, avatar_url)')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avaliações do profissional:', error);
      throw error;
    }

    return data;
  },

  async getReviewsByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('provider_reviews' as any)
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('Erro ao buscar avaliações do cliente:', error);
      throw error;
    }

    return data;
  },

  async createReview(reviewData: any) {
    const { data, error } = await supabase
      .from('provider_reviews' as any)
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }

    return data;
  }
};
