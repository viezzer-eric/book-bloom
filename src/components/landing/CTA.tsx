import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useRef } from "react";

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth springs for mouse position
  const springX = useSpring(mouseX, { stiffness: 500, damping: 50 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 50 });
  
  // Transform mouse position to gradient position string
  const background = useTransform(
    [springX, springY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, hsl(165 45% 50% / 0.8), transparent 80%)`
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(event.clientX - left);
    mouseY.set(event.clientY - top);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative rounded-3xl gradient-hero overflow-hidden group cursor-pointer shadow-medium border border-white/10"
          whileHover="hover"
          initial="initial"
          variants={{
            hover: {
              scale: 1.01,
              transition: { duration: 0.4, ease: "easeOut" }
            }
          }}
        >
          {/* Mouse-follow spotlight gradient */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background }}
          />
          
          {/* Secondary animated gradient layer for extra vibrance */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-accent/40 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"
            variants={{
              hover: {
                scale: 1.2,
                opacity: 0.1,
                transition: { duration: 1.5 },
              },
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
            variants={{
              hover: {
                scale: 1.3,
                rotate: 20,
                transition: { duration: 2 },
              },
            }}
          />
          
          <div className="relative z-10 px-8 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6 max-w-3xl mx-auto tracking-tight">
              Pronto para simplificar seus agendamentos?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
              Junte-se a milhares de profissionais que economizam horas toda semana com nossa plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/entrar?mode=register">
                <Button variant="hero" size="xl" className="group/btn shadow-glow hover:shadow-xl transition-all">
                  Comece Agora
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-primary-foreground/60 mt-6 font-medium">
              Sem cartão de crédito · Teste grátis de 14 dias · Cancele quando quiser
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
