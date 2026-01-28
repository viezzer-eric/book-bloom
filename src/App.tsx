import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProviderDashboard from "./pages/ProviderDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Profile from "./pages/Profile";
import BookingPage from "./pages/BookingPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/entrar" element={<Auth />} />
            <Route path="/painel" element={<ProviderDashboard />} />
            <Route path="/meus-agendamentos" element={<ClientDashboard />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/agendar/:providerId" element={<BookingPage />} />
            {/* Legacy routes */}
            <Route path="/dashboard" element={<ProviderDashboard />} />
            <Route path="/book/:providerId" element={<BookingPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
