import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, Loader2, MessageCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "5511961380749"; 
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Tenho interesse em me cadastrar como prestador de serviço na plataforma Bookly!"
);

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get("mode") === "register";
  const defaultRole = searchParams.get("role") as "provider" | "client" | null;
  
  const [mode, setMode] = useState<"login" | "register">(isRegister ? "register" : "login");
  const [role, setRole] = useState<"provider" | "client">(defaultRole || "client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "register") {
        if (formData.password !== formData.confirmPassword) {
          toast.error("As senhas não coincidem");
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName, "client");
        
        if (error) {
          toast.error(error.message || "Erro ao criar conta");
        } else {
          toast.success("Conta criada com sucesso!");
          navigate("/meus-agendamentos");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/painel");
        }
      }
    } catch (err) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  // Provider registration flow - show WhatsApp contact
  const renderProviderFlow = () => (
    <div className="space-y-6 text-center">
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Cadastro de Prestadores
        </h3>
        <p className="text-muted-foreground mb-6">
          Para se cadastrar como prestador de serviços, entre em contato conosco pelo WhatsApp. 
          O cadastro é feito manualmente e os valores e condições são acertados diretamente.
        </p>
        <Button 
          onClick={handleWhatsAppContact}
          className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
          size="lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Falar no WhatsApp
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Após o contato, sua conta será criada e você receberá as credenciais de acesso.
      </p>
    </div>
  );

  // Client registration form
  const renderClientForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Criar conta
      </Button>
    </form>
  );

  // Login form
  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Entrar
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-semibold text-foreground">Bookly</span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {mode === "login" ? "Bem-vindo de volta" : 
                role === "provider" ? "Seja um Prestador" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login" 
                ? "Entre com suas credenciais para acessar sua conta" 
                : role === "provider"
                  ? "Entre em contato para se cadastrar"
                  : "Preencha os dados abaixo para começar"
              }
            </p>
          </div>

          {/* Role Selection (only for register) */}
          {mode === "register" && (
            <div className="space-y-3">
              <Label className="text-foreground">Tipo de conta</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    role === "provider"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="font-semibold text-foreground">Prestador</p>
                  <p className="text-sm text-muted-foreground">Ofereço serviços</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    role === "client"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="font-semibold text-foreground">Cliente</p>
                  <p className="text-sm text-muted-foreground">Quero agendar</p>
                </button>
              </div>
            </div>
          )}

          {/* Form Content */}
          {mode === "login" 
            ? renderLoginForm()
            : role === "provider" 
              ? renderProviderFlow() 
              : renderClientForm()
          }

          {/* Toggle mode */}
          <div className="text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary font-medium hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Já tem uma conta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <h2 className="text-3xl font-display font-bold mb-4">
            {role === "provider" && mode === "register"
              ? "Expanda seu negócio com a gente"
              : "Gerencie seus agendamentos com facilidade"
            }
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            {role === "provider" && mode === "register"
              ? "Entre em contato pelo WhatsApp e descubra como podemos ajudar você a gerenciar sua agenda e conquistar mais clientes."
              : "A plataforma mais simples para profissionais de serviços gerenciarem sua agenda e clientes."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
