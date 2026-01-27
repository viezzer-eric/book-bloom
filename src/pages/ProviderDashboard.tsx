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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    } else if (!authLoading && userRole === "client") {
      navigate("/meus-agendamentos");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
              </Link>
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
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {profile?.full_name ? getInitials(profile.full_name) : <User className="w-4 h-4" />}
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
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
            
            {/* Share booking link */}
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

          {/* Main Content */}
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
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do Negócio</label>
                        <input 
                          type="text" 
                          defaultValue={providerProfile?.business_name || ""}
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
                        <textarea 
                          rows={3}
                          defaultValue={providerProfile?.description || ""}
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="Descreva seu negócio..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">Horário de Funcionamento</h3>
                    <div className="space-y-3">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="text-foreground font-medium">09:00 - 18:00</span>
                        </div>
                      ))}
                      {['Sábado', 'Domingo'].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="text-muted-foreground">Fechado</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button>Salvar Alterações</Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
