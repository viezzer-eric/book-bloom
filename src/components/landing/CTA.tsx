import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Sparkles, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position values for the container
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse position
  const springX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  // Transform mouse position to gradient position string (Spotlight)
  const background = useTransform(
    [springX, springY],
    ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, hsl(165 60% 50% / 0.15), transparent 80%)`
  );

  // Parallax transforms for icons
  const iconPX = useTransform(springX, (v) => (v - 500) * 0.05);
  const iconPY = useTransform(springY, (v) => (v - 200) * 0.05);
  const iconPXReverse = useTransform(springX, (v) => (v - 500) * -0.03);
  const iconPYReverse = useTransform(springY, (v) => (v - 200) * -0.03);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    mouseX.set(event.clientX - left);
    mouseY.set(event.clientY - top);
  };

  const handleMouseLeave = () => {
    // Reset to center or some neutral position
    mouseX.set(500); 
    mouseY.set(200);
  };

  const floatingIcons = [
    { Icon: Calendar, x: "10%", y: "20%", delay: 0, size: 40, pScale: 1 },
    { Icon: Clock, x: "85%", y: "15%", delay: 0.5, size: 32, pScale: -1 },
    { Icon: Sparkles, x: "15%", y: "75%", delay: 1, size: 28, pScale: 1.2 },
    { Icon: Bell, x: "80%", y: "70%", delay: 1.5, size: 36, pScale: -0.8 },
  ];

  return (
    <section className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-[2.5rem] gradient-hero overflow-hidden group shadow-2xl border border-white/20"
          initial="initial"
          whileHover="hover"
          viewport={{ once: false }}
        >
          {/* ── Background layers ── */}
          
          {/* Noise/Grain Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` 
            }}
          />

          {/* Interactive Spotlight */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-0"
            style={{ background }}
          />

          {/* Secondary animated gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/30 opacity-40" />

          {/* ── Floating Icons (Parallax + Floating) ── */}
          {floatingIcons.map((item, idx) => (
            <motion.div
              key={idx}
              className="absolute pointer-events-none z-0 text-white/20 hidden md:block"
              style={{
                left: item.x,
                top: item.y,
                x: item.pScale > 0 ? iconPX : iconPXReverse,
                y: item.pScale > 0 ? iconPY : iconPYReverse,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                y: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                rotate: { duration: 5 + idx, repeat: Infinity, ease: "easeInOut", delay: item.delay },
              }}
            >
              <item.Icon size={item.size} strokeWidth={1.5} />
            </motion.div>
          ))}

          {/* ── Content ── */}
          <div className="relative z-10 px-8 py-20 md:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Dê o próximo passo na sua carreira
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-8 max-w-4xl mx-auto tracking-tight leading-[1.1]">
                O seu tempo é seu <span className="text-white/60 italic font-medium">maior</span> patrimônio
              </h2>
              
              <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Automatize sua agenda, encante seus clientes e recupere o controle do seu negócio hoje mesmo.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/entrar?mode=register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="hero" 
                      size="xl" 
                      className="group/btn h-16 px-10 text-xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all border border-white/20"
                    >
                      Começar Agora
                      <ArrowRight className="w-6 h-6 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/50 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  Teste grátis de 15 dias
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  Cancele quando quiser
                </span>
              </div>
            </motion.div>
          </div>

          {/* Decorative Corner Gradients */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        </motion.div>
      </div>
    </section>
  );
}
