import { Calendar, Instagram, Linkedin, Twitter, Github, Send, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "motion/react";

const footerLinks = {
  produto: [
    { name: "Funcionalidades", href: "#features" },
    { name: "Preços", href: "#valores" },
    { name: "Como Funciona", href: "#how-it-works" },
    { name: "Agendamento", href: "#booking" },
  ],
  empresa: [
    { name: "Sobre Nós", href: "/sobre" },
    { name: "Blog", href: "/blog" },
    { name: "Carreiras", href: "/carreiras" },
    { name: "Contato", href: "/contato" },
  ],
  suporte: [
    { name: "Central de Ajuda", href: "/ajuda" },
    { name: "Privacidade", href: "/privacidade" },
    { name: "Termos de Uso", href: "/termos" },
    { name: "Status", href: "/status" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Github, href: "#", label: "Github" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      } as any
    },
  };

  return (
    <footer className="relative bg-background pt-24 pb-12 overflow-hidden border-t border-border/40">
      {/* ── Background Elements ── */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Dynamic Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20"
        >
          {/* Brand & Newsletter Section */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 group w-fit">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow shadow-primary/20"
                >
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </motion.div>
                <span className="text-2xl font-display font-bold text-foreground tracking-tight">
                  Bookly<span className="text-primary">.</span>
                </span>
              </Link>

              <p className="text-muted-foreground leading-relaxed max-w-sm text-base">
                A plataforma premium para profissionais que buscam excelência no gerenciamento de tempo e atendimento ao cliente.
              </p>
            </div>

            {/* Newsletter Input */}
            <div className="space-y-4 max-w-md">
              <h4 className="text-sm font-semibold font-display uppercase tracking-widest text-foreground/80">
                Fique por dentro das novidades
              </h4>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within/input:bg-primary/10 transition-colors" />
                <div className="relative flex items-center bg-card border border-border/60 hover:border-primary/30 focus-within:border-primary/50 p-1.5 rounded-2xl transition-all shadow-sm">
                  <div className="pl-4 pr-2 text-muted-foreground">
                    <Send className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail..."
                    className="flex-1 bg-transparent border-none text-sm py-2 focus:ring-0 placeholder:text-muted-foreground/60"
                  />
                  <Button size="sm" className="rounded-xl px-4 font-medium group/btn">
                    Assinar
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-foreground font-bold font-display uppercase text-xs tracking-[0.2em]">Produto</h4>
              <ul className="space-y-4">
                {footerLinks.produto.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group/link text-sm"
                    >
                      <span className="h-px w-0 bg-primary mr-0 group-hover/link:w-3 group-hover/link:mr-2 opacity-0 group-hover/link:opacity-100 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-foreground font-bold font-display uppercase text-xs tracking-[0.2em]">Empresa</h4>
              <ul className="space-y-4">
                {footerLinks.empresa.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group/link text-sm"
                    >
                      <span className="h-px w-0 bg-primary mr-0 group-hover/link:w-3 group-hover/link:mr-2 opacity-0 group-hover/link:opacity-100 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="hidden md:block space-y-6">
              <h4 className="text-foreground font-bold font-display uppercase text-xs tracking-[0.2em]">Suporte</h4>
              <ul className="space-y-4">
                {footerLinks.suporte.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group/link text-sm"
                    >
                      <span className="h-px w-0 bg-primary mr-0 group-hover/link:w-3 group-hover/link:mr-2 opacity-0 group-hover/link:opacity-100 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pt-12 border-t border-border/40"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-[13px] text-muted-foreground font-medium">
                © {currentYear} Bookly Inc. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-4 text-[13px] text-muted-foreground/60 border-l border-border/40 pl-6 hidden md:flex">
                <Link to="/" className="hover:text-foreground transition-colors">Segurança</Link>
                <div className="w-1 h-1 rounded-full bg-border" />
                <Link to="/" className="hover:text-foreground transition-colors">Acessibilidade</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center items-center gap-2 group cursor-default">
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold group-hover:text-primary/60 transition-colors">
              Feito com
            </span>
            <Heart className="w-3 h-3 text-accent fill-accent/40 group-hover:fill-accent group-hover:scale-125 transition-all animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold group-hover:text-primary/60 transition-colors">
              para empreendedores de elite
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
