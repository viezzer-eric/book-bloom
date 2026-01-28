import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedServiceType: string;
  onServiceTypeChange: (value: string) => void;
  serviceTypes: string[];
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  selectedServiceType,
  onServiceTypeChange,
  serviceTypes,
}: SearchBarProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  const handleClearFilter = () => {
    onServiceTypeChange("");
  };

  return (
    <div className="w-full space-y-4">
      {/* Barra de busca principal */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar profissionais por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-10 h-12 text-base bg-card border-border rounded-xl shadow-soft"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtro por tipo de serviço */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedServiceType} onValueChange={onServiceTypeChange}>
          <SelectTrigger className="h-11 bg-card border-border rounded-xl flex-1">
            <SelectValue placeholder="Filtrar por tipo de serviço" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="all">Todos os serviços</SelectItem>
            {serviceTypes.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(searchTerm || selectedServiceType) && (
          <Button
            variant="outline"
            onClick={() => {
              handleClearSearch();
              handleClearFilter();
            }}
            className="h-11 rounded-xl"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
