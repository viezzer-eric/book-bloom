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
  services: Service[];
}

interface ProviderListProps {
  providers: Provider[];
  isLoading: boolean;
  hasFilters: boolean;
}

export function ProviderList({ providers, isLoading, hasFilters }: ProviderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-card border border-border rounded-2xl p-5 animate-pulse"
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          {hasFilters ? (
            <SearchX className="w-8 h-8 text-muted-foreground" />
          ) : (
            <Users className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-2">
          {hasFilters 
            ? "Nenhum profissional encontrado" 
            : "Nenhum profissional disponível"}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {hasFilters
            ? "Tente ajustar os filtros de busca para encontrar profissionais."
            : "No momento não há profissionais cadastrados na plataforma."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {providers.length} {providers.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
      </p>
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          id={provider.id}
          businessName={provider.business_name}
          description={provider.description}
          address={provider.address}
          services={provider.services}
        />
      ))}
    </div>
  );
}
