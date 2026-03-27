import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowLeft, Loader2, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import AvatarUserMenu from "@/components/common/AvatarUpload";
import { useProfile, useUpdateProfile } from "@/hooks/useProfiles";
import { useProviderByUserId, useUpdateProvider } from "@/hooks/useProviders";

export interface Profile {
  avatar_url: string;
  created_at: string;
  email: string;
  full_name: string;
  id: string;
  phone: string;
  updated_at: string;
  user_id: string;
}

export default function Profile() {
  const { user, signOut, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [providerData, setProviderData] = useState({
    businessName: "",
    description: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    }
  }, [user, authLoading, navigate]);

  const { data: profilerData, isLoading: profileLoading } = useProfile(user?.id);
  const { data: providerProfile, isLoading: providerLoading } = useProviderByUserId(user?.id, userRole);
  const updateProfile = useUpdateProfile();
  const updateProvider = useUpdateProvider();

  const isLoading = profileLoading || (userRole === "provider" ? providerLoading : false);

  useEffect(() => {
    if (profilerData) {
      setFormData({
        fullName: profilerData.full_name || "",
        email: profilerData.email || "",
        phone: profilerData.phone || "",
      });
    }
    if (userRole === "provider" && providerProfile) {
      setProviderData({
        businessName: providerProfile.business_name || "",
        description: providerProfile.description || "",
        address: providerProfile.address || "",
        city: providerProfile.city || "",
      });
    }
  }, [profilerData, providerProfile, userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update profile
      await updateProfile.mutateAsync({
        id: (profilerData as any)?.id as string,
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        }
      });

      // Update provider profile if applicable
      if (userRole === "provider") {
        await updateProvider.mutateAsync({
          userId: user!.id,
          data: {
            business_name: providerData.businessName,
            description: providerData.description
          }
        });
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to={userRole === "provider" ? "/painel" : "/meus-agendamentos"}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <AvatarUserMenu profileData={profilerData} target={"profile"} onSignOut={signOut}></AvatarUserMenu>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Dados Pessoais</h3>
                  <p className="text-sm text-muted-foreground">Suas informações de contato</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
