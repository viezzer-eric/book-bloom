import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Search, History, LayoutGrid, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Profile } from "./Profile";
import AvatarUserMenu from "@/components/common/AvatarUpload";
import { ReviewModal } from "@/components/common/ReviewModal";
import { useProfile } from "@/hooks/useProfiles";
import { useAppointmentsByClient } from "@/hooks/useAppointments";
import { useReviewsByClient } from "@/hooks/useReviews";

export default function ClientDashboard() {
  const { user, signOut, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"proximos" | "historico">("proximos");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointmentsByClient(user?.id);
  const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useReviewsByClient(user?.id);
  
  const reviewedAppointments = reviews.map((r: any) => r.appointment_id) || [];
  const isLoading = profileLoading || appointmentsLoading || reviewsLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/entrar");
    } else if (!authLoading && userRole === "provider") {
      navigate("/painel");
    }
  }, [user, userRole, authLoading, navigate]);

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s'}}></div>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    apt => apt.status === "pending" || apt.status === "confirmed"
  ); 
  const pastAppointments = appointments.filter(
    apt => apt.status === "completed" || apt.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground tracking-tight">Bookly</span>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <Link to="/buscar" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 h-10">
                  <Search className="w-4 h-4 text-primary" />
                  <span>Buscar Profissionais</span>
                </Button>
              </Link>
              <div className="shrink-0 pl-2 sm:pl-4 border-l border-border/50">
                <AvatarUserMenu profileData={profile} onSignOut={signOut}></AvatarUserMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 relative z-10 animate-fade-up">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Welcome Card */}
          <div className="relative overflow-hidden rounded-[2rem] gradient-hero p-8 sm:p-10 text-primary-foreground shadow-glow">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
                Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'}!
              </h1>
              <p className="text-primary-foreground/90 text-lg max-w-lg">
                Gerencie seus agendamentos, avalie os profissionais e cuide do seu bem-estar com o Bookly.
              </p>
            </div>
            
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 hidden sm:block">
              <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98.1,-18,97.6,-2.8C97.1,12.4,89.5,27.3,79.5,40.1C69.4,52.9,56.9,63.6,42.8,70.8C28.7,78,13.1,81.8,-2.4,85.8C-17.9,89.8,-33.4,94,-46.8,88.4C-60.1,82.8,-71.4,67.4,-78.9,51.3C-86.3,35.2,-89.9,18.5,-87.3,2.6C-84.7,-13.3,-75.8,-28.3,-65.4,-40.7C-55,-53.1,-43,-62.8,-29.9,-70.6C-16.8,-78.4,-2.5,-84.3,11.2,-82.9C24.8,-81.5,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
              </svg>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-display font-bold">{upcomingAppointments.length}</h3>
              </div>
              <p className="text-sm text-muted-foreground">Próximos</p>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-display font-bold">
                  {pastAppointments.filter(a => a.status === 'completed').length}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-col space-y-6">
            <div className="flex p-1 bg-muted/50 backdrop-blur-sm rounded-2xl w-full sm:w-fit border border-border/50">
              <button 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "proximos" 
                    ? "bg-background text-foreground shadow-sm border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                onClick={() => setActiveTab("proximos")}
              >
                <LayoutGrid className="w-4 h-4" />
                Próximos
              </button>
              <button 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === "historico" 
                    ? "bg-background text-foreground shadow-sm border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                onClick={() => setActiveTab("historico")}
              >
                <History className="w-4 h-4" />
                Histórico
              </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4 animate-fade-in" key={activeTab}>
              {activeTab === "proximos" && (
                upcomingAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border/50 shadow-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-2">Sua agenda está livre</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">Que tal tirar um tempo para se cuidar? Encontre os melhores profissionais na sua região.</p>
                    <Link to="/buscar">
                      <Button className="rounded-full px-8 shadow-soft hover:shadow-glow transition-all">
                        Buscar Profissionais
                      </Button>
                    </Link>
                  </div>
                ) : (
                  upcomingAppointments.map((apt, idx) => (
                    <div 
                      key={apt.id}
                      className="group p-5 sm:p-6 rounded-[1.5rem] bg-card/80 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-medium transition-all duration-300 animate-fade-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full gradient-subtle border border-border flex items-center justify-center shrink-0">
                            <span className="font-display font-bold text-foreground/80 text-lg">
                              {apt.provider?.business_name?.charAt(0) || 'P'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                              {apt.provider?.business_name || 'Profissional'}
                            </h3>
                            <p className="text-muted-foreground">{apt.service?.name || 'Serviço'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-4 border-t border-border/40 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="capitalize font-medium text-foreground/90">{formatDate(apt.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4 text-accent" />
                          <span className="font-medium text-foreground/90">{formatTime(apt.start_time)}</span>
                        </div>
                        {apt.service?.price && (
                          <div className="sm:ml-auto">
                            <p className="text-lg font-semibold text-foreground">
                              R$ {apt.service.price.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}

              {/* Modal Review */}
              {selectedProviderId && selectedAppointmentId && user && (
                <ReviewModal
                  open={reviewModalOpen}
                  onClose={() => setReviewModalOpen(false)}
                  providerId={selectedProviderId}
                  appointmentId={selectedAppointmentId}
                  userId={user.id}
                  onSuccess={() => {
                    refetchReviews();
                  }}
                />
              )}
              
              {activeTab === "historico" && (
                pastAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 bg-card/40 backdrop-blur-sm rounded-[2rem] border border-border/50 shadow-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-2">Nenhum histórico</h3>
                    <p className="text-muted-foreground">Seus agendamentos passados aparecerão aqui.</p>
                  </div>
                ) : (
                  pastAppointments.map((apt, idx) => {
                    const providerId = apt.provider?.id;
                    const canReview = apt.status === "completed" && providerId;
                    const alreadyReviewed = reviewedAppointments.includes(apt.id);

                    return (
                      <div
                        key={apt.id}
                        className="group p-5 rounded-[1.5rem] bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:border-border transition-all animate-fade-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                               <span className="font-display font-medium text-foreground/60">
                                {apt.provider?.business_name?.charAt(0) || 'P'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground/90">
                                {apt.provider?.business_name || "Profissional"}
                              </h3>
                              <p className="text-sm text-muted-foreground/80">
                                {apt.service?.name || "Serviço"} • {formatTime(apt.start_time)}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusStyle(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>

                         <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/30 text-sm text-muted-foreground gap-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(apt.appointment_date)}</span>
                          </div>

                          {canReview && (
                            <Button
                              variant={alreadyReviewed ? "outline" : "default"}
                              size="sm"
                              className={`rounded-full h-8 px-4 text-xs ${alreadyReviewed ? 'opacity-50' : 'shadow-soft hover:shadow-glow'}`}
                              disabled={alreadyReviewed}
                              onClick={() => {
                                if (!providerId) return;
                                setSelectedProviderId(providerId);
                                setReviewModalOpen(true);
                                setSelectedAppointmentId(apt.id); 
                              }}
                            >
                              {alreadyReviewed ? "Avaliado" : "Avaliar Profissional"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
