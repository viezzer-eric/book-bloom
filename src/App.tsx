import { Toaster as Sonner, Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRedirect,
} from "@/components/auth/ProtectedRoute";

// Páginas públicas
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import BookingPage from "./pages/BookingPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import CheckoutPage from "./pages/Checkout";

// Páginas protegidas
import ProviderDashboard from "./pages/ProviderDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Rotas completamente públicas ─────────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/agendar/:providerId" element={<BookingPage />} />
            {/* Alias legado */}
            <Route path="/book/:providerId" element={<BookingPage />} />

            {/* ── Rotas apenas para visitantes (redireciona se já logado) ── */}
            <Route
              path="/entrar"
              element={
                <PublicOnlyRoute>
                  <Auth />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/esqueci-senha"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              }
            />

            {/* Reset/update de senha: não redireciona logado (link de email) */}
            <Route path="/atualizar-senha" element={<UpdatePassword />} />
            <Route path="/reset-password" element={<UpdatePassword />} />

            {/* ── Área do PRESTADOR ─────────────────────────────────────── */}
            <Route
              path="/painel"
              element={
                <ProtectedRoute allowedRoles={["provider"]}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Área do CLIENTE ───────────────────────────────────────── */}
            <Route
              path="/meus-agendamentos"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Perfil: qualquer usuário autenticado ──────────────────── */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* ── Checkout ──────────────────────────────────────────────── */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* ── Redirecionamentos legados ─────────────────────────────── */}
            {/*
              /dashboard redireciona para o painel correto conforme a role.
              Qualquer usuário autenticado que acesse /dashboard vai para
              o lugar certo; não-autenticados vão para /entrar.
            */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;