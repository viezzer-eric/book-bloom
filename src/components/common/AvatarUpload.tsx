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
  target = "provider",
  onSignOut,
}: AvatarUserMenuProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isProfile = target === "profile";

  // tamanhos separados
  const profileSizeClass = "w-[79px] h-[79px]";
  const nonProfileSizeClass = "w-[40px] h-[40px]"; // aumentei um pouco mais para ficar realmente visível

  const sizeClass = isProfile
    ? profileSizeClass
    : nonProfileSizeClass;

  const iconSize = isProfile
    ? "w-8 h-8"
    : "w-5 h-5";

  const shouldShowEdit =
    isProfile || !profileData?.avatar_url;

  useEffect(() => {
    if (!profileData?.avatar_url) return;

    const { data } = supabase.storage
      .from("avatar_urls")
      .getPublicUrl(profileData?.avatar_url);

    setPreview(`${data.publicUrl}?t=${Date.now()}`);
  }, [profileData?.avatar_url]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !profileData.email) {
      alert("Arquivo ou email do usuário não encontrado");
      return;
    }

    // preview instantâneo
    const reader = new FileReader();
    reader.onloadend = () =>
      setPreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("target", target);
    formData.append("email", profileData.email);

    try {
      setLoading(true);

      const { data: sessionData } =
        await supabase.auth.getSession();

      const token = sessionData.session?.access_token;

      const response = await fetch(
        "https://kivkhiwtdcvpdixjymwu.supabase.co/functions/v1/upload-avatar",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();

      setPreview(`${data.public_url}?t=${Date.now()}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar avatar");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const AvatarContent = preview ? (
    <img
      src={preview}
      alt="Avatar"
      className="w-full h-full object-cover rounded-full"
    />
  ) : profileData?.full_name ? (
    <span className="font-semibold">
      {getInitials(profileData?.full_name)}
    </span>
  ) : (
    <User className={iconSize} />
  );

  return (
    <div className="flex items-center gap-3">
      {/* container RELATIVO correto */}
      <div className={`relative group ${sizeClass}`}>
        {isProfile ? (
          <div
            className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden`}
          >
            {AvatarContent}
          </div>
        ) : (
          <Link
            to="/perfil"
            className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden`}
          >
            {AvatarContent}
          </Link>
        )}

        {/* lápis */}
        {shouldShowEdit && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer">
            <Edit className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {/* loading */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
            <span className="text-white text-xs">
              Enviando...
            </span>
          </div>
        )}
      </div>

      {/* logout fora do profile */}
      {!isProfile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
