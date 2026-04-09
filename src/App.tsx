import React, { lazy, Suspense } from "react";
import { Toaster as Sonner, Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  ClientOnlyRoute,
  RoleRedirect,
} from "@/components/auth/ProtectedRoute";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Páginas públicas (Lazy Loaded)
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));

// Páginas protegidas (Lazy Loaded)
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Home ─────────────────────────────────────────────────── */}
              <Route path="/" element={<Index />} />

              {/* ── Rotas abertas (Visitantes ou Clientes apenas) ──────────────── */}
              <Route
                path="/buscar"
                element={
                  <ClientOnlyRoute>
                    <SearchPage />
                  </ClientOnlyRoute>
                }
              />
              <Route
                path="/agendar/:providerId"
                element={
                  <ClientOnlyRoute>
                    <BookingPage />
                  </ClientOnlyRoute>
                }
              />
              {/* Alias legado */}
              <Route
                path="/book/:providerId"
                element={
                  <ClientOnlyRoute>
                    <BookingPage />
                  </ClientOnlyRoute>
                }
              />

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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;