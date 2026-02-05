import { Bell } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  todayAppointments: Appointment[];
}

type AppointmentWithMeta = Appointment & {
  isPast: boolean;
};

export default function NotificationBell({ todayAppointments }: Props) {
  const [open, setOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

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

    return todayAppointments
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
  }, [todayAppointments]);

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
        <button className="relative p-2 rounded-full hover:bg-muted transition">
          <Bell className="w-5 h-5" />

          {upcomingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {upcomingCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Notificações</DialogTitle>
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
