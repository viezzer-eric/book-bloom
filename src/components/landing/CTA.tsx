import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl gradient-hero overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 px-8 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
              Pronto para simplificar seus agendamentos?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
              Junte-se a milhares de profissionais que economizam horas toda semana com nossa plataforma intuitiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/entrar?mode=register">
                <Button variant="hero" size="xl" className="group">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-primary-foreground/60 mt-6">
              Sem cartão de crédito · Teste grátis de 14 dias · Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
