import { Calendar, Clock, Bell, Users, Sparkles, Shield } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "motion/react";

const features = [
  {
    icon: Calendar,
    title: "Calendário Inteligente",
    description:
      "Gerencie sua disponibilidade com um calendário intuitivo. Defina horários de trabalho, bloqueie folgas e sincronize com suas ferramentas.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "01",
  },
  {
    icon: Clock,
    title: "Agendamento em Tempo Real",
    description:
      "Clientes veem sua disponibilidade ao vivo e podem agendar instantaneamente. Sem mais trocas de emails ou ligações.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "02",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description:
      "Reduza faltas com lembretes automáticos por email e SMS enviados para você e seus clientes.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "03",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description:
      "Acompanhe o histórico, preferências e anotações dos clientes. Construa relacionamentos duradouros com atendimento personalizado.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "04",
  },
  {
    icon: Sparkles,
    title: "Página de Agendamento",
    description:
      "Sua página personalizada reflete sua marca. Fácil de compartilhar e fica ótima em qualquer dispositivo.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "05",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description:
      "Segurança de nível empresarial protege seus dados. 99,9% de disponibilidade significa que você nunca perde um agendamento.",
    gradient: "from-teal-400 via-cyan-500 to-emerald-400",
    glowColor: "rgba(20, 184, 166, 0.35)",
    accentColor: "#14b8a6",
    number: "06",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ margin: "-100px" }}
      transition={{ 
        duration: 0.5, 
        delay: (index % 3) * 0.1, 
        ease: "easeOut" 
      }}
      className="group relative rounded-2xl p-[1px] cursor-pointer transition-all duration-500 h-full"
      style={{
        animationDelay: `${index * 0.08}s`,
        background: isHovered
          ? `linear-gradient(135deg, ${feature.accentColor}60, transparent 60%)`
          : "transparent",
      }}
    >
      {/* Glow border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${feature.accentColor}80, transparent 70%)`,
          padding: "1px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Card body */}
      <div
        className="relative rounded-2xl bg-card border border-border overflow-hidden transition-all duration-500 h-full"
        style={{
          boxShadow: isHovered
            ? `0 20px 60px -12px ${feature.glowColor}, 0 0 0 1px ${feature.accentColor}30`
            : "none",
        }}
      >
        {/* Mouse-follow spotlight */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.glowColor}, transparent 70%)`
              : "transparent",
          }}
        />

        {/* Top gradient bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`}
        />

        {/* Content */}
        <div className="relative p-7 flex flex-col h-full">
          {/* Number badge */}
          <span
            className="absolute top-5 right-6 text-xs font-mono font-bold tracking-widest opacity-20 group-hover:opacity-60 transition-opacity duration-300 select-none"
            style={{ color: feature.accentColor }}
          >
            {feature.number}
          </span>

          {/* Icon container */}
          <div className="relative mb-5 w-fit">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, ${feature.accentColor}25, ${feature.accentColor}08)`
                  : "hsl(var(--primary) / 0.08)",
              }}
            >
              <Icon
                className="w-7 h-7 transition-all duration-500"
                style={{
                  color: isHovered ? feature.accentColor : "hsl(var(--primary))",
                  filter: isHovered ? `drop-shadow(0 0 8px ${feature.accentColor}80)` : "none",
                }}
              />
            </div>

            {/* Icon ring pulse on hover */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125"
              style={{
                border: `1px solid ${feature.accentColor}40`,
              }}
            />
          </div>

          {/* Title */}
          <h3
            className="text-lg font-semibold mb-3 transition-all duration-300"
            style={{
              color: isHovered ? feature.accentColor : "hsl(var(--card-foreground))",
            }}
          >
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {feature.description}
          </p>

          {/* Bottom arrow indicator */}
          <div className="mt-5 flex items-center gap-2 overflow-hidden">
            <div
              className={`h-[1px] flex-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-60 transition-all duration-700 origin-left scale-x-0 group-hover:scale-x-100`}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              className="opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-400"
              style={{ color: feature.accentColor }}
            >
              <path
                d="M1 7h12M7 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Features({ id }: { id?: string }) {
  return (
    <section className="py-14 bg-background relative overflow-hidden" id={id}>
      {/* Background ambient blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-20px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Funcionalidades
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
            Tudo que você precisa para{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite]">
                gerenciar agendamentos
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-full" />
            </span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Funcionalidades poderosas pensadas para profissionais que querem gastar menos tempo
            gerenciando e mais tempo fazendo o que amam.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
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