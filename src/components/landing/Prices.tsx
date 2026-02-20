import React from "react";

const plans = [
  {
    title: "Teste Gratuito",
    price: "15 dias grátis",
    description:
      "Experimente todas as funcionalidades da plataforma durante 15 dias, sem compromisso e sem necessidade de cartão.",
    highlight: false,
    badge: null,
  },
  {
    title: "Plano Mensal",
    price: "R$ 50/mês",
    description:
      "Utilize o sistema sem limitações, com acesso completo a todas as funcionalidades para gerenciar seu negócio.",
    highlight: true,
    badge: "Melhor Oferta",
  },
  {
    title: "Plano Mensal + Controle Financeiro",
    price: "R$ 80/mês",
    description:
      "Tenha acesso ao módulo completo de controle financeiro para organizar receitas, despesas e acompanhar o crescimento do seu negócio.",
    highlight: false,
    badge: null,
  },
];

export default function PricingSection({ id }: { id?: string }) {
  return (
    <section id={id ?? "valores"} className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos e Valores
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu momento e comece a organizar seu
            negócio de forma simples e eficiente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl shadow-md p-8 bg-background border transition-all duration-300 hover:shadow-xl ${
                plan.highlight
                  ? "border-primary scale-105"
                  : "border-border"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-semibold mb-4 mt-2">
                {plan.title}
              </h3>

              <p className="text-2xl font-bold mb-6">{plan.price}</p>

              <p className="text-muted-foreground mb-6">
                {plan.description}
              </p>

              <button
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:opacity-90"
                }`}
              >
                Começar agora
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
