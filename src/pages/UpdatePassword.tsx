import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PageState = "loading" | "ready" | "invalid" | "success";

const MIN_PASSWORD_LENGTH = 8;

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Muito fraca", color: "bg-destructive" };
  if (score === 2) return { score, label: "Fraca", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Razoável", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Forte", color: "bg-primary" };
  return { score, label: "Muito forte", color: "bg-green-500" };
}

export default function UpdatePassword() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen FIRST before getSession — Supabase may emit PASSWORD_RECOVERY via the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setPageState("ready");
      } else if (event === "SIGNED_IN" && session) {
        // User was already logged in (edge case), allow if we came from a recovery link
        const hash = window.location.hash;
        if (hash.includes("type=recovery")) {
          setPageState("ready");
        }
      } else if (event === "SIGNED_OUT") {
        setPageState("invalid");
      }
    });

    // Also check the URL hash synchronously for already-processed tokens
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      // Supabase will emit PASSWORD_RECOVERY once it processes the hash
      // Give it a moment to fire, then fall back
      const timer = setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setPageState("ready");
        } else {
          setPageState("invalid");
        }
      }, 1200);
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    } else {
      // No recovery hash — check for an active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setPageState("ready");
        } else {
          setPageState("invalid");
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        toast.error("Link expirado. Solicite uma nova recuperação de senha.");
        setPageState("invalid");
      } else {
        toast.error(error.message || "Erro ao atualizar senha. Tente novamente.");
      }
      return;
    }

    // Sign out after reset so user logs in fresh (prevents token reuse)
    await supabase.auth.signOut();
    setPageState("success");
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;
  const passwordMismatch = confirmPassword !== "" && password !== confirmPassword;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // ── Invalid / Expired token ───────────────────────────────────────────────
  if (pageState === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6 animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-semibold text-foreground">Bookly</span>
          </Link>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-soft space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Link inválido ou expirado
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Este link de redefinição de senha não é mais válido. Links expiram após 1 hora e só podem ser usados uma vez.
            </p>
            <Link to="/esqueci-senha">
              <Button className="w-full mt-2">Solicitar novo link</Button>
            </Link>
          </div>

          <Link to="/entrar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6 animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-semibold text-foreground">Bookly</span>
          </Link>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-soft space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Senha atualizada!
            </h1>
            <p className="text-muted-foreground text-sm">
              Sua senha foi redefinida com sucesso. Faça login com sua nova senha.
            </p>
            <Link to="/entrar">
              <Button className="w-full mt-2">Ir para o login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready — show form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-semibold text-foreground">Bookly</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Redefinir senha</h1>
          <p className="text-muted-foreground mt-2">Escolha uma senha forte para proteger sua conta</p>
        </div>

        {/* Form */}
        <div className="p-8 rounded-2xl bg-card border border-border shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força: <span className="font-medium text-foreground">{strength.label}</span>
                    {password.length < MIN_PASSWORD_LENGTH && (
                      <span className="ml-2 text-destructive">
                        — mínimo {MIN_PASSWORD_LENGTH} caracteres
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={
                    passwordMismatch
                      ? "border-destructive focus-visible:ring-destructive"
                      : passwordsMatch
                      ? "border-primary focus-visible:ring-primary"
                      : ""
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Ocultar confirmação" : "Exibir confirmação"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-primary">As senhas coincidem ✓</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                isLoading ||
                password.length < MIN_PASSWORD_LENGTH ||
                password !== confirmPassword
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar senha"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
