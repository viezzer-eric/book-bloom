import { Calendar, Clock } from "lucide-react";

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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
        return "bg-primary/10 text-primary";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      case "no_show":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Filter past appointments or finalized status
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
    .sort((a, b) => {
      // Sort descending by date
      const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Agendamentos
        </h1>
        <p className="text-muted-foreground">
          Histórico de atendimentos realizados
        </p>
      </div>

      <div className="space-y-3">
        {pastAppointments.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Nenhum agendamento realizado até o momento
            </h3>
            <p className="text-muted-foreground">
              Os atendimentos concluídos aparecerão aqui.
            </p>
          </div>
        ) : (
          pastAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
            >
              <div className="text-center min-w-[100px]">
                <span className="text-sm text-muted-foreground block">
                  {formatDate(apt.appointment_date)}
                </span>
                <span className="text-base font-medium text-foreground">
                  {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">
                  {apt.client_name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {apt.service?.name || "Serviço"} ·{" "}
                  {apt.service?.duration_minutes || 60} min
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                  apt.status
                )}`}
              >
                {getStatusLabel(apt.status)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
