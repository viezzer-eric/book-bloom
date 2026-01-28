import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { providerRepository } from "@/repositories/providerRepository";
import { useEffect, useState } from "react";

export function Hero() {

  const [providersCount, setProvidersCount] = useState(0);

  useEffect(() => {
    providerRepository.countProviders().then(setProvidersCount);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground/90">Agendamento simplificado</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight text-balance">
              Agende com{" "}
              <span className="relative">
                confiança
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 4 150 4 198 10" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed font-body">
              A plataforma intuitiva de agendamento para profissionais de serviços. Gerencie sua agenda, 
              receba reservas e encante seus clientes — tudo em um só lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/entrar?mode=register&role=provider">
                <Button variant="hero" size="xl">
                  Sou Profissional
                </Button>
              </Link>
              <Link to="/entrar?mode=register&role=client">
                <Button variant="heroOutline" size="xl">
                  Sou Cliente
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 text-xs font-medium"
                  >
                    {['A', 'M', 'S', 'J'][i-1]}
                  </div>
                ))}
              </div>
                <div className="text-primary-foreground/80">
                    {providersCount > 0 ? (
                      <>
                        <span className="font-semibold">{providersCount}</span> profissionais confiam em nós
                      </>
                    ) : (
                      <span className="font-semibold">Seja o primeiro Profissional com descontos IMPERDIVEIS</span>
                    )}
                </div>
            </div>
          </div>
          
          {/* Right content - Floating cards */}
          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Main card */}
              <div className="bg-card rounded-2xl shadow-medium p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">Agenda de Hoje</h3>
                    <p className="text-sm text-muted-foreground">3 agendamentos</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { time: '10:00', client: 'Milena Silva', service: 'Unha' },
                    { time: '13:00', client: 'Melissa Salores', service: 'Cabelo' },
                    { time: '15:30', client: 'Vanessa Fernandes', service: 'Maquiagem' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{apt.time}</span>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground truncate">{apt.client}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-soft p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Novo Agendamento!</p>
                    <p className="text-xs text-muted-foreground">Agora mesmo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
