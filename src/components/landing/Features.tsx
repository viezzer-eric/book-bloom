import { Calendar, Clock, Bell, Users, Sparkles, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calendar,
    title: "Calendário Inteligente",
    description: "Gerencie sua disponibilidade com um calendário intuitivo. Defina horários de trabalho, bloqueie folgas e sincronize.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "01",
  },
  {
    icon: Clock,
    title: "Agendamento em Tempo Real",
    description: "Clientes veem sua disponibilidade ao vivo e agendam instantaneamente sem trocas de e-mails.",
    gradient: "from-blue-400 via-indigo-500 to-cyan-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "02",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description: "Reduza faltas com lembretes automáticos por email e SMS enviados para você e seus clientes.",
    gradient: "from-amber-400 via-orange-500 to-yellow-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "03",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Acompanhe o histórico, preferências e anotações dos clientes. Construa relacionamentos duradouros.",
    gradient: "from-rose-400 via-pink-500 to-coral-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "04",
  },
  {
    icon: Sparkles,
    title: "Página de Agendamento",
    description: "Sua página personalizada reflete sua marca. Fácil de compartilhar e responsiva.",
    gradient: "from-violet-400 via-purple-500 to-fuchsia-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "05",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Segurança de nível empresarial protege seus dados com 99,9% de disponibilidade.",
    gradient: "from-emerald-400 via-green-500 to-teal-400",
    glowColor: "rgba(16, 185, 129, 0.35)",
    accentColor: "#10b981",
    number: "06",
  },
];

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-3xl p-[1px] cursor-pointer transition-all duration-500 h-full overflow-hidden"
    >
      <div
        className="relative rounded-[23px] bg-card border border-border/50 overflow-hidden transition-all duration-500 h-full shadow-lg group-hover:shadow-2xl group-hover:border-primary/20"
        style={{
          boxShadow: isHovered
            ? `0 20px 60px -12px ${feature.glowColor}, 0 0 0 1px ${feature.accentColor}20`
            : "none",
        }}
      >
        {/* Spotlight Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.glowColor}, transparent 80%)`,
          }}
        />

        <div className="relative p-8 flex flex-col h-full z-10">
          <span
            className="absolute top-6 right-8 text-[10px] font-mono font-bold tracking-[0.3em] opacity-20 group-hover:opacity-60 transition-opacity"
            style={{ color: feature.accentColor }}
          >
            {feature.number}
          </span>

          <div className="mb-6 relative w-fit">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner overflow-hidden"
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, ${feature.accentColor}15, transparent)`
                  : "hsl(var(--secondary))",
              }}
            >
              <Icon
                className="w-8 h-8 transition-all duration-500"
                style={{
                  color: isHovered ? feature.accentColor : "hsl(var(--muted-foreground))",
                  filter: isHovered ? `drop-shadow(0 0 8px ${feature.accentColor}80)` : "none",
                }}
              />
            </div>
          </div>

          <h3
            className="text-xl font-bold mb-4 transition-colors duration-300"
            style={{ color: isHovered ? feature.accentColor : "hsl(var(--foreground))" }}
          >
            {feature.title}
          </h3>

          <p className="text-muted-foreground leading-relaxed text-sm flex-1">
            {feature.description}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className={`h-[1px] flex-1 bg-gradient-to-r ${feature.gradient} opacity-20 group-hover:opacity-100 transition-all duration-700`} />
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: feature.accentColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Features({ id }: { id?: string }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(features.length / ITEMS_PER_PAGE);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setPage((prev) => (prev + newDirection + totalPages) % totalPages);
  }, [totalPages]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => paginate(1), 8000);
    return () => clearInterval(timer);
  }, [paginate, isPaused]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
    }),
  };

  const currentFeatures = features.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <section
      className="py-16 md:py-32 bg-background relative overflow-hidden"
      id={id}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background visual flair */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-6 shadow-sm shadow-primary/10">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Vantagens Elite
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6 leading-[1.1]"
            >
              Potencialize sua <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">performance</span>
            </motion.h2>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => paginate(-1)}
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-all hover:scale-110 active:scale-95 shadow-xl group/btn"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-all hover:scale-110 active:scale-95 shadow-xl group/btn"
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Progress Indicators & Nav Spacer */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > page ? 1 : -1);
                  setPage(idx);
                }}
                className="group relative h-4 flex items-center justify-center focus:outline-none"
              >
                <div className={cn(
                  "h-1 rounded-full transition-all duration-500 relative overflow-hidden",
                  idx === page ? "bg-primary w-12" : "bg-muted w-6 hover:bg-muted-foreground/40"
                )}>
                  {idx === page && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="text-[10px] font-mono font-bold tracking-widest opacity-40 uppercase">
            Página {page + 1} / {totalPages}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative min-h-[480px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.4 },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full"
            >
              {currentFeatures.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>
    </section>
  );
}