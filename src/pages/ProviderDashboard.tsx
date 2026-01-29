import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Bell,
  Link as LinkIcon,
  LogOut,
  User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/common/UserMenu";
import { toast } from "sonner";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
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
}

interface ProviderProfile {
  id: string;
  business_name: string;
  description: string | null;
  working_hours: any;
  address: string;
  cep: string;
  state: string;
  city: string;
  neighboorhod: string;
}

export default function ProviderDashboard() {
  const { user, signOut, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("agenda");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const [cep, setCep] = useState<string>(""); 
  const [viacep, setViaCep] = useState<ViaCepResponse>(); 
  const [businessName, setBusinessName] = useState<string>("");
  const [adressNumber, setAdressNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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
    if(!value)
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

  const defaultWorkingHours: WorkingHours = {
    Segunda: { open: "09:00", close: "18:00", closed: false },
    Terça: { open: "09:00", close: "18:00", closed: false },
    Quarta: { open: "09:00", close: "18:00", closed: false },
    Quinta: { open: "09:00", close: "18:00", closed: false },
    Sexta: { open: "09:00", close: "18:00", closed: false },
    Sábado: { open: null, close: null, closed: true },
    Domingo: { open: null, close: null, closed: true },
  };

  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    providerProfile?.working_hours ?? defaultWorkingHours
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    } else if (!authLoading && userRole === "client") {
      navigate("/buscar");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const updateProviderData = async () => {
    
    if(!cep){
      toast.error("Cep precisa estar preenchido")
      return;
    }

    if(!businessName){
      toast.error("Nome do empreendimento precisa estar preenchido")
      return;
    }

    if(!viacep.logradouro){
      toast.error("Cep precisa ser valido!")
      return;
    }

    if(!adressNumber){
      toast.error("Numero de Endereco precisa estar preenchido")
      return;
    }

    var completeAddress = viacep.logradouro + ", " + adressNumber;

    const updateData = {
      business_name: businessName,
      description,
      completeAddress,
      city: viacep.logradouro,
      state: viacep.uf,
      cep,
      neighboorhod: viacep.bairro,
      working_hours: workingHours,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
    .from("provider_profiles")
    .update({updateData} as any)
    .eq("user_id", user!.id);

    if (error) {
      toast.error("Erro ao atualizar perfil");
      throw error;
    }

    toast.success("Perfil atualizado com sucesso");
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user!.id)
        .maybeSingle();
      setProfile(profileData);

      // Fetch provider profile
      const { data: providerData } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      setProviderProfile(providerData);

      if (providerData) {
        // Fetch services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', providerData.id)
          .eq('active', true);
        setServices(servicesData || []);

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*, service:services(name, duration_minutes)')
          .eq('provider_id', providerData.id)
          .gte('appointment_date', new Date().toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true });
        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return labels[status] || status;
  };

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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {todayAppointments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                    {todayAppointments.length}
                  </span>
                )}
              </Button>
               <UserMenu
                  full_name={profile.full_name}
                  onSignOut={signOut}
                />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: "agenda", icon: Calendar, label: "Agenda" },
                { id: "servicos", icon: Clock, label: "Serviços" },
                { id: "clientes", icon: Users, label: "Clientes" },
                { id: "configuracoes", icon: Settings, label: "Configurações" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            {providerProfile && (
              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">Seu Link de Agendamento</h4>
                <p className="text-sm text-muted-foreground mb-3">Compartilhe com seus clientes</p>
                <Link to={`/agendar/${providerProfile.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Ver Página de Agendamento
                  </Button>
                </Link>
              </div>
            )}
          </aside>
          <main className="flex-1">
            {activeTab === "agenda" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground capitalize">{formattedDate}</h1>
                    <p className="text-muted-foreground">
                      {todayAppointments.length} {todayAppointments.length === 1 ? 'agendamento' : 'agendamentos'} hoje
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">Hoje</Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Nenhum agendamento hoje</h3>
                      <p className="text-muted-foreground">Compartilhe seu link de agendamento para receber novos clientes.</p>
                    </div>
                  ) : (
                    todayAppointments.map((apt) => (
                      <div 
                        key={apt.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all"
                      >
                        <div className="w-20 text-center">
                          <span className="text-lg font-semibold text-foreground">{formatTime(apt.start_time)}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground">{apt.client_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {apt.service?.name || 'Serviço'} · {apt.service?.duration_minutes || 60} min
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' 
                            ? 'bg-primary/10 text-primary' 
                            : apt.status === 'pending'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "servicos" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Serviços</h1>
                    <p className="text-muted-foreground">Gerencie seus serviços oferecidos</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>

                <div className="grid gap-4">
                  {services.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Nenhum serviço cadastrado</h3>
                      <p className="text-muted-foreground">Adicione seus serviços para que os clientes possam agendar.</p>
                    </div>
                  ) : (
                    services.map((service) => (
                      <div 
                        key={service.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-card-foreground">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
                        </div>
                        <span className="text-lg font-semibold text-foreground">
                          R$ {service.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "clientes" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Clientes</h1>
                    <p className="text-muted-foreground">Sua lista de clientes</p>
                  </div>
                </div>

                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Nenhum cliente ainda</h3>
                  <p className="text-muted-foreground">Os clientes aparecerão aqui após o primeiro agendamento.</p>
                </div>
              </div>
            )}

            {activeTab === "configuracoes" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
                  <p className="text-muted-foreground">Gerencie seu perfil de negócio</p>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">Informações do Negócio</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do Negócio<span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={providerProfile?.business_name || businessName || ""}
                          onChange={e => setBusinessName(e.target.value)}
                          placeholder="Nome da sua Empresa"
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">CEP<span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={providerProfile?.cep || cep || viacep?.cep} 
                          onChange={e => setCep(cepMask(e.target.value))}
                          onBlur={() => fetchAddressByCep(cep)}
                          placeholder="00000-000"
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Endereço
                          </label>
                          <input
                            disabled
                            type="text"
                            defaultValue={providerProfile?.address || viacep?.logradouro || ""}
                            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            número<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" 
                            inputMode="numeric"
                            value={adressNumber}
                            onChange={e => setAdressNumber(e.target.value)}
                            className="px-2 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Cidade</label>
                        <input 
                          disabled
                          type="text" 
                          defaultValue={viacep?.localidade || providerProfile?.city || ""}
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                        <input 
                          disabled
                          type="text" 
                          defaultValue={providerProfile?.state || viacep?.localidade || ""}
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Bairro</label>
                        <input
                          disabled
                          type="text" 
                          defaultValue={providerProfile?.neighboorhod || viacep?.bairro || ""}
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
                        <textarea 
                          rows={3}
                          defaultValue={providerProfile?.description || description || ""}
                          onChange={e => setDescription(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="Descreva seu negócio..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">
                      Horário de Funcionamento
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(workingHours).map(([day, data]) => (
                        <div key={day} className="flex items-center gap-4">
                          <span className="w-24 text-muted-foreground">{day}</span>
                          {!data.closed && (
                            <>
                              <input
                                type="time"
                                value={data.open ?? ""}
                                onChange={(e) =>
                                  setWorkingHours((prev) => ({
                                    ...prev,
                                    [day]: { ...data, open: e.target.value },
                                  }))
                                }
                                className="px-2 py-1 rounded-md border border-input bg-background"
                              />

                              <span className="text-muted-foreground">–</span>

                              <input
                                type="time"
                                value={data.close ?? ""}
                                onChange={(e) =>
                                  setWorkingHours((prev) => ({
                                    ...prev,
                                    [day]: { ...data, close: e.target.value },
                                  }))
                                }
                                className="px-2 py-1 rounded-md border border-input bg-background"
                              />
                            </>
                          )}

                          {data.closed && (
                            <span className="text-muted-foreground">Fechado</span>
                          )}

                          <label className="ml-auto flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={data.closed}
                              onChange={(e) =>
                                setWorkingHours((prev) => ({
                                  ...prev,
                                  [day]: {
                                    open: e.target.checked ? null : "09:00",
                                    close: e.target.checked ? null : "18:00",
                                    closed: e.target.checked,
                                  },
                                }))
                              }
                            />
                            Fechado
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => updateProviderData()}>Salvar Alterações</Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
