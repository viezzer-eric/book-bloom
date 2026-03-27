import { Calendar, Clock, ChevronDown, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { useState } from "react";

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

interface OverviewTabProps {
  appointments: Appointment[];
  onStatusChange: () => void;
}

export function OverviewTab({ appointments, onStatusChange }: OverviewTabProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [localAppointments, setLocalAppointments] = useState(appointments);
  const updateAppointmentStatus = useUpdateAppointmentStatus();

  const formatTime = (time: string) => time.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "confirmed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "pending": return <Clock3 className="w-3.5 h-3.5" />;
      case "cancelled": return <XCircle className="w-3.5 h-3.5" />;
      case "completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return null;
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      completed: "Concluído",
    };
    return labels[status] || status;
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-accent/10 text-accent border-accent/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "completed":
        return "bg-muted text-muted-foreground border-border/50";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Atualização otimista
    setLocalAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );

    setOpenId(null);

    try {
      await updateAppointmentStatus.mutateAsync({ id, status: newStatus });
      toast.success("Status atualizado");
      onStatusChange();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const now = new Date();
  const futureAppointments = localAppointments.filter((apt) => {
  const aptDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
  const normalizedStatus = apt.status?.toLowerCase().trim();

  return (
    aptDateTime > now &&
    normalizedStatus !== "cancelled" &&
    normalizedStatus !== "completed"
  );
  }).sort((a,b) => new Date(`${a.appointment_date}T${a.start_time}`).getTime() - new Date(`${b.appointment_date}T${b.start_time}`).getTime());

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Visão Geral
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Próximos agendamentos da sua agenda
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 inline-flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">
              {futureAppointments.length} {futureAppointments.length === 1 ? "agendamento" : "agendamentos"}
            </span>
        </div>
      </div>

      <div className="space-y-4">
        {futureAppointments.length === 0 ? (
          <div className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-3xl border border-border/60 shadow-soft">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Calendar className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              Sua agenda está livre
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Compartilhe seu link de agendamento nas redes sociais para receber novos clientes.
            </p>
          </div>
        ) : (
          futureAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-medium transition-all duration-300 group relative hover:z-10 focus-within:z-10"
            >
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-primary/50 to-accent/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center gap-5 sm:w-48 shrink-0">
                <div className="flex flex-col items-center justify-center bg-muted/40 rounded-xl w-16 h-16 border border-border/40 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {formatDate(apt.appointment_date).split(',')[0]}
                  </span>
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    {formatDate(apt.appointment_date).split(' ')[1]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-lg">
                    <Clock className="w-4 h-4 text-primary" />
                    {formatTime(apt.start_time)}
                  </div>
                  <span className="text-sm text-muted-foreground">até {formatTime(apt.end_time)}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-card-foreground truncate">
                  {apt.client_name}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-medium">
                    {apt.service?.name || "Serviço"}
                  </span>
                  <span className="flex items-center gap-1 opacity-80">
                    <Clock3 className="w-3.5 h-3.5" />
                    {apt.service?.duration_minutes || 60} min
                  </span>
                </div>
              </div>

              {/* STATUS BADGE SELECTOR */}
              <div className="relative shrink-0 mt-2 sm:mt-0">
                <button
                  onClick={() =>
                    setOpenId(openId === apt.id ? null : apt.id)
                  }
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-between sm:justify-center gap-2 border shadow-sm transition-all hover:brightness-110 ${getStatusClasses(
                    apt.status
                  )}`}
                >
                  <span className="flex items-center gap-1.5">
                    {getStatusIcon(apt.status)}
                    {getStatusLabel(apt.status)}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openId === apt.id ? 'rotate-180' : ''}`} />
                </button>

                {openId === apt.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {["pending", "confirmed", "completed", "cancelled"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(apt.id, status)}
                          className="w-full text-left px-4 py-3 hover:bg-muted/80 text-sm font-medium flex items-center gap-2 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className={`w-2 h-2 rounded-full ${status === 'confirmed' ? 'bg-primary' : status === 'pending' ? 'bg-accent' : status === 'cancelled' ? 'bg-destructive' : 'bg-muted-foreground'}`}></div>
                          {getStatusLabel(status)}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
