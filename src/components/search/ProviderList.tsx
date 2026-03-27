import { ProviderCard } from "./ProviderCard";
import { SearchX, Users } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  provider_id: string;
}

interface Provider {
  id: string;
  business_name: string;
  description: string | null;
  address: string | null;
  addressNumber: string | null;
  rating_average: number | null;
  services: Service[];
  avatar_url?: string | null;
}

interface ProviderListProps {
  providers: Provider[];
  isLoading: boolean;
  hasFilters: boolean;
}

export function ProviderList({ providers, isLoading, hasFilters }: ProviderListProps) {

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-card/40 border border-border/40 rounded-[1.5rem] p-6 animate-pulse"
          >
            <div className="flex gap-5">
              <div className="w-16 h-16 rounded-[1.25rem] bg-muted/50 shrink-0" />
              <div className="flex-1 space-y-4 py-1">
                <div className="h-5 bg-muted/50 rounded w-1/3" />
                <div className="h-4 bg-muted/50 rounded w-2/3" />
                <div className="h-4 bg-muted/50 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-[2rem] shadow-sm animate-fade-in mt-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 shadow-inner">
          {hasFilters ? (
            <SearchX className="w-10 h-10 text-muted-foreground opacity-80" />
          ) : (
            <Users className="w-10 h-10 text-muted-foreground opacity-80" />
          )}
        </div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-3">
          {hasFilters 
            ? "Nenhum profissional encontrado" 
            : "Nenhum profissional disponível"}
        </h3>
        <p className="text-muted-foreground/80 max-w-sm mx-auto text-lg leading-relaxed">
          {hasFilters
            ? "Tente ajustar os filtros de busca para encontrar mais opções."
            : "No momento não há profissionais cadastrados na plataforma."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          {providers.length} {providers.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-5">
        {providers.map((provider, index) => (
          <ProviderCard
            key={provider.id}
            id={provider.id}
            businessName={provider.business_name}
            description={provider.description}
            address={provider.address ? `${provider.address}, ${provider.addressNumber}` : null}
            services={provider.services}
            avatar_url={provider.avatar_url}
            rating_average={provider.rating_average}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
