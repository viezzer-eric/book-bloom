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
  todayAppointments?: Appointment[];
  providerId?: string;
}

type AppointmentWithMeta = Appointment & {
  isPast: boolean;
};

import { useQueryClient } from "@tanstack/react-query";

export default function NotificationBell({
  todayAppointments = [],
  providerId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewInsert, setHasNewInsert] = useState(false);
  
  const queryClient = useQueryClient();

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔊 Carrega som apenas uma vez
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const playSound = () => {
    audioRef.current?.play().catch(() => {});
  };

  // 🔥 Realtime
  useEffect(() => {
    if (!providerId) return;

    const channel = supabase
      .channel(`appointments-bell-${providerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `provider_id=eq.${providerId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            playSound();
            setHasSeen(false);
            setHasNewInsert(true);

            setTimeout(() => {
              setHasNewInsert(false);
            }, 2000);
          }

          // invalidar queries para refetch automático nos dashboards
          queryClient.invalidateQueries({ queryKey: ["appointments", "provider", providerId] });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [providerId, queryClient]);

  const buildDateFromTime = (time: string) => {
    const [h = "0", m = "0"] = time.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0);
    return d;
  };

  const orderedAppointments = useMemo<AppointmentWithMeta[]>(() => {
    const now = new Date();

    return todayAppointments
      .map((apt) => {
        const aptDate = buildDateFromTime(apt.start_time);
        return {
          ...apt,
          isPast: aptDate < now,
        };
      })
      .sort((a, b) => {
        const dateA = buildDateFromTime(a.start_time);
        const dateB = buildDateFromTime(b.start_time);
        return dateB.getTime() - dateA.getTime();
      });
  }, [todayAppointments]);

  const upcomingCount = hasSeen
    ? 0
    : orderedAppointments.filter((a) => !a.isPast).length;

  const getStatusStyle = (status?: string, isPast?: boolean) => {
    if (isPast) {
      return "bg-muted text-muted-foreground border-muted/50 opacity-70";
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
          className={`
            relative p-2 rounded-full transition-all duration-300
            hover:bg-muted
            ${hasNewInsert ? "animate-bounce" : ""}
          `}
          title="Notificações"
        >
          <Bell
            className={`
              w-5 h-5 transition-transform duration-300
              ${hasNewInsert ? "rotate-12 scale-110" : ""}
            `}
          />

          {isConnected && providerId && (
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-background shadow-sm" />
          )}

          {upcomingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
              bg-primary text-primary-foreground text-xs
              rounded-full flex items-center justify-center
              font-semibold shadow-md animate-pulse">
              {upcomingCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent
        className="
          sm:max-w-[440px]
          rounded-2xl
          border
          bg-background/95
          backdrop-blur-xl
          shadow-2xl
        "
      >
        <DialogHeader className="pt-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Notificações
            </DialogTitle>

            {isConnected && (
              <span className="flex items-center gap-2 text-xs font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Tempo real ativo
              </span>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[420px] pr-3 mt-3">
          {orderedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-4xl mb-3 opacity-60">📅</div>
              <p className="text-sm font-medium">
                Nenhum agendamento hoje
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Novos agendamentos aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              {orderedAppointments.map((apt, index) => (
                <div
                  key={apt.id}
                  className={`
                    group p-4 rounded-xl border
                    shadow-sm
                    transition-all duration-300
                    hover:shadow-lg hover:-translate-y-0.5
                    animate-in fade-in slide-in-from-bottom-2
                    ${getStatusStyle(apt.status, apt.isPast)}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm tracking-tight">
                      {apt.client_name || "Cliente"}
                    </p>

                    <span className="text-sm font-semibold tabular-nums">
                      {apt.start_time}
                    </span>
                  </div>

                  {apt.service && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {apt.service.name} •{" "}
                      {apt.service.duration_minutes} min
                    </p>
                  )}

                  <div className="mt-2 flex justify-end">
                    <span
                      className={`
                        text-[10px] px-2 py-0.5 rounded-full font-medium capitalize
                        ${
                          apt.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : apt.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
