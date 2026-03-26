import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { providerRepository } from "@/repositories/providerRepository";
import { serviceRepository } from "@/repositories/serviceRepository";

interface Provider {
  id: string;
  business_name: string;
  description: string | null;
  city: string | null;
  address: string | null;
  addressNumber: string | null;
  cep: string | null;
  state: string | null;
  neighborhood: string | null;
  user_id: string;
  avatar_url?: string | null;
  rating_average: number | null;
  rating_count: number | null;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  provider_id: string;
}

interface ProviderWithServices extends Provider {
  services: Service[];
}

export function useProviderSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");

  const { data: rawProviders = [], isLoading: loadingProviders, refetch: refetchProviders } = useQuery({
    queryKey: ['providers', 'all'],
    queryFn: () => providerRepository.getAllProviders()
  });

  const { data: rawServices = [], isLoading: loadingServices, refetch: refetchServices } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => serviceRepository.getAllActiveServices()
  });

  const isLoading = loadingProviders || loadingServices;

  const providers: ProviderWithServices[] = useMemo(() => {
    return rawProviders.map(provider => ({
      ...provider,
      rating_average: (provider as unknown as any).rating_average ?? null,
      rating_count: (provider as unknown as any).rating_count ?? null,
      services: rawServices.filter(service => service.provider_id === provider.id) as Service[]
    })) as ProviderWithServices[];
  }, [rawProviders, rawServices]);

  const serviceTypes = useMemo(() => {
    return [...new Set(rawServices.map(s => s.name))];
  }, [rawServices]);

  const fetchProviders = () => {
    refetchProviders();
    refetchServices();
  };

  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Filtro por nome do profissional
      const matchesSearch = searchTerm === "" || 
        provider.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por tipo de serviço
      const matchesService = selectedServiceType === "" ||
        provider.services.some(service => 
          service.name.toLowerCase() === selectedServiceType.toLowerCase()
        );

      return matchesSearch && matchesService;
    });
  }, [providers, searchTerm, selectedServiceType]);

  return {
    providers: filteredProviders,
    allProviders: providers,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedServiceType,
    setSelectedServiceType,
    serviceTypes,
    refetch: fetchProviders
  };
}
