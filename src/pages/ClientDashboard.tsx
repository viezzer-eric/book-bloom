import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, LogOut, User, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  client_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  provider?: { business_name: string } | null;
  service?: { name: string; duration_minutes: number; price: number } | null;
}

export default function ClientDashboard() {
  const { user, signOut, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proximos" | "historico">("proximos");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    } else if (!authLoading && userRole === "provider") {
      navigate("/painel");
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

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*, provider:provider_profiles(business_name), service:services(name, duration_minutes, price)')
        .eq('client_id', user!.id)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });
      setAppointments(appointmentsData || []);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
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

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(apt => apt.appointment_date >= today);
  const pastAppointments = appointments.filter(apt => apt.appointment_date < today);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
            </Link>
            
            <div className="flex items-center gap-3">
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
        <div className="max-w-3xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}!
            </h1>
            <p className="text-muted-foreground">Gerencie seus agendamentos</p>
          </div>

          {/* Search Button */}
          <Link to="/" className="block mb-8">
            <Button variant="outline" className="w-full justify-start text-muted-foreground" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Buscar profissionais...
            </Button>
          </Link>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button 
              variant={activeTab === "proximos" ? "default" : "outline"}
              onClick={() => setActiveTab("proximos")}
            >
              Próximos ({upcomingAppointments.length})
            </Button>
            <Button 
              variant={activeTab === "historico" ? "default" : "outline"}
              onClick={() => setActiveTab("historico")}
            >
              Histórico ({pastAppointments.length})
            </Button>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {activeTab === "proximos" && (
              upcomingAppointments.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Nenhum agendamento</h3>
                  <p className="text-muted-foreground mb-4">Você ainda não tem agendamentos futuros.</p>
                  <Link to="/">
                    <Button>Buscar Profissionais</Button>
                  </Link>
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{apt.provider?.business_name || 'Profissional'}</h3>
                        <p className="text-sm text-muted-foreground">{apt.service?.name || 'Serviço'}</p>
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{formatDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(apt.start_time)}</span>
                      </div>
                    </div>
                    {apt.service?.price && (
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        R$ {apt.service.price.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                ))
              )
            )}

            {activeTab === "historico" && (
              pastAppointments.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Nenhum histórico</h3>
                  <p className="text-muted-foreground">Seus agendamentos passados aparecerão aqui.</p>
                </div>
              ) : (
                pastAppointments.map((apt) => (
                  <div 
                    key={apt.id}
                    className="p-4 rounded-xl bg-card border border-border opacity-75"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{apt.provider?.business_name || 'Profissional'}</h3>
                        <p className="text-sm text-muted-foreground">{apt.service?.name || 'Serviço'}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{formatDate(apt.appointment_date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
