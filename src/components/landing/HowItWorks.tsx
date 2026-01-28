import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Crie Seu Perfil",
    description: "Configure os detalhes do seu negócio, adicione seus serviços e defina seus preços. Leva menos de 5 minutos.",
    details: ["Nome e descrição do negócio", "Catálogo de serviços", "Preços e duração"],
  },
  {
    number: "02",
    title: "Defina Sua Disponibilidade",
    description: "Configure seus horários de trabalho e bloqueie tempo pessoal. Sua agenda sincroniza em tempo real.",
    details: ["Horário de funcionamento", "Intervalos entre atendimentos", "Feriados e folgas"],
  },
  {
    number: "03",
    title: "Compartilhe e Receba Agendamentos",
    description: "Compartilhe seu link exclusivo. Clientes agendam diretamente e ambos recebem confirmações instantâneas.",
    details: ["Página de agendamento compartilhável", "Notificações instantâneas", "Sincronização de agenda"],
  },
];

export function HowItWorks({ id }: { id?: string }) {
  return (
    <section className="py-24 gradient-subtle" id={id}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Comece em minutos
          </h2>
          <p className="text-lg text-muted-foreground">
            Sem configuração complicada. Sem habilidades técnicas necessárias. Apenas agendamento simples que funciona.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}
              
              <div className="relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-display font-bold text-primary/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
