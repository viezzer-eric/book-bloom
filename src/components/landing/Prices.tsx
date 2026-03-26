"use client";
import React, { useRef, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { CheckCheck } from "lucide-react";
import { motion } from "motion/react";

const plans = [
  {
    name: "Teste Gratuito",
    description: "Experimente as funcionalidades basicas da plataforma durante 15 dias, sem compromisso.",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Começar agora",
    buttonVariant: "outline" as const,
    features: [
      "Acesso restrito",
      "15 dias de duração",
    ],
    includes: [
      "Acesso restrito",
      "Controle de agendamentos"
    ],
  },
  {
    name: "Plano Mensal",
    description: "Utilize o sistema sem limitações, com acesso completo para gerenciar seu negócio.",
    price: 50,
    yearlyPrice: 504,
    popular: true,
    badge: "Melhor Oferta",
    buttonText: "Começar agora",
    buttonVariant: "default" as const,
    features: [
      "Acesso ilimitado",
      "Todas as funcionalidades",
      "Suporte prioritário",
    ],
    includes: [
      "Acesso ilimitado",
      "Gestão de clientes",
      "Controle de agendamentos"
    ],
  },
  {
    name: "Mensal + Financeiro",
    description: "Módulo completo de controle financeiro para organizar receitas e despesas.",
    price: 80,
    yearlyPrice: 806.40,
    buttonText: "Começar agora",
    buttonVariant: "outline" as const,
    features: [
      "Controle financeiro",
      "Fluxo de caixa",
      "Relatórios de lucro",
    ],
    includes: [
      "Tudo no Mensal, mais:",
      "Gestão de despesas",
      "Gráficos financeiros",
      "Suporte prioritário",
    ],
  },
];

interface PricingSwitchProps {
  isYearly: boolean;
  onSwitch: (value: boolean) => void;
  className?: string;
}

const PricingSwitch = ({ isYearly, onSwitch, className }: PricingSwitchProps) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-secondary/50 border border-border p-1.5 backdrop-blur-sm">
        <button
          onClick={() => onSwitch(false)}
          className={cn(
            "relative z-10 w-32 h-11 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
            !isYearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {!isYearly && (
            <motion.span
              layoutId="pricing-pill"
              className="absolute inset-0 rounded-full bg-primary shadow-lg"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-20">Mensal</span>
        </button>

        <button
          onClick={() => onSwitch(true)}
          className={cn(
            "relative z-10 w-40 h-11 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300 gap-2",
            isYearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isYearly && (
            <motion.span
              layoutId="pricing-pill"
              className="absolute inset-0 rounded-full bg-primary shadow-lg"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-20 flex items-center gap-2">
            Anual
            <span className={cn(
              "px-2 py-0.5 text-[10px] rounded-full font-black uppercase tracking-tighter",
              isYearly ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}>
              -16%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection({ id }: { id?: string }) {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <section
      id={id ?? "valores"}
      className="px-4 py-32 min-h-screen max-w-7xl mx-auto relative overflow-hidden"
      ref={pricingRef}
    >
      {/* Billing Cycle Toggle - Simplified and Robust */}
      <div className="flex justify-center mb-16 relative z-30">
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch
            isYearly={isYearly}
            onSwitch={setIsYearly}
            className="shrink-0"
          />
        </TimelineContent>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent
            as="div"
            key={plan.name}
            animationNum={index + 2}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "relative flex-col flex h-full transition-all duration-500 hover:shadow-glow border-border",
                plan.popular
                  ? "scale-105 shadow-medium border-primary/50 bg-gradient-card"
                  : "bg-background hover:border-primary/30"
              )}
            >
              <CardContent className="pt-8 px-8">
                <div className="space-y-4 pb-6">
                  {plan.popular && (
                    <div className="mb-2">
                      <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        {plan.badge || "Popular"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? (
                        "Grátis"
                      ) : (
                        <>
                          <span className="text-2xl mr-1 font-medium italic">R$</span>
                          <NumberFlow
                            format={{
                              minimumFractionDigits: 0,
                            }}
                            value={isYearly ? plan.yearlyPrice : plan.price}
                            className="text-5xl font-bold tracking-tight"
                          />
                        </>
                      )}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-2 text-sm">
                        /{isYearly ? "ano" : "mês"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display">
                    {plan.name.replace("Mensal", isYearly ? "Anual" : "Mensal")}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                  {plan.description.replace("sistema sem limitações", isYearly ? "sistema completo com desconto" : "sistema sem limitações")}
                </p>

                <div className="space-y-4 pt-6 border-t border-border/50">
                  <h4 className="font-semibold text-sm text-foreground uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    {plan.includes[0].replace("Mensal", isYearly ? "Anual" : "Mensal")}
                  </h4>
                  <ul className="space-y-3">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                          <CheckCheck className="h-3 w-3 text-primary stroke-[3]" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 mt-auto">
                <button
                  className={cn(
                    "w-full py-4 text-base font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95",
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-medium hover:shadow-glow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                  )}
                >
                  {plan.buttonText}
                </button>
              </CardFooter>
            </Card>
          </TimelineContent>
        ))}
      </div>

      {/* Background blobs for aesthetics */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
}
