import { supabase } from "@/integrations/supabase/client";

export const storageRepository = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      console.error(`Erro ao fazer upload no bucket ${bucket}:`, error);
      throw error;
    }

    return data;
  },

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
};
