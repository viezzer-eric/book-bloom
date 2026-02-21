import { Search, X, ArrowUpDown } from "lucide-react";
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

  selectedSort: string;
  onSortChange: (value: string) => void;

  serviceTypes: string[];
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  selectedServiceType,
  onServiceTypeChange,
  selectedSort,
  onSortChange,
  serviceTypes,
}: SearchBarProps) {
  const hasFilters =
    searchTerm ||
    selectedServiceType !== "" ||
    selectedSort !== "name_asc";

  const handleClearAll = () => {
    onSearchChange("");
    onServiceTypeChange("all");
    onSortChange("name_asc");
  };

  return (
    <div className="w-full space-y-5">
      {/* 🔎 Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar profissionais..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-10 h-12 rounded-xl"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 🎛 Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Serviço */}
        <Select
          value={selectedServiceType || "all"}
          onValueChange={onServiceTypeChange}
        >
          <SelectTrigger className="h-11 rounded-xl flex-1">
            <SelectValue placeholder="Tipo de serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {serviceTypes.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenação */}
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger className="h-11 rounded-xl flex-1">
            <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nome (A → Z)</SelectItem>
            <SelectItem value="name_desc">Nome (Z → A)</SelectItem>
            <SelectItem value="rating_desc">Melhor avaliados</SelectItem>
            <SelectItem value="recent_desc">Mais recentes</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="h-11 rounded-xl"
          >
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
