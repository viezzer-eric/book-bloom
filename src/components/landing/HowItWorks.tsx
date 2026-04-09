import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";


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
    <section className="pt-0 pb-16 md:pb-24 bg-background/50 relative overflow-hidden" id={id}>
      {/* ── Animated background (matching Hero) ── */}
      <div className="absolute inset-0 -z-10">
        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Mesh gradient blobs */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 90% 10%, hsl(165 35% 45% / 0.05) 0%, transparent 70%),
              radial-gradient(ellipse 50% 50% at 10% 90%, hsl(15 85% 60% / 0.05) 0%, transparent 70%)
            `,
          }}
        />

        {/* Floating animated orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(165 35% 45%) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(15 85% 60%) 0%, transparent 70%)" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header (aligned with Hero) */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, margin: "-100px" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold tracking-widest uppercase mb-5 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Como Funciona
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, margin: "-100px" }}
            className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight"
          >
            Sua jornada para o{" "}
            <span className="text-primary italic">sucesso</span> começa aqui
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false, margin: "-100px" }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Configuração rápida, agenda inteligente e agendamentos simples.
            Tudo pensado para que você foque na excelência do seu atendimento.
          </motion.p>
        </div>

        {/* Feature grid with staggered animations */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-100px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
              }
            }
          }}
          className="grid lg:grid-cols-3 gap-8 relative"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="group relative"
            >
              {/* Connector line with pulse animation */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[80%] w-[40%] h-[2px] z-0 overflow-hidden pointer-events-none">
                  <motion.div
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                  />
                  <div className="absolute inset-0 bg-primary/10" />
                </div>
              )}

              <div className="relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-8 transition-all duration-500 hover:border-primary/30 hover:bg-card/60 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] h-full overflow-hidden">
                {/* Mouse-follow glow effect (simulated on hover) */}
                <div className="absolute -inset-20 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)]" />

                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shadow-lg shadow-primary/20">
                    {step.number}
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors duration-300" />
                </div>

                <h3 className="text-2xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-3 text-sm text-muted-foreground group/item">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/item:bg-primary transition-colors" />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Arrow indicator that appears on hover */}
                <div className="mt-8 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider">Saiba mais</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

