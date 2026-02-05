import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Edit, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  avatar_url: string;
  full_name: string;
  email: string;
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  phone: string;
}

interface AvatarUserMenuProps {
  profileData: ProfileData;
  target?: "profile" | "provider";
  onSignOut: () => void;
}

export default function AvatarUserMenu({
  profileData,
  target = "profile",
  onSignOut,
}: AvatarUserMenuProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se avatar_url estiver preenchido, busca no Storage
  useEffect(() => {
    async function fetchAvatar() {
      if (profileData.avatar_url) {
        const { data,  } = supabase.storage
          .from("avatar_urls")
          .getPublicUrl(profileData.avatar_url);
        setPreview(data.publicUrl);
      }
    }

    fetchAvatar();
  }, [profileData.avatar_url]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !profileData.email) {
      alert("Arquivo ou email do usuário não encontrado");
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Prepara FormData
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("target", target);
    formData.append("email", profileData.email);

    try {
      setLoading(true);

      const response = await fetch(
        "https://kivkhiwtdcvpdixjymwu.supabase.co/functions/v1/upload-avatar",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error("Falha ao enviar avatar: " + text);
      }

      const data = await response.json();
      console.log("Avatar enviado com sucesso:", data);
      setPreview(data.public_url); // atualiza preview
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar avatar");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9">
        <Link
          to="/perfil"
          className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium overflow-hidden"
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : profileData.full_name ? (
            getInitials(profileData.full_name)
          ) : (
            <User className="w-4 h-4" />
          )}
        </Link>

        {/* Botão de lápis só se não houver avatar */}
        {!profileData.avatar_url && (
          <label className="absolute bottom-0 left-0 bg-white rounded-full p-1 shadow-md cursor-pointer border border-gray-300">
            <Edit className="w-4 h-4 text-gray-700" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
            <span className="text-white text-xs">Carregando...</span>
          </div>
        )}
      </div>

      {/* Botão de logout */}
      <Button variant="ghost" size="icon" onClick={onSignOut}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
