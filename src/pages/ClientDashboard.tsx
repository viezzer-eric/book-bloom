import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./Profile";
import AvatarUserMenu from "@/components/common/AvatarUpload";
import { ReviewModal } from "@/components/common/ReviewModal";

interface Appointment {
  id: string;
  client_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  provider?: { id: string; business_name: string } | null;
  service?: { name: string; duration_minutes: number; price: number } | null;
}

export default function ClientDashboard() {
  // A autenticação e o guard de role são feitos pelo ProtectedRoute.
  // Aqui só usamos os dados que já sabemos que existem.
  const { user, signOut } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proximos" | "historico">(
    "proximos"
  );
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [reviewedAppointments, setReviewedAppointments] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: reviewsData } = await supabase
        .from("provider_reviews" as any)
        .select("appointment_id")
        .eq("client_id", user!.id);

      setReviewedAppointments(
        (reviewsData as any[])?.map((r: any) => r.appointment_id) || []
      );

      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select(
          "*, provider:provider_profiles(business_name, id), service:services(name, duration_minutes, price)"
        )
        .eq("client_id", user!.id)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const formatTime = (time: string) => time.slice(0, 5);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      completed: "Concluído",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const upcomingAppointments = appointments.filter(
    (apt) => (apt.status === "pending" || apt.status === "confirmed") && apt.appointment_date >= todayStr
  );
  const pastAppointments = appointments.filter(
    (apt) =>
      apt.status === "completed" ||
      apt.status === "cancelled" ||
      ((apt.status === "pending" || apt.status === "confirmed") && apt.appointment_date < todayStr)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-semibold text-foreground">
                Bookly
              </span>
            </div>
            <Link to="/buscar">
              <Button variant="outline" className="rounded-xl gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Buscar Profissionais</span>
              </Button>
            </Link>
            <AvatarUserMenu profileData={profile} onSignOut={signOut} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Olá, {profile?.full_name?.split(" ")[0] || "Cliente"}!
            </h1>
            <p className="text-muted-foreground">Gerencie seus agendamentos</p>
          </div>

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

          <div className="space-y-4">
            {activeTab === "proximos" &&
              (upcomingAppointments.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Nenhum agendamento
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem agendamentos futuros.
                  </p>
                  <Link to="/buscar">
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
                        <h3 className="font-semibold text-foreground">
                          {apt.provider?.business_name || "Profissional"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {apt.service?.name || "Serviço"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === "confirmed"
                            ? "bg-primary/10 text-primary"
                            : apt.status === "pending"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">
                          {formatDate(apt.appointment_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(apt.start_time)}</span>
                      </div>
                    </div>
                    {apt.service?.price && (
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        R$ {apt.service.price.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>
                ))
              ))}

            {selectedProviderId && selectedAppointmentId && user && (
              <ReviewModal
                open={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                providerId={selectedProviderId}
                appointmentId={selectedAppointmentId}
                userId={user.id}
                onSuccess={() => {
                  setReviewedAppointments((prev) => [
                    ...prev,
                    selectedAppointmentId,
                  ]);
                }}
              />
            )}

            {activeTab === "historico" &&
              (pastAppointments.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Nenhum histórico
                  </h3>
                  <p className="text-muted-foreground">
                    Seus agendamentos passados aparecerão aqui.
                  </p>
                </div>
              ) : (
                pastAppointments.map((apt) => {
                  const providerId = apt.provider?.id;
                  const canReview =
                    apt.status === "completed" && providerId;
                  const alreadyReviewed = reviewedAppointments.includes(apt.id);

                  return (
                    <div
                      key={apt.id}
                      className="p-4 rounded-xl bg-card border border-border opacity-75"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {apt.provider?.business_name || "Profissional"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {apt.service?.name || "Serviço"}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>{formatDate(apt.appointment_date)}</div>
                        {canReview && (
                          <Button
                            size="sm"
                            disabled={alreadyReviewed}
                            onClick={() => {
                              if (!providerId) return;
                              setSelectedProviderId(providerId);
                              setReviewModalOpen(true);
                              setSelectedAppointmentId(apt.id);
                            }}
                          >
                            {alreadyReviewed ? "Avaliado" : "Avaliar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}