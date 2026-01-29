import { Calendar, CalendarCheck, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/SearchBar";
import { ProviderList } from "@/components/search/ProviderList";
import { useProviderSearch } from "@/hooks/useProviderSearch";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/common/UserMenu";

export default function SearchPage() {
  const { user, signOut } = useAuth();
  const {
    providers,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedServiceType,
    setSelectedServiceType,
    serviceTypes,
  } = useProviderSearch();

  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const hasFilters = searchTerm !== "" || selectedServiceType !== "";

  const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user!.id)
          .maybeSingle();
        setProfile(profileData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

   useEffect(() => {
      if (user) {
        fetchData();
      }
    }, [user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
            </div>

            <Link to={user ? "/meus-agendamentos" : "/entrar"}>
              <Button variant="outline" className="rounded-xl gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Meus Agendamentos</span>
              </Button>
            </Link>
            <UserMenu
              full_name={profile?.full_name}
              onSignOut={signOut}
            />
          </div>
          <div className="flex items-center gap-3">
              
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Encontre Profissionais
            </h1>
            <p className="text-muted-foreground">
              Busque e agende serviços com os melhores profissionais da sua região
            </p>
          </div>

          {/* Barra de busca */}
          <div className="mb-8">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedServiceType={selectedServiceType}
              onServiceTypeChange={(value) => setSelectedServiceType(value === "all" ? "" : value)}
              serviceTypes={serviceTypes}
            />
          </div>

          {/* Lista de profissionais */}
          <ProviderList
            providers={providers}
            isLoading={isLoading}
            hasFilters={hasFilters}
          />

          {/* Botão de agendamentos no mobile */}
          <div className="fixed bottom-6 left-4 right-4 sm:hidden">
            <Link to={user ? "/meus-agendamentos" : "/entrar"}>
              <Button className="w-full rounded-xl h-12 shadow-medium gap-2">
                <CalendarCheck className="w-5 h-5" />
                Ver Meus Agendamentos
              </Button>
            </Link>
          </div>

          {/* Espaço para o botão fixo no mobile */}
          <div className="h-20 sm:hidden" />
        </div>
      </main>
    </div>
  );
}

