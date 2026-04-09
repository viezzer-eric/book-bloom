import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("provider" | "client")[];
  redirectTo?: string;
}

/**
 * ProtectedRoute — bloqueia acesso a rotas autenticadas.
 *
 * - Se ainda está carregando auth → mostra spinner (evita F5 eterno)
 * - Se não está autenticado → redireciona para /entrar
 * - Se autenticado mas sem a role correta → redireciona para dashboard correto
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Enquanto o estado de auth ainda está sendo resolvido (ex.: F5),
  // mostramos um spinner. Isso evita redirecionamentos prematuros.
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Não autenticado → vai para login, salvando a rota de origem
  if (!user) {
    return (
      <Navigate
        to={redirectTo ?? "/entrar"}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Autenticado mas a role ainda está carregando (Supabase pode demorar um tick)
  if (allowedRoles && userRole === null) {
    return <AuthLoadingScreen />;
  }

  // Role não permitida → redireciona para o dashboard correto
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    const fallback = userRole === "provider" ? "/painel" : "/meus-agendamentos";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

/**
 * PublicOnlyRoute — bloqueia acesso a páginas públicas quando já logado.
 * Ex.: /entrar, /esqueci-senha
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    // Role ainda carregando → espera
    if (userRole === null) {
      return <AuthLoadingScreen />;
    }

    const dashboard = userRole === "provider" ? "/painel" : "/meus-agendamentos";
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
}

/**
 * ClientOnlyRoute — Permite acesso a visitantes e clientes,
 * mas redireciona prestadores que tentarem entrar em áreas de busca/agendamento.
 */
export function ClientOnlyRoute({ children }: { children: React.ReactNode }) {
  const { userRole, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Se logado como prestador, redireciona para o próprio painel
  if (userRole === "provider") {
    return <Navigate to="/painel" replace />;
  }

  return <>{children}</>;
}

/**
 * RoleRedirect — rota que redireciona conforme a role do usuário.
 * Útil para /dashboard genérico.
 */
export function RoleRedirect() {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading || (user && userRole === null)) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (userRole === "provider") {
    return <Navigate to="/painel" replace />;
  }

  return <Navigate to="/meus-agendamentos" replace />;
}

// ─── Spinner de carregamento de autenticação ─────────────────────────────────

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Verificando sessão...
        </p>
      </div>
    </div>
  );
}
