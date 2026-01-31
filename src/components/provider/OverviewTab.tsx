import { Calendar, Clock } from "lucide-react";
import StatusBadge from "../common/ChangeAppointments";
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

interface OverviewTabProps {
  appointments: Appointment[];
  onStatusChange: () => void;
}

export function OverviewTab({ appointments, onStatusChange }: OverviewTabProps) {
  const formatTime = (time: string) => time.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

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
        return "bg-primary/10 text-primary";
      case "pending":
        return "bg-accent/10 text-accent";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Filter future appointments with valid status
  const now = new Date();
  const futureAppointments = appointments.filter((apt) => {
    const aptDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
    return aptDateTime > now && ["pending", "confirmed"].includes(apt.status);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Visão Geral
        </h1>
        <p className="text-muted-foreground">
          {futureAppointments.length}{" "}
          {futureAppointments.length === 1
            ? "agendamento futuro"
            : "agendamentos futuros"}
        </p>
      </div>

      <div className="space-y-3">
        {futureAppointments.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Nenhum agendamento futuro
            </h3>
            <p className="text-muted-foreground">
              Compartilhe seu link de agendamento para receber novos clientes.
            </p>
          </div>
        ) : (
          futureAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all"
            >
              <div className="text-center min-w-[80px]">
                <span className="text-sm text-muted-foreground block">
                  {formatDate(apt.appointment_date)}
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {formatTime(apt.start_time)}
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
                <StatusBadge
                status={apt.status}
                onChange={async (newStatus) => {
                  const { error } = await supabase
                    .from("appointments")
                    .update({ status: newStatus })
                    .eq("id", apt.id);

                  if (error) {
                    toast.error("Erro ao atualizar status");
                  } else {
                    toast.success("Status atualizado");
                    onStatusChange();
                  }
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
