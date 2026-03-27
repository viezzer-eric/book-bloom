import { Calendar, CalendarCheck, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/SearchBar";
import { ProviderList } from "@/components/search/ProviderList";
import { useProviderSearch } from "@/hooks/useProviderSearch";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AvatarUserMenu from "@/components/common/AvatarUpload";
import { useProfile } from "@/hooks/useProfiles";

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

  const { data: profile } = useProfile(user?.id);
  const hasFilters = searchTerm !== "" || selectedServiceType !== "";
  const [selectedSort, setSelectedSort] = useState("name_asc");
  
  const filteredProviders = providers
    .filter((provider) => {
      const matchesSearch = provider.business_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesService =
        !selectedServiceType ||
        provider.services?.some((service) =>
          service.name === selectedServiceType
      );

      return matchesSearch && matchesService;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "name_asc":
          return a.business_name.localeCompare(b.business_name);
        case "name_desc":
          return b.business_name.localeCompare(a.business_name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground tracking-tight">Bookly</span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <Link to={user ? "/meus-agendamentos" : "/entrar"} className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 h-10">
                  <CalendarCheck className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">Meus Agendamentos</span>
                </Button>
              </Link>
              <div className="shrink-0 pl-2 sm:pl-4 border-l border-border/50">
                <AvatarUserMenu profileData={profile} onSignOut={signOut} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 relative z-10 animate-fade-up">
        <div className="max-w-4xl mx-auto">
          {/* Título Premium Hero */}
          <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-8 sm:p-14 text-center shadow-glow mb-10">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4 leading-tight">
                Encontre os Melhores Profissionais
              </h1>
              <p className="text-primary-foreground/90 text-lg">
                Sua jornada de bem-estar começa aqui. Busque e agende serviços com especialistas conceituados na sua região.
              </p>
            </div>
            
            {/* Decorações no Hero */}
            <div className="absolute left-0 bottom-0 pointer-events-none opacity-20 hidden md:block">
              <svg width="250" height="250" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M38.8,-63.9C49.9,-54.2,58.3,-41.2,65.3,-27C72.3,-12.8,77.9,2.6,76.3,17.5C74.6,32.4,65.8,46.8,53.5,56.6C41.2,66.4,25.5,71.5,9.4,72.6C-6.7,73.6,-23.1,70.6,-37.2,62.3C-51.2,53.9,-62.8,40.3,-69.1,24.8C-75.3,9.3,-76.3,-8.2,-71,-23.4C-65.6,-38.7,-53.8,-51.7,-40.4,-60.6C-27,-69.4,-13.5,-74.1,1.1,-75.7C15.7,-77.4,31.4,-75.9,38.8,-63.9Z" transform="translate(100 100) scale(1)" />
              </svg>
            </div>
            <div className="absolute right-0 top-0 pointer-events-none opacity-20 hidden md:block">
              <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M51.5,-68.8C65.5,-59.1,74.7,-42.6,78.2,-25.1C81.6,-7.6,79.4,11.1,70.7,26.4C62,41.7,46.9,53.6,30.3,62.2C13.8,70.8,-4.2,76,-21.5,72.6C-38.9,69.2,-55.5,57.1,-65.4,41.5C-75.3,25.9,-78.4,6.7,-73.4,-10.1C-68.5,-26.8,-55.4,-41.2,-40.7,-51.2C-26.1,-61.2,-13,-66.8,2.2,-69.8C17.5,-72.8,35,-73.1,51.5,-68.8Z" transform="translate(100 100) scale(1.1)" />
              </svg>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="mb-10 bg-card/60 backdrop-blur-md border border-border/50 rounded-[2rem] p-6 sm:p-8 shadow-sm relative z-20">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedServiceType={selectedServiceType}
              onServiceTypeChange={(value) =>
                setSelectedServiceType(value === "all" ? "" : value)
              }
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              serviceTypes={serviceTypes}
            />
          </div>

          {/* Lista de profissionais */}
          <div className="min-h-[400px]">
            <ProviderList
              providers={filteredProviders}
              isLoading={isLoading}
              hasFilters={hasFilters}
            />
          </div>

          {/* Botão de agendamentos no mobile */}
          <div className="fixed bottom-6 left-4 right-4 sm:hidden z-50">
            <Link to={user ? "/meus-agendamentos" : "/entrar"}>
              <Button className="w-full rounded-full h-14 shadow-glow gap-2 bg-primary/90 backdrop-blur-md">
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
