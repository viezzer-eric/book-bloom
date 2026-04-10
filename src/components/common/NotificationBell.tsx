"use client";
import { Bell, BellRing, Calendar, Check, Clock, X } from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Appointment = {
  id: string;
  client_name: string;
  start_time: string;
  status: string;
  service?: { name: string; duration_minutes: number } | null;
  appointment_date?: string;
};

interface Props {
  todayAppointments?: Appointment[];
  providerId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  confirmed: { label: "Confirmado", color: "text-emerald-600", dot: "bg-emerald-500" },
  pending: { label: "Pendente", color: "text-amber-600", dot: "bg-amber-400" },
  cancelled: { label: "Cancelado", color: "text-red-500", dot: "bg-red-400" },
  completed: { label: "Concluído", color: "text-slate-500", dot: "bg-slate-400" },
};

function fmt(time: string) {
  return time.slice(0, 5);
}

function isPast(apt: Appointment) {
  const now = new Date();
  const [h, m] = apt.start_time.split(":").map(Number);
  const d = apt.appointment_date
    ? new Date(apt.appointment_date + "T" + apt.start_time)
    : new Date();
  if (!apt.appointment_date) { d.setHours(h, m, 0, 0); }
  return d < now;
}

// ─── Seen IDs persistence ─────────────────────────────────────────────────────

function loadSeenIds(providerId?: string): Set<string> {
  if (!providerId) return new Set();
  try {
    const raw = localStorage.getItem(`notif_seen_${providerId}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveSeenIds(providerId: string, ids: Set<string>) {
  try {
    localStorage.setItem(`notif_seen_${providerId}`, JSON.stringify([...ids]));
  } catch { /* noop */ }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell({ todayAppointments = [], providerId }: Props) {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(todayAppointments);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => loadSeenIds(providerId));
  const [isConnected, setIsConnected] = useState(false);
  const [ringing, setRinging] = useState(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // ── Audio ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.7;
  }, []);

  const playSound = useCallback(() => {
    audioRef.current?.play().catch(() => { });
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchToday = useCallback(async () => {
    if (!providerId) return;
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("appointments")
      .select("*, service:services(name, duration_minutes)")
      .eq("provider_id", providerId)
      .eq("appointment_date", today)
      .order("start_time", { ascending: true });
    if (!error && data) setAppointments(data as Appointment[]);
  }, [providerId]);

  // ── Realtime subscription ─────────────────────────────────────────────────

  useEffect(() => {
    if (!providerId) { setAppointments(todayAppointments); return; }

    fetchToday();

    const ch = supabase
      .channel(`notif-bell-${providerId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "appointments",
        filter: `provider_id=eq.${providerId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          playSound();
          setRinging(true);
          setTimeout(() => setRinging(false), 2500);
        }
        fetchToday();
      })
      .subscribe((s) => setIsConnected(s === "SUBSCRIBED"));

    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); channelRef.current = null; };
  }, [providerId, fetchToday, playSound]);

  useEffect(() => {
    if (!providerId) setAppointments(todayAppointments);
  }, [todayAppointments, providerId]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const unseen = useMemo(
    () => appointments.filter((a) => !seenIds.has(a.id)),
    [appointments, seenIds]
  );

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );
  }, [appointments]);

  // ── Open / mark seen ──────────────────────────────────────────────────────

  function handleOpen(next: boolean) {
    setOpen(next);
    if (next && unseen.length > 0 && providerId) {
      const newSeen = new Set([...seenIds, ...unseen.map((a) => a.id)]);
      setSeenIds(newSeen);
      saveSeenIds(providerId, newSeen);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative" style={{ fontFamily: "'DM Sans', 'Instrument Sans', system-ui, sans-serif" }}>

      {/* ── Bell trigger ── */}
      <motion.button
        ref={bellRef}
        onClick={() => handleOpen(!open)}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-slate-100"
        aria-label="Notificações"
      >
        {/* glow ring when ringing */}
        <AnimatePresence>
          {ringing && (
            <motion.span
              key="glow"
              initial={{ opacity: 0.8, scale: 0.8 }}
              animate={{ opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0 rounded-xl bg-amber-400/40"
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          animate={ringing ? { rotate: [0, -18, 18, -14, 14, -6, 6, 0] } : { rotate: 0 }}
          transition={ringing ? { duration: 0.7, ease: "easeInOut" } : {}}
        >
          {ringing
            ? <BellRing className="h-5 w-5 text-amber-500" />
            : <Bell className={`h-5 w-5 ${open ? "text-slate-900" : "text-slate-500"}`} />
          }
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {unseen.length > 0 && !open && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow"
            >
              {unseen.length > 9 ? "9+" : unseen.length}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Connected dot */}
        {isConnected && providerId && (
          <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
        )}
      </motion.button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => handleOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              style={{ boxShadow: "0 20px 60px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Agenda de hoje</p>
                    <p className="text-xs text-slate-400">
                      {appointments.length === 0
                        ? "Sem agendamentos"
                        : `${appointments.length} agendamento${appointments.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      ao vivo
                    </span>
                  )}
                  <button
                    onClick={() => handleOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[380px] overflow-y-auto overscroll-contain">
                {sorted.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                      <Calendar className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Nenhum agendamento hoje</p>
                      <p className="mt-0.5 text-xs text-slate-400">Novos agendamentos aparecerão aqui</p>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50 px-2 py-2">
                    {sorted.map((apt, i) => {
                      const past = isPast(apt);
                      const isNew = !seenIds.has(apt.id);
                      const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.pending;

                      return (
                        <motion.li
                          key={apt.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`group relative flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${past ? "opacity-50" : "hover:bg-slate-50"
                            }`}
                        >
                          {/* New indicator */}
                          {isNew && !past && (
                            <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-500" />
                          )}

                          {/* Time block */}
                          <div className="flex w-12 shrink-0 flex-col items-center justify-start pt-0.5">
                            <span className="text-sm font-bold tabular-nums text-slate-800">
                              {fmt(apt.start_time)}
                            </span>
                            <div className={`mt-1 h-1 w-1 rounded-full ${cfg.dot}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {apt.client_name || "Cliente"}
                            </p>
                            {apt.service && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3 shrink-0" />
                                {apt.service.name} · {apt.service.duration_minutes} min
                              </p>
                            )}
                          </div>

                          {/* Status chip */}
                          <div className={`shrink-0 text-[10px] font-semibold ${cfg.color}`}>
                            {past
                              ? <span className="flex items-center gap-0.5 text-slate-400"><Check className="h-3 w-3" /> Passou</span>
                              : cfg.label
                            }
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {appointments.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-3">
                  <p className="text-center text-[11px] text-slate-400">
                    {appointments.filter((a) => !isPast(a) && a.status !== "cancelled").length} agendamento(s) restante(s) hoje
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}