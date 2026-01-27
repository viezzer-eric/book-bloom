import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowLeft, Loader2, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileData) {
        setFormData({
          fullName: profileData.full_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
        });
      }

      // Fetch provider profile if applicable
      if (userRole === "provider") {
        const { data: providerProfile } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (providerProfile) {
          setProviderData({
            businessName: providerProfile.business_name || "",
            description: providerProfile.description || "",
            address: providerProfile.address || "",
            city: providerProfile.city || "",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      // Update provider profile if applicable
      if (userRole === "provider") {
        const { error: providerError } = await supabase
          .from('provider_profiles')
          .update({
            business_name: providerData.businessName,
            description: providerData.description,
            address: providerData.address,
            city: providerData.city,
          })
          .eq('user_id', user!.id);

        if (providerError) throw providerError;
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
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
              </Link>
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
                  <User className="w-8 h-8 text-primary" />
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

            {/* Provider Info */}
            {userRole === "provider" && (
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Dados do Negócio</h3>
                  <p className="text-sm text-muted-foreground">Informações que aparecem para seus clientes</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome do Negócio</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={providerData.businessName}
                    onChange={(e) => setProviderData({ ...providerData, businessName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    rows={3}
                    value={providerData.description}
                    onChange={(e) => setProviderData({ ...providerData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Descreva seu negócio..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Rua, número"
                    value={providerData.address}
                    onChange={(e) => setProviderData({ ...providerData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="São Paulo, SP"
                    value={providerData.city}
                    onChange={(e) => setProviderData({ ...providerData, city: e.target.value })}
                  />
                </div>
              </div>
            )}

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
