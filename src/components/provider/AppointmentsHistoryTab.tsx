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
  ).sort((a, b) => b.date.localeCompare(a.date)); // 🔥 garante ordem dos dias

  // ================= UI =================

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

      <div className="space-y-5">
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
          groupedAppointments.map((group) => (
            <div key={group.date} className="space-y-2">
              
              {/* HEADER DO DIA */}
              <h2 className="text-sm font-semibold text-muted-foreground px-1">
                {group.label}
              </h2>

              {group.items.map((apt) => (
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
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
