import { supabase } from "@/integrations/supabase/client";

export const profileRepository = {
  async getProfileById(user_id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }

    return data;
  },

  async updateProfile(id: string, updates: any) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }

    return data;
  },
};
