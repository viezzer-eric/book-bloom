import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Link as LinkIcon,
  User,
  LayoutDashboard,
  DollarSign,
  History,
  Edit,
  CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ServicesTab } from "@/components/provider/ServicesTab";
import { OverviewTab } from "@/components/provider/OverviewTab";
import { AppointmentsHistoryTab } from "@/components/provider/AppointmentsHistoryTab";
import NotificationBell from "@/components/common/NotificationBell";
import { FinancialTab } from "@/components/provider/FinancialTab";
import { ClientsTab } from "@/components/provider/ClientsTab";
import { Profile } from "./Profile";
import AvatarUserMenu from "@/components/common/AvatarUpload";
import { useProfile } from "@/hooks/useProfiles";
import { useProviderByUserId, useUpdateProvider, useUpsertProvider } from "@/hooks/useProviders";
import { useServicesByProvider } from "@/hooks/useServices";
import { useAppointmentsByProvider } from "@/hooks/useAppointments";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  provider_id: string;
  profiles?: { avatar_url: string };
  service?: { name: string; duration_minutes: number } | null;
}

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
  active: boolean;
}

interface ProviderProfile {
  id: string;
  business_name: string;
  description: string | null;
  working_hours: any;
  address: string | null;
  cep: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  addressNumber: string | null;
  avatar_url?: string | null;
}

interface ClientAppointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  service?: { name: string; duration_minutes: number } | null;
}


export default function ProviderDashboard() {
  const { user, signOut, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: profile } = useProfile(user?.id);
  const { data: providerProfile, isLoading: isProviderLoading } = useProviderByUserId(user?.id, userRole);
  const { data: services = [], refetch: refetchServices } = useServicesByProvider(providerProfile?.id);
  const { data: appointments = [], refetch: refetchAppointments } = useAppointmentsByProvider(providerProfile?.id);

  const updateProvider = useUpdateProvider();
  const upsertProvider = useUpsertProvider();

  const isLoading = isProviderLoading;

  const fetchData = () => {
    refetchServices();
    refetchAppointments();
  };
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const [cep, setCep] = useState<string>("");
  const [viacep, setViaCep] = useState<ViaCepResponse>();
  const [businessName, setBusinessName] = useState<string>("");
  const [addressNumber, setaddressNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [bairro, setBairro] = useState<string>("");
  const [rua, setRua] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [uf, setUf] = useState<string>("");
  const [businessPhoto, setBusinessPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const defaultWorkingHours: WorkingHours = {
    Segunda: { open: "09:00", close: "18:00", closed: false },
    Terça: { open: "09:00", close: "18:00", closed: false },
    Quarta: { open: "09:00", close: "18:00", closed: false },
    Quinta: { open: "09:00", close: "18:00", closed: false },
    Sexta: { open: "09:00", close: "18:00", closed: false },
    Sábado: { open: null, close: null, closed: true },
    Domingo: { open: null, close: null, closed: true },
  };



  const [workingHours, setWorkingHours] = useState<WorkingHours>(() => {
    if (!providerProfile?.working_hours) {
      return defaultWorkingHours;
    }
    return providerProfile.working_hours as WorkingHours;
  });

  async function fetchAddressByCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw new Error('CEP inválido');
    }

    const response = await fetch(
      `https://viacep.com.br/ws/${cleanCep}/json/`
    );

    if (!response.ok) {
      throw new Error('Erro ao consultar CEP');
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    setViaCep(data)
  }

  const clearAddress = () => {
    setViaCep({});
  };

  const cepMask = (value: string) => {
    if (!value)
      clearAddress();

    return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  type WorkingHoursDay = {
    open: string | null;
    close: string | null;
    closed: boolean;
  };

  type WorkingHours = {
    [day: string]: WorkingHoursDay;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    } else if (!authLoading && userRole === "client") {
      navigate("/buscar");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (!(providerProfile as any)?.avatar_url) return;

    const { data } = supabase.storage
      .from("avatar_urls")
      .getPublicUrl((providerProfile as any).avatar_url);

    // evita cache antigo
    setBusinessPhoto(`${data.publicUrl}?t=${Date.now()}`);
  }, [(providerProfile as any)?.avatar_url]);

  useEffect(() => {
    if (providerProfile?.business_name) {
      setBusinessName(providerProfile.business_name);
    }
    if (providerProfile?.cep) {
      setCep(providerProfile.cep);
    }
    if (providerProfile?.addressNumber) {
      setaddressNumber(providerProfile.addressNumber);
    }
    if (providerProfile?.address) {
      setRua(providerProfile.address)
    }
    if (providerProfile?.city) {
      setCidade(providerProfile.city)
    }
    if (providerProfile?.state) {
      setUf(providerProfile.state)
    }
    if (providerProfile?.neighborhood) {
      setBairro(providerProfile.neighborhood)
    }
    if (providerProfile?.description) {
      setDescription(providerProfile.description)
    }
    if (providerProfile?.working_hours) {
      setWorkingHours(providerProfile.working_hours as WorkingHours)
    }
  }, [providerProfile]);

  const updateProviderData = async () => {

    if (!cep) {
      toast.error("Cep precisa estar preenchido")
      return;
    }

    if (!businessName) {
      toast.error("Nome do empreendimento precisa estar preenchido")
      return;
    }

    if (!addressNumber) {
      toast.error("Numero de Endereco precisa estar preenchido")
      return;
    }

    if (!viacep) {
      updateProvider.mutate(
        {
          userId: user!.id,
          data: {
            business_name: businessName,
            description,
            addressNumber,
            working_hours: workingHours,
            updated_at: new Date().toISOString(),
          }
        },
        {
          onSuccess: () => toast.success("Perfil atualizado com sucesso"),
          onError: () => toast.error("Erro ao atualizar perfil")
        }
      );
      return;
    }

    const upsertData = {
      user_id: user!.id,
      business_name: businessName,
      description,
      address: viacep.logradouro,
      city: viacep.localidade,
      state: viacep.uf,
      cep,
      addressNumber: addressNumber,
      neighborhood: viacep.bairro,
      working_hours: workingHours,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    upsertProvider.mutate(upsertData, {
      onSuccess: () => toast.success("Perfil atualizado com sucesso"),
      onError: () => toast.error("Erro ao atualizar perfil")
    });
  }


  const weekOrder = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(
    apt => apt.appointment_date === new Date().toISOString().split('T')[0]
  );

  const handleBusinessPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview imediato
    const reader = new FileReader();
    reader.onloadend = () => setBusinessPhoto(reader.result as string);
    reader.readAsDataURL(file);

    try {

      setUploadingPhoto(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("target", "provider"); // 👈 importante
      formData.append("email", user.email);
      formData.append("business_name", providerProfile.business_name);

      const res = await fetch(
        "https://kivkhiwtdcvpdixjymwu.supabase.co/functions/v1/upload-avatar",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      // evita cache
      setBusinessPhoto(`${data.public_url}?t=${Date.now()}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar foto do negócio");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell todayAppointments={appointments} providerId={providerProfile?.id}></NotificationBell>
              <AvatarUserMenu profileData={profile} onSignOut={signOut}></AvatarUserMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 animate-fade-in">
            <nav className="space-y-1.5 flex flex-col">
              {[
                { id: "visao-geral", icon: LayoutDashboard, label: "Visão Geral" },
                { id: "faturamento", icon: DollarSign, label: "Faturamento" },
                { id: "agendamentos", icon: History, label: "Agendamentos" },
                { id: "servicos", icon: Clock, label: "Serviços" },
                { id: "clientes", icon: Users, label: "Clientes" },
                { id: "configuracoes", icon: Settings, label: "Configurações" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all font-medium ${activeTab === item.id
                    ? "bg-primary text-primary-foreground shadow-medium shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground hover:shadow-soft"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            {providerProfile && (
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/20 blur-2xl rounded-full group-hover:scale-150 transition-transform"></div>
                <h4 className="font-semibold text-foreground mb-1 relative z-10">Link de Agendamento</h4>
                <p className="text-sm text-muted-foreground mb-4 relative z-10">Compartilhe na sua bio</p>
                <Link to={`/agendar/${providerProfile.id}`} className="relative z-10">
                  <Button variant="outline" size="sm" className="w-full bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                </Link>
              </div>
            )}
          </aside>
          <main className="flex-1 min-w-0">
            {activeTab === "visao-geral" && (
              <OverviewTab appointments={appointments} onStatusChange={fetchData} />
            )}

            {activeTab === "faturamento" && providerProfile && (
              <FinancialTab providerId={providerProfile.id} />
            )}

            {activeTab === "agendamentos" && (
              <AppointmentsHistoryTab appointments={appointments} />
            )}

            {activeTab === "servicos" && providerProfile && (
              <ServicesTab
                services={services}
                providerId={providerProfile.id}
                onServiceAdded={fetchData}
                onServiceUpdated={fetchData}
              />
            )}

            {activeTab === "clientes" && (
              <ClientsTab appointments={appointments} />
            )}

            {activeTab === "configuracoes" && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
                  <p className="text-muted-foreground mt-1 text-lg">Personalize sua vitrine e horários no BookBloom</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/60 shadow-soft">
                    <h3 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Perfil do Negócio
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-8 pb-8 border-b border-border/40">
                        <label className="relative w-28 h-28 rounded-2xl bg-muted/50 border border-border flex items-center justify-center overflow-hidden cursor-pointer group shadow-sm hover:shadow-medium transition-all">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBusinessPhoto}
                          />
                          {businessPhoto ? (
                            <img
                              src={businessPhoto}
                              alt="Foto do negócio"
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <User className="w-10 h-10 text-muted-foreground/50" />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Edit className="w-6 h-6 text-white" />
                          </div>
                          {uploadingPhoto && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1"></div>
                              <span className="text-foreground text-[10px] font-bold">Enviando</span>
                            </div>
                          )}
                        </label>
                        <div className="text-center sm:text-left pt-2">
                           <h4 className="font-semibold text-foreground">Logotipo ou Foto</h4>
                           <p className="text-sm text-muted-foreground max-w-[200px] mt-1">Recomendamos uma imagem quadrada (1:1) com boa resolução.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Nome do Negócio <span className="text-destructive">*</span></label>
                          <input
                            type="text"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            placeholder="Nome da sua Empresa"
                            className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Descrição Curta</label>
                          <textarea
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full p-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                            placeholder="Descreva seu negócio, especialidades e o que o torna único..."
                          />
                        </div>

                        <div className="pt-4 border-t border-border/40 space-y-4">
                           <h4 className="font-semibold text-foreground flex items-center gap-2">Endereço</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">CEP <span className="text-destructive">*</span></label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={cep}
                                  onChange={e => setCep(cepMask(e.target.value))}
                                  onBlur={() => fetchAddressByCep(cep)}
                                  placeholder="00000-000"
                                  className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Número <span className="text-destructive">*</span></label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={addressNumber}
                                  onChange={e => setaddressNumber(e.target.value)}
                                  placeholder="123"
                                  className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 transition-all"
                                />
                              </div>
                           </div>

                           <div className="space-y-2">
                             <label className="text-sm font-medium text-muted-foreground">Rua/Logradouro</label>
                             <input
                               disabled
                               type="text"
                               value={rua}
                               className="w-full h-11 px-3 rounded-lg border border-transparent bg-muted/40 text-muted-foreground cursor-not-allowed"
                               placeholder="Rua..."
                             />
                           </div>

                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                             <div className="space-y-2 sm:col-span-2">
                               <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                               <input
                                 disabled
                                 type="text"
                                 value={cidade}
                                 className="w-full h-11 px-3 rounded-lg border border-transparent bg-muted/40 text-muted-foreground cursor-not-allowed"
                                 placeholder="Cidade"
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-sm font-medium text-muted-foreground">UF</label>
                               <input
                                 disabled
                                 type="text"
                                 value={uf}
                                 className="w-full h-11 px-3 rounded-lg border border-transparent bg-muted/40 text-muted-foreground cursor-not-allowed"
                                 placeholder="UF"
                               />
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horários */}
                  <div className="flex flex-col gap-6">
                    <div className="p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/60 shadow-soft flex-1">
                      <h3 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        Horário de Atendimento
                      </h3>
                      <div className="space-y-1">
                        {weekOrder.map((day) => {
                          const data = workingHours[day];
                          if (!data) return null;

                          return (
                            <div key={day} className={`flex items-center gap-4 py-3 border-b border-border/40 last:border-0 transition-opacity ${data.closed ? 'opacity-60' : 'opacity-100'}`}>
                              <span className="w-24 font-medium text-foreground">{day}</span>

                              <div className="flex-1 flex items-center gap-2 sm:gap-4">
                                {!data.closed ? (
                                  <>
                                    <input
                                      type="time"
                                      value={data.open ?? ""}
                                      onChange={(e) =>
                                        setWorkingHours((prev) => ({
                                          ...prev,
                                          [day]: { ...prev[day], open: e.target.value },
                                        }))
                                      }
                                      className="px-2 py-1.5 rounded-md border border-input bg-background w-24 text-sm font-semibold focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <span className="text-muted-foreground font-medium text-xs">às</span>
                                    <input
                                      type="time"
                                      value={data.close ?? ""}
                                      onChange={(e) =>
                                        setWorkingHours((prev) => ({
                                          ...prev,
                                          [day]: { ...prev[day], close: e.target.value },
                                        }))
                                      }
                                      className="px-2 py-1.5 rounded-md border border-input bg-background w-24 text-sm font-semibold focus:ring-1 focus:ring-primary outline-none"
                                    />
                                  </>
                                ) : (
                                  <div className="flex-1 px-4 py-1.5 rounded-md bg-muted/40 text-muted-foreground text-sm font-medium italic">
                                    Fechado
                                  </div>
                                )}
                              </div>

                              <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${data.closed ? 'bg-muted-foreground/30' : 'bg-green-500/20'}`}>
                                  <input
                                    type="checkbox"
                                    checked={!data.closed}
                                    className="sr-only"
                                    onChange={(e) =>
                                      setWorkingHours((prev) => ({
                                        ...prev,
                                        [day]: {
                                          open: e.target.checked ? "09:00" : null,
                                          close: e.target.checked ? "18:00" : null,
                                          closed: !e.target.checked,
                                        },
                                      }))
                                    }
                                  />
                                   <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full transition-all ${!data.closed ? 'bg-green-500 left-5' : 'bg-muted-foreground left-1'}`}></div>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="sticky bottom-6">
                       <Button 
                         onClick={() => updateProviderData()} 
                         className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:brightness-110 shadow-lg shadow-primary/20 transition-all font-bold text-primary-foreground flex items-center justify-center gap-2"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                         Salvar Todas as Configurações
                       </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
