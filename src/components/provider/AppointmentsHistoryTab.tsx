import { Calendar, Clock, CheckCircle2, XCircle, Clock3 } from "lucide-react";

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

interface AppointmentsHistoryTabProps {
  appointments: Appointment[];
}

export function AppointmentsHistoryTab({
  appointments,
}: AppointmentsHistoryTabProps) {
  const formatTime = (time: string) => time.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "confirmed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "pending": return <Clock3 className="w-3.5 h-3.5" />;
      case "cancelled": return <XCircle className="w-3.5 h-3.5" />;
      case "completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "no_show": return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      completed: "Concluído",
      no_show: "Ausente",
    };
    return labels[status] || status;
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "no_show":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  // ================= HELPERS =================

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDayLabel = (date: Date) => {
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    if (isSameDay(date, today)) return "Hoje";
    if (isSameDay(date, yesterday)) return "Ontem";
    if (isSameDay(date, twoDaysAgo)) return "Anteontem";

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // ================= FILTRO =================

  const now = new Date();

  const pastAppointments = appointments
    .filter((apt) => {
      const aptDateTime = new Date(`${apt.appointment_date}T${apt.end_time}`);
      const isPast = aptDateTime < now;

      const isFinalStatus = ["completed", "cancelled", "no_show"].includes(
        apt.status
      );

      return isPast || isFinalStatus;
    })
    .sort((a, b) =>
      `${b.appointment_date}T${b.start_time}`.localeCompare(
        `${a.appointment_date}T${a.start_time}`
      )
    );

  // ================= AGRUPAMENTO PROFISSIONAL =================

  const groupedAppointments = Object.values(
    pastAppointments.reduce((acc, apt) => {
      const dateKey = apt.appointment_date;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          label: getDayLabel(new Date(`${dateKey}T00:00:00`)),
          items: [],
        };
      }

      acc[dateKey].items.push(apt);

      return acc;
    }, {} as Record<string, { date: string; label: string; items: Appointment[] }>)
  ).sort((a, b) => b.date.localeCompare(a.date));

  // ================= UI =================

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Histórico de Agendamentos
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Atendimentos passados e concluídos
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 inline-flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">
              {pastAppointments.length} no histórico
            </span>
        </div>
      </div>

      <div className="space-y-8">
        {pastAppointments.length === 0 ? (
           <div className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-3xl border border-border/60 shadow-soft">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Calendar className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              Nenhum agendamento realizado
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Os atendimentos concluídos, cancelados ou ausentes aparecerão aqui.
            </p>
          </div>
        ) : (
          groupedAppointments.map((group) => (
            <div key={group.date} className="space-y-4">
              
              {/* HEADER DO DIA */}
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-display font-bold text-foreground capitalize tracking-tight">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-border/40"></div>
                <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  {formatDate(group.date)}
                </span>
              </div>

              <div className="grid gap-3">
                {group.items.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:bg-card/80 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 sm:w-48 shrink-0">
                      <div className="flex flex-col items-center justify-center bg-muted/30 rounded-full w-14 h-14 border border-border/30 shrink-0">
                        <Clock className="w-5 h-5 text-muted-foreground/60 mb-0.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-foreground font-semibold">
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

                    <div className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusClasses(
                        apt.status
                      )}`}
                    >
                      {getStatusIcon(apt.status)}
                      {getStatusLabel(apt.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
