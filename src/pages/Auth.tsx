import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, Loader2, MessageCircle, ArrowRight, Star, Scissors, Heart, Dumbbell, Sparkles, Brain, TrendingUp, Bell, DollarSign, UserCheck, ArrowLeft, CheckCheck, Copy, Check } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const APPOINTMENT_CASES = [
  { icon: Scissors, label: "Barba & Cabelo", time: "Amanhã às 14h", color: "text-blue-400" },
  { icon: Heart, label: "Consulta Nutricional", time: "Sexta-feira, 09:30", color: "text-rose-400" },
  { icon: Dumbbell, label: "Personal Trainer", time: "Hoje às 18:00", color: "text-emerald-400" },
  { icon: Sparkles, label: "Manicure & Pedicure", time: "Quinta às 15:15", color: "text-purple-400" },
  { icon: Brain, label: "Sessão de Terapia", time: "Quarta às 16:00", color: "text-amber-400" },
];

const PROVIDER_CASES = [
  { icon: Bell, label: "Nova Reserva", time: "Ana S. agendou Cabelo", color: "text-blue-400" },
  { icon: TrendingUp, label: "Insight de Negócio", time: "Horários de pico: Quinta", color: "text-rose-400" },
  { icon: DollarSign, label: "Faturamento Semanal", time: "R$ 1.250,00 (+15%)", color: "text-emerald-400" },
  { icon: UserCheck, label: "Novo Cliente", time: "João M. via link direto", color: "text-purple-400" },
  { icon: Star, label: "Nova Avaliação", time: "5 estrelas de Maria L.", color: "text-amber-400" },
];

const PLANS = [
  {
    id: "free",
    name: "Teste Grátis",
    price: "R$ 0",
    period: "15 dias",
    features: ["Acesso restrito", "15 dias de duração", "Controle de agendamentos"],
    color: "from-blue-500/10 to-blue-400/5",
    border: "border-blue-200/20",
  },
  {
    id: "monthly",
    name: "Plano Mensal",
    price: "R$ 50",
    period: "/mês",
    features: ["Acesso ilimitado", "Suporte tecnico", "Gestão de clientes"],
    popular: true,
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20",
  },
  {
    id: "finance",
    name: "Mensal + Financeiro",
    price: "R$ 80",
    period: "/mês",
    features: ["Tudo do Mensal", "Controle financeiro", "Fluxo de caixa", "Relatórios de lucro"],
    color: "from-purple-500/10 to-purple-400/5",
    border: "border-purple-200/20",
  },
];

const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cpf.substring(10, 11))) return false;
  return true;
};

const isValidCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  return true;
};

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  } else {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
      .slice(0, 15);
  }
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get("mode") === "register";
  const defaultRole = searchParams.get("role") as "provider" | "client" | null;

  const [mode, setMode] = useState<"login" | "register">(isRegister ? "register" : "login");
  const [role, setRole] = useState<"provider" | "client">(defaultRole || "client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [caseIdx, setCaseIdx] = useState(0);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [externalId, setExternalId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"PendingCheckout" | "Active">("PendingCheckout");
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cpf");
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const activeCases = (mode === "register" && role === "provider") ? PROVIDER_CASES : APPOINTMENT_CASES;

  useEffect(() => {
    setCaseIdx(0);
  }, [mode, role]);

  useEffect(() => {
    // Só inicia o polling se o modal estiver aberto, tivermos o ID e não estiver ativo ainda
    if (!pixModalOpen || !externalId || paymentStatus === "Active") return;

    console.log("Iniciando polling de 15s para ID:", externalId);

    const checkStatusInterno = async () => {
      try {
        const response = await fetch(
          `https://angelic-nonfeverish-heather.ngrok-free.dev/v1/abacatePay/payment-status?paymentId=${externalId}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.ok) {
          // Usamos .text() porque a API retorna uma string pura, não um JSON
          const statusTexto = await response.text();

          // Remove aspas extras que o C# às vezes coloca ao serializar strings puras
          const statusLimpo = statusTexto.replace(/"/g, "");

          console.log("Status puro recebido:", statusLimpo);

          if (statusLimpo === "Active" || statusLimpo === "Paid") {
            handlePaymentSuccess();
          }
        }
      } catch (err) {
        console.error("Erro ao ler resposta da API:", err);
      }
    };

    // 1. Executa uma vez imediatamente ao abrir o modal
    checkStatusInterno();

    // 2. Define o intervalo para repetir a cada 15 segundos
    const intervalId = setInterval(checkStatusInterno, 15000);

    // 3. CLEANUP: Limpa o intervalo se o modal fechar ou o componente desmontar
    return () => {
      console.log("Limpando polling...");
      clearInterval(intervalId);
    };
  }, [pixModalOpen, externalId, paymentStatus]);

  const handlePaymentSuccess = async () => {
    const { email, password } = formData;
    setPaymentStatus("Active");
    toast.success("Pagamento confirmado com sucesso!");

    // Limpar formulário
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      document: "",
      phone: "",
    });

    // Redirecionamento automático após 2 segundos
    setTimeout(async () => {
      try {
        setIsLoading(true);
        await signIn(email, password);
        navigate("/painel");
      } catch (error) {
        navigate("/login");
      } finally {
        setIsLoading(false);
        setPixModalOpen(false);
      }
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCaseIdx((prev) => (prev + 1) % activeCases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeCases.length]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const orb1X = useTransform(springX, [0, 1], [-20, 20]);
  const orb1Y = useTransform(springY, [0, 1], [-15, 15]);
  const orb2X = useTransform(springX, [0, 1], [15, -15]);
  const orb2Y = useTransform(springY, [0, 1], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width);
    mouseY.set((e.clientY - top) / height);
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    document: "",
    phone: "",
  });



  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "register" && step === 1) {
      if (role === "provider") {
        if (documentType === "cpf" && !isValidCPF(formData.document)) {
          toast.error("CPF inválido");
          return;
        }
        if (documentType === "cnpj" && !isValidCNPJ(formData.document)) {
          toast.error("CNPJ inválido");
          return;
        }
        if (formData.phone.replace(/\D/g, "").length < 10) {
          toast.error("Telefone inválido");
          return;
        }
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
      setStep(2);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "register") {
        let planAmount = 0;
        if (role === "provider" && selectedPlan !== "free") {
          const plan = PLANS.find((p) => p.id === selectedPlan);
          if (plan) {
            const monthlyPrice = parseInt(plan.price.replace("R$ ", ""));
            planAmount = billingCycle === "monthly" ? monthlyPrice : Math.floor(monthlyPrice * 12 * 0.84);
          }
        }

        const { error, data } = await signUp(formData.email, formData.password, formData.fullName, role, formData.phone, formData.document, planAmount);

        if (error) {
          toast.error(error.message || "Erro ao criar conta");
        } else {
          toast.success("Conta criada com sucesso!");
          if (role === "provider" && data) {
            setPixData(data);
            setPixModalOpen(true);
            setExternalId(data.id);
          } else {
            navigate(role === "provider" ? "/painel" : "/meus-agendamentos");
          }
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          toast.error(error.message || "Email ou senha incorretos");
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

  const renderPlanSelection = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-6"
    >
      {/* Billing Toggle */}
      <div className="flex justify-center mb-4">
        <div className="p-1 bg-muted/50 backdrop-blur-sm rounded-full border border-white/20 flex gap-1 relative shadow-inner">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 relative z-10",
              billingCycle === "monthly" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Mensal
            {billingCycle === "monthly" && (
              <motion.div layoutId="billing-bg" className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg" />
            )}
          </button>
          <button
            onClick={() => setBillingCycle("annually")}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 relative z-10 flex items-center gap-1.5",
              billingCycle === "annually" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Anual
            {billingCycle === "annually" && (
              <motion.div layoutId="billing-bg" className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg" />
            )}
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[8px] uppercase font-bold tracking-tighter",
              billingCycle === "annually" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}>
              16% OFF
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PLANS.map((plan) => {
          const isFree = plan.id === "free";
          const monthlyPrice = parseInt(plan.price.replace("R$ ", ""));
          const yearlyPrice = Math.floor(monthlyPrice * 12 * 0.84); // 16% discount to match Prices.tsx

          const displayPrice = isFree
            ? "R$ 0"
            : billingCycle === "monthly"
              ? plan.price
              : `R$ ${yearlyPrice}`;

          const displayPeriod = isFree
            ? "15 dias"
            : billingCycle === "monthly"
              ? "/mês"
              : "/ano";

          const dynamicName = plan.name.replace("Mensal", billingCycle === "annually" ? "Anual" : "Mensal");

          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden",
                "bg-gradient-to-br",
                plan.color,
                selectedPlan === plan.id
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-transparent hover:border-white/40"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                  Mais Popular
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg text-foreground">{dynamicName}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground transition-all duration-500">{displayPrice}</span>
                    <span className="text-muted-foreground text-sm">{displayPeriod}</span>
                  </div>
                  {billingCycle === "annually" && !isFree && (
                    <p className="text-[10px] text-primary font-bold mt-1">
                      Equivalente a R$ {(yearlyPrice / 12).toFixed(2).replace(".", ",")} /mês
                    </p>
                  )}
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  selectedPlan === plan.id ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                )}>
                  {selectedPlan === plan.id && <CheckCheck className="w-4 h-4" />}
                </div>
              </div>

              <ul className="space-y-2 mt-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCheck className="w-3 h-3 text-primary flex-shrink-0" />
                    {feature.replace("Mensal", billingCycle === "annually" ? "Anual" : "Mensal")}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4 space-y-3">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Finalizar cadastro"}
        </Button>
        <button
          onClick={() => setStep(1)}
          className="w-full text-sm text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-1 group"
        >
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Voltar para meus dados
        </button>
      </div>
    </motion.div>
  );

  // Registration form step 1
  const renderRegisterForm = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium ml-1">Nome completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium ml-1">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </motion.div>

      {role === "provider" && (
        <>
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex justify-between items-center ml-1 mb-1">
              <Label htmlFor="document" className="text-sm font-medium">Documento</Label>
              <div className="flex bg-white/50 dark:bg-card/50 p-1 rounded-lg border border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("cpf");
                    setFormData({ ...formData, document: "" });
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                    documentType === "cpf" ? "bg-white dark:bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  CPF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("cnpj");
                    setFormData({ ...formData, document: "" });
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                    documentType === "cnpj" ? "bg-white dark:bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  CNPJ
                </button>
              </div>
            </div>
            <Input
              id="document"
              type="text"
              placeholder={documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
              className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
              value={formData.document}
              onChange={(e) => {
                const formatted = documentType === "cpf"
                  ? formatCPF(e.target.value)
                  : formatCNPJ(e.target.value);
                setFormData({ ...formData, document: formatted });
              }}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium ml-1">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              required
            />
          </motion.div>
        </>
      )}

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium ml-1">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium ml-1">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          disabled={isLoading}
        >
          Próximo passo
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </motion.form>
  );

  // Login form
  const renderLoginForm = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium ml-1">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
          <Link
            to="/esqueci-senha"
            className="text-xs text-primary/80 hover:text-primary transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-12 bg-white/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-primary/20 transition-all"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2">
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Entrar"}
        </Button>
      </motion.div>
    </motion.form>
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-background flex relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* ── Animated background ── */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 10% 20%, hsl(165 35% 45% / 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 90% 80%, hsl(15 85% 60% / 0.1) 0%, transparent 60%),
              radial-gradient(ellipse 70% 70% at 50% 50%, hsl(180 40% 35% / 0.08) 0%, transparent 70%)
            `,
          }}
        />

        <motion.div
          style={{ x: orb1X, y: orb1Y }}
          className="absolute top-[10%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          style={{ x: orb2X, y: orb2Y }}
          className="absolute bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full bg-accent/10 blur-[80px]"
        />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <motion.button
          whileHover={{ x: -4, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 dark:bg-card/40 backdrop-blur-md border border-white/40 dark:border-white/10 text-foreground text-sm font-medium shadow-lg hover:bg-white/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </motion.button>
      </div>

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          {/* Form Container Card */}
          <motion.div
            animate={{ maxWidth: step === 2 ? 500 : 440 }}
            className="bg-white/40 dark:bg-card/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* Logo */}
            <div className="text-center mb-10">
              <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <span className="text-3xl font-display font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">Bookly</span>
              </Link>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode + (mode === 'register' ? role : '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 leading-tight">
                    {mode === "login" ? "Bem-vindo de volta" :
                      step === 2 ? "Escolha seu plano" :
                        role === "provider" ? "Comece a Brilhar" : "Sua nova jornada"}
                  </h1>
                  <p className="text-muted-foreground/80 text-sm md:text-base max-w-[280px] mx-auto leading-relaxed text-balance">
                    {mode === "login"
                      ? "Acesse sua conta para gerenciar seus momentos."
                      : step === 2
                        ? "Selecione o plano ideal para seu crescimento."
                        : role === "provider"
                          ? "Junte-se aos melhores profissionais da região."
                          : "Receba o melhor atendimento, no seu tempo."
                    }
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Role Selection (only for register) */}
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-1.5 bg-muted/50 backdrop-blur-sm rounded-2xl flex gap-1 border border-white/20"
              >
                <button
                  onClick={() => setRole("provider")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                    role === "provider"
                      ? "bg-white dark:bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Prestador
                  {role === "provider" && (
                    <motion.div layoutId="role-bg" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setRole("client")}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                    role === "client"
                      ? "bg-white dark:bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cliente
                  {role === "client" && (
                    <motion.div layoutId="role-bg" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                  )}
                </button>
              </motion.div>
            )}

            {/* Form Content */}
            <div className="relative min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode + (mode === 'register' ? role : '') + step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {mode === "login"
                    ? renderLoginForm()
                    : step === 2
                      ? renderPlanSelection()
                      : renderRegisterForm()
                  }
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Toggle mode */}
            {step === 1 && (
              <div className="mt-10 text-center">
                <p className="text-sm text-muted-foreground/80">
                  {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}
                  <button
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setStep(1);
                    }}
                    className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center group"
                  >
                    {mode === "login" ? "Crie sua conta" : "Entre aqui"}
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Decorative (Desktop Only) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-20 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Especialistas em Encantar Clientes
            </div>

            <h2 className="text-5xl font-display font-bold text-white leading-[1.15]">
              {role === "provider" && mode === "register"
                ? "Leve seu negócio para o próximo nível"
                : "Agende hoje mesmo"
              }
            </h2>

            <p className="text-white/80 text-xl leading-relaxed font-light">
              {role === "provider" && mode === "register"
                ? "Mais que uma agenda, um parceiro de crescimento para seu negócio."
                : "Encontre os melhores profissionais e reserve seu horário em segundos."
              }
            </p>

            <div className="pt-8 flex justify-center h-24 relative overflow-hidden w-full max-w-sm mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode + role + caseIdx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-full">
                    {(() => {
                      const CaseIcon = activeCases[caseIdx].icon;
                      return (
                        <div className={cn("w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0", activeCases[caseIdx].color)}>
                          <CaseIcon className="w-6 h-6" />
                        </div>
                      );
                    })()}
                    <div className="text-left overflow-hidden">
                      <p className="text-white font-semibold truncate">
                        {activeCases[caseIdx].label}
                      </p>
                      <p className="text-white/60 text-sm truncate uppercase tracking-widest font-medium">
                        {activeCases[caseIdx].time}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-6 flex justify-center gap-1.5 overflow-hidden">
              {activeCases.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full bg-white transition-all duration-500",
                    i === caseIdx ? "w-8 opacity-60" : "w-1 bg-white/20 opacity-20"
                  )}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[120%] h-[120%] rounded-full border border-white/[0.03]" />
      </div>

      {/* Pix Modal */}
      <Dialog open={pixModalOpen} onOpenChange={(open) => {
        setPixModalOpen(open);
        if (!open) navigate("/painel");
      }}>
        <DialogContent className="sm:max-w-md border-white/10 bg-card/95 backdrop-blur-xl">
          {paymentStatus === "Active" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <CheckCheck className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold font-display text-center">Pagamento Confirmado!</h2>
              <p className="text-muted-foreground text-center">
                Sua conta foi ativada com sucesso.<br />
                Você será redirecionado para o painel em instantes...
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparando seu acesso...</span>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display text-center">Pagamento do Plano</DialogTitle>
                <DialogDescription className="text-center text-muted-foreground flex flex-col items-center gap-2">
                  <span>Escaneie o QR Code abaixo com o aplicativo do seu banco para ativar sua conta de Prestador.</span>
                  {pixData?.amount && (
                    <span className="text-3xl font-bold text-foreground mt-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pixData.amount / 100)}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center space-y-6 py-4">
                {/* Tenta buscar a imagem do QR Code em possíveis formatos de resposta */}
                {(pixData?.brCodeBase64) ? (
                  <div className="bg-white p-4 rounded-xl shadow-lg border">
                    <img
                      src={pixData?.brCodeBase64}
                      alt="QR Code PIX"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center border border-white/10">
                    <span className="text-muted-foreground text-sm text-center px-4">QR Code indisponível</span>
                  </div>
                )}

                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium ml-1">Pix Copia e Cola</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={pixData?.brCode}
                      className="bg-white/50 backdrop-blur-sm border-white/20 font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      onClick={() => {
                        const code = pixData?.brCode;
                        if (code) {
                          navigator.clipboard.writeText(code);
                          setCopied(true);
                          toast.success("Código copiado!");
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="shrink-0 transition-all hover:scale-105 active:scale-95"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setPixModalOpen(false);
                    navigate("/painel");
                  }}
                  className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
                >
                  Já realizei o pagamento
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
