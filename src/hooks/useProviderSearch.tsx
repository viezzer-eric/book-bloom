import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Provider {
  id: string;
  business_name: string;
  description: string | null;
  city: string | null;
  address: string | null;
  user_id: string;
  avatar_url?: string | null;
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
  const [providers, setProviders] = useState<ProviderWithServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      // Buscar profissionais
      const { data: providersData, error: providersError } = await supabase
        .from('provider_profiles')
        .select('*');

      if (providersError) throw providersError;

      // Buscar serviços ativos
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('active', true);

      if (servicesError) throw servicesError;

      // Combinar profissionais com seus serviços
      const providersWithServices: ProviderWithServices[] = (providersData || []).map(provider => ({
        ...provider,
        services: (servicesData || []).filter(service => service.provider_id === provider.id)
      }));

      setProviders(providersWithServices);

      // Extrair tipos de serviço únicos
      const uniqueServices = [...new Set((servicesData || []).map(s => s.name))];
      setServiceTypes(uniqueServices);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setIsLoading(false);
    }
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
