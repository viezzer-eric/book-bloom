import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Funcionalidades", href: "#funcionalidades" },
  { name: "Como Funciona", href: "#como-funciona" },
  { name: "Valores", href: "#valores" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { user, userRole } = useAuth();
  const { scrollY, scrollYProgress } = useScroll();

  // Header background and shadow transitions on scroll
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const headerBlur = useTransform(scrollY, [0, 50], [0, 8]);
  const headerBorder = useTransform(scrollY, [0, 50], ["transparent", "hsl(var(--border) / 0.4)"]);
  const headerTranslateY = useTransform(scrollY, [0, 100], [0, -4]);

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-80px 0px 0px 0px" }
    );

    navLinks.forEach((link) => {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/entrar";
    return userRole === "provider" ? "/painel" : "/buscar";
  };

  return (
    <motion.header
      style={{
        backgroundColor: `hsl(var(--background) / ${headerOpacity.get() * 0.8})`,
        backdropFilter: `blur(${headerBlur.get()}px)`,
        borderBottomColor: headerBorder,
        y: headerTranslateY
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300"
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-2 group relative z-50"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              setMobileMenuOpen(false);
            }}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow shadow-primary/20 transition-all duration-300"
            >
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                Bookly<span className="text-primary group-hover:text-foreground">.</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1.5 opacity-60">
                Premium Elite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-secondary/20 backdrop-blur-md border border-border/40 p-1.5 rounded-full shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 relative group overflow-hidden",
                    isActive
                      ? "text-primary-foreground bg-primary shadow-glow shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  )}
                >
                  <span className="relative z-10">{link.name}</span>
                  {!isActive && (
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-full bg-primary/5 -z-0 translate-y-full group-hover:translate-y-0 transition-transform"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <div className="w-[1px] h-6 bg-border/40 mx-1" />

            {user ? (
              <Link to={getDashboardLink()} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur-[4px] opacity-20 group-hover:opacity-40 transition duration-500" />
                <Button size="sm" className="relative rounded-full px-6 font-bold flex items-center gap-2 border border-white/10 shadow-glow shadow-primary/10">
                  <div className="ml-[-8px] w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] text-white border border-white/20 shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  Painel
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/entrar">
                  <Button variant="ghost" size="sm" className="rounded-full px-6 text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium transition-all">
                    Entrar
                  </Button>
                </Link>
                <Link to="/entrar?mode=register">
                  <Button size="sm" className="rounded-full px-6 font-bold shadow-glow shadow-primary/25 group/btn bg-gradient-to-r from-primary to-primary/90">
                    Começar Agora
                    <Sparkles className="w-4 h-4 ml-2 group-hover/btn:scale-125 transition-transform text-yellow-300 fill-yellow-300/30" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden relative z-50">
            <ThemeToggle />
            <button
              className="p-2.5 rounded-xl bg-secondary border border-border/60 hover:border-primary/40 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/40 overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-8 flex flex-col gap-6">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-4">Navegação</p>
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 text-lg font-medium text-foreground hover:bg-secondary rounded-2xl transition-all"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {link.name}
                  </motion.a>
                ))}
              </div>

              <div className="pt-6 border-t border-border/40 space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-4">Conta</p>
                {user ? (
                  <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                    <Button size="lg" className="w-full rounded-2xl font-bold">
                      Ir para o Painel
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className="grid gap-3">
                    <Link to="/entrar" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="lg" className="w-full rounded-2xl font-bold border-border/60">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/entrar?mode=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="lg" className="w-full rounded-2xl font-bold shadow-glow shadow-primary/20">
                        Começar Agora
                        <Sparkles className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
