import { Bell } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

type Appointment = {
  id: string;
  client_name: string;
  start_time: string;
  status: string;
  service?: {
    name: string;
    duration_minutes: number;
  } | null;
};

interface Props {
  /** Lista inicial de agendamentos (usada como seed antes do realtime carregar) */
  todayAppointments?: Appointment[];
  /** ID do provider para a subscription realtime */
  providerId?: string;
}

type AppointmentWithMeta = Appointment & {
  isPast: boolean;
};

export default function NotificationBell({ todayAppointments = [], providerId }: Props) {
  const [open, setOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(todayAppointments);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Busca agendamentos de hoje para o provider
  const fetchTodayAppointments = async () => {
    if (!providerId) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("appointments")
      .select("id, client_name, start_time, status, service:services(name, duration_minutes)")
      .eq("provider_id", providerId)
      .eq("appointment_date", today)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setAppointments(data as Appointment[]);
    }
  };

  // Configura realtime subscription
  useEffect(() => {
    if (!providerId) return;

    // Busca inicial
    fetchTodayAppointments();

    // Cria canal com filtro no provider_id
    const channel = supabase
      .channel(`appointments-bell-${providerId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "appointments",
          filter: `provider_id=eq.${providerId}`,
        },
        () => {
          // Quando qualquer mudança ocorre, re-busca para garantir dados frescos
          fetchTodayAppointments();
          // Reseta hasSeen para mostrar badge em novos agendamentos
          setHasSeen(false);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [providerId]);

  // Sincroniza com prop inicial quando não há providerId
  useEffect(() => {
    if (!providerId) {
      setAppointments(todayAppointments);
    }
  }, [todayAppointments, providerId]);

  /**
   * Converte HH:mm → Date hoje
   */
  const buildDateFromTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  /**
   * Ordena + marca passado
   */
  const orderedAppointments = useMemo<AppointmentWithMeta[]>(() => {
    const now = new Date();

    return appointments
      .map((apt) => {
        if (!apt.start_time) {
          return { ...apt, isPast: false };
        }

        const aptDate = buildDateFromTime(apt.start_time);

        return {
          ...apt,
          isPast: aptDate < now,
        };
      })
      .sort((a, b) => {
        const dateA = buildDateFromTime(a.start_time);
        const dateB = buildDateFromTime(b.start_time);
        return dateB.getTime() - dateA.getTime(); // MAIS RECENTE PRIMEIRO
      });
  }, [appointments]);

  /**
   * Badge — só futuros e só se não abriu ainda
   */
  const upcomingCount = hasSeen
    ? 0
    : orderedAppointments.filter((a) => !a.isPast).length;

  /**
   * Cores por status
   */
  const getColor = (status?: string, isPast?: boolean) => {
    if (isPast) {
      return "bg-muted text-muted-foreground border-muted opacity-70";
    }

    switch (status) {
      case "confirmed":
        return "border-green-200 bg-green-50";
      case "pending":
        return "border-yellow-200 bg-yellow-50";
      case "cancelled":
        return "border-red-200 bg-red-50";
      default:
        return "bg-card";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setHasSeen(true);
      }}
    >
      <DialogTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-muted transition"
          title={isConnected ? "Notificações (tempo real ativo)" : "Notificações"}
        >
          <Bell className="w-5 h-5" />

          {/* Indicador de conexão realtime */}
          {isConnected && providerId && (
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-background" />
          )}

          {upcomingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {upcomingCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notificações de Hoje</DialogTitle>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Tempo real
              </span>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-3">
          {orderedAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento hoje 🎉
            </p>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              {orderedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`
                    p-3
                    rounded-xl
                    border
                    shadow-sm
                    transition
                    ${getColor(apt.status, apt.isPast)}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {apt.client_name || "Desconhecido"}
                    </p>

                    <span className="text-sm font-semibold">
                      {apt.start_time}
                    </span>
                  </div>

                  {apt.service && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {apt.service.name} • {apt.service.duration_minutes} min
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
