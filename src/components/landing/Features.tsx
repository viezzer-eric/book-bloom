import { Calendar, Clock, Bell, Users, Sparkles, Shield } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Calendário Inteligente",
    description: "Gerencie sua disponibilidade com um calendário intuitivo. Defina horários de trabalho, bloqueie folgas e sincronize com suas ferramentas.",
  },
  {
    icon: Clock,
    title: "Agendamento em Tempo Real",
    description: "Clientes veem sua disponibilidade ao vivo e podem agendar instantaneamente. Sem mais trocas de emails ou ligações.",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description: "Reduza faltas com lembretes automáticos por email e SMS enviados para você e seus clientes.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Acompanhe o histórico, preferências e anotações dos clientes. Construa relacionamentos duradouros com atendimento personalizado.",
  },
  {
    icon: Sparkles,
    title: "Página de Agendamento",
    description: "Sua página personalizada reflete sua marca. Fácil de compartilhar e fica ótima em qualquer dispositivo.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Segurança de nível empresarial protege seus dados. 99,9% de disponibilidade significa que você nunca perde um agendamento.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Tudo que você precisa para gerenciar agendamentos
          </h2>
          <p className="text-lg text-muted-foreground">
            Funcionalidades poderosas pensadas para profissionais de serviços que querem gastar menos tempo gerenciando e mais tempo fazendo o que amam.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
