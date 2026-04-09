import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowRight, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { providerRepository } from "@/repositories/providerRepository";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";

const FLOATING_TAGS = [
  "Cabelo & Beleza",
  "Consultoria",
  "Fisioterapia",
  "Personal Trainer",
  "Advocacia",
  "Nutrição",
  "Psicologia",
  "Fotografia",
];

const TESTIMONIALS = [
  { name: "Ana S.", role: "Cabeleireira", text: "Reduzi 3h de admin por dia" },
  { name: "Carlos M.", role: "Personal Trainer", text: "Clientes adoram o link" },
  { name: "Lucia P.", role: "Nutricionista", text: "Zero faltas com lembretes" },
];

const STATS = [
  { value: "98%", label: "satisfação" },
  { value: "3h", label: "economizadas/dia" },
  { value: "0", label: "faltas com lembretes" },
];

export function Hero() {
  const [providersCount, setProvidersCount] = useState(0);
  const [activeTag, setActiveTag] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
 
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
 
  // Dampen the effect on mobile (or disable it)
  const orb1X = useTransform(springX, [0, 1], isMobile ? [-5, 5] : [-30, 30]);
  const orb1Y = useTransform(springY, [0, 1], isMobile ? [-3, 3] : [-20, 20]);
  const orb2X = useTransform(springX, [0, 1], isMobile ? [5, -5] : [20, -20]);
  const orb2Y = useTransform(springY, [0, 1], isMobile ? [3, -3] : [15, -15]);
 
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    providerRepository.countProviders().then(setProvidersCount);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTag((prev) => (prev + 1) % FLOATING_TAGS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isMobile) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width);
    mouseY.set((e.clientY - top) / height);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100vh] flex items-center overflow-hidden bg-background"
      style={{ isolation: "isolate" }}
    >
      {/* ── Animated background ── */}
      <div className="absolute inset-0 -z-10">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 10% 20%, hsl(165 35% 45% / 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 90% 80%, hsl(15 85% 60% / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 70% 70% at 50% 50%, hsl(180 40% 35% / 0.04) 0%, transparent 70%)
            `,
          }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(200 25% 15%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(200 25% 15%) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Floating orbs */}
        <motion.div
           className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
           animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.18, 0.12] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           style={{
             x: orb1X,
             y: orb1Y,
             background: "radial-gradient(circle, hsl(165 35% 45%) 0%, transparent 70%)",
             filter: "blur(60px)",
           }}
         />
         <motion.div
           className="absolute bottom-1/4 left-1/5 w-[400px] h-[400px] rounded-full"
           animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.14, 0.08] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           style={{
             x: orb2X,
             y: orb2Y,
             background: "radial-gradient(circle, hsl(15 85% 60%) 0%, transparent 70%)",
             filter: "blur(80px)",
           }}
         />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-[1fr_480px] gap-16 items-center">

          {/* ── LEFT: Text content ── */}
          <div className="space-y-8 max-w-2xl">

            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary backdrop-blur-sm">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
                Para profissionais de serviço
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.05] tracking-tight">
                Sua agenda,{" "}
                <span className="relative inline-block">
                  <span className="text-primary">finalmente</span>
                  <motion.svg
                    className="absolute -bottom-1 left-0 w-full overflow-visible"
                    viewBox="0 0 200 10"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                  >
                    <motion.path
                      d="M2 7 C40 3 100 3 198 7"
                      stroke="hsl(15 85% 60%)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
              </h1>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.05] tracking-tight">
                trabalhando{" "}
                <span className="relative">
                  <span className="text-foreground/40">por você.</span>
                </span>
              </h1>
            </motion.div>

            {/* Rotating profession tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <span className="text-muted-foreground text-sm">Perfeito para:</span>
              <div className="relative h-7 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeTag}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="inline-block px-3 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium whitespace-nowrap"
                  >
                    {FLOATING_TAGS[activeTag]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              Compartilhe um link, receba agendamentos 24h e foque no que realmente importa:
              atender seus clientes com excelência.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Link to="/entrar?mode=register&role=provider">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="xl"
                    className="group w-full sm:w-auto relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_24px_hsl(165_35%_45%/0.35)] hover:shadow-[0_8px_32px_hsl(165_35%_45%/0.50)] transition-shadow duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Começar grátis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-6 pt-4 border-t border-border/50"
            >
              <div className="flex -space-x-2.5">
                {["#4ade80", "#34d399", "#22d3ee", "#60a5fa"].map((color, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.08, type: "spring", stiffness: 300 }}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {["A", "M", "S", "J"][i]}
                  </motion.div>
                ))}
              </div>

              {providersCount > 0 ? (
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{providersCount}</span>{" "}
                  profissionais confiam no Bookly
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-foreground">Seja o primeiro</span>
                  {" "}— com desconto especial
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT: Interactive card stack ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* ── Main appointment card ── */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative bg-card border border-border/60 rounded-2xl p-6 shadow-[0_20px_60px_hsl(200_25%_15%/0.10)]"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">Hoje · Terça</p>
                    <p className="text-xs text-muted-foreground">3 agendamentos</p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_hsl(142_76%_36%/0.6)]"
                />
              </div>

              {/* Appointment list */}
              <div className="space-y-2.5">
                {[
                  { time: "10:00", name: "Milena Silva", service: "Hidratação", color: "bg-purple-400/15 text-purple-600" },
                  { time: "13:00", name: "Melissa Salores", service: "Corte", color: "bg-blue-400/15 text-blue-600" },
                  { time: "15:30", name: "Vanessa F.", service: "Maquiagem", color: "bg-pink-400/15 text-pink-600" },
                ].map((apt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors duration-200 group cursor-default"
                  >
                    <span className="text-sm font-semibold text-primary tabular-nums w-12 shrink-0">{apt.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{apt.name}</p>
                      <p className="text-xs text-muted-foreground">{apt.service}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apt.color}`}>
                      confirmado
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Mini stats row */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-border/50">
                {STATS.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-lg font-bold text-foreground font-display">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Floating: New booking notification ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
              className="absolute -top-5 -right-8 bg-card border border-border/60 rounded-xl p-3 shadow-medium w-52"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-card-foreground">Novo agendamento!</p>
                  <p className="text-[10px] text-muted-foreground">agora mesmo · Carla R.</p>
                </div>
                <motion.div
                  animate={{ scale: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="w-2 h-2 rounded-full bg-accent shrink-0"
                />
              </motion.div>
            </motion.div>

            {/* ── Floating: Testimonial ticker ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="absolute -bottom-6 -left-8 bg-card border border-border/60 rounded-xl p-3.5 shadow-medium w-56 overflow-hidden"
            >
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    "{TESTIMONIALS[testimonialIdx].text}"
                  </p>
                  <p className="text-[10px] font-semibold text-card-foreground mt-1.5">
                    {TESTIMONIALS[testimonialIdx].name} · {TESTIMONIALS[testimonialIdx].role}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ── Floating: Link share card ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 180 }}
              className="absolute top-1/2 -left-12 -translate-y-1/2 bg-card border border-border/60 rounded-xl p-3 shadow-medium"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-card-foreground whitespace-nowrap">bookly.app/você</p>
                  <p className="text-[9px] text-green-500 font-medium">✓ Link ativo</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}