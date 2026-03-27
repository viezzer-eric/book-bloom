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
    <div className="w-full space-y-6">
      {/* 🔎 Busca */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder="Buscar especialistas, clínicas, salões..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-14 pr-12 h-14 rounded-2xl bg-background/60 border-border/60 hover:border-border/80 focus-visible:ring-primary/40 focus-visible:border-primary/50 text-foreground transition-all shadow-sm text-base"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 🎛 Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Serviço */}
        <Select
          value={selectedServiceType || "all"}
          onValueChange={onServiceTypeChange}
        >
          <SelectTrigger className="h-12 rounded-xl flex-1 bg-background/60 border-border/60 hover:border-border/80 transition-colors">
            <SelectValue placeholder="Tipo de serviço" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-medium">
            <SelectItem value="all" className="rounded-lg cursor-pointer">Todos os serviços</SelectItem>
            {serviceTypes.map((service) => (
              <SelectItem key={service} value={service} className="rounded-lg cursor-pointer">
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenação */}
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger className="h-12 rounded-xl flex-1 bg-background/60 border-border/60 hover:border-border/80 transition-colors">
            <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-medium">
            <SelectItem value="name_asc" className="rounded-lg cursor-pointer">Nome (A → Z)</SelectItem>
            <SelectItem value="name_desc" className="rounded-lg cursor-pointer">Nome (Z → A)</SelectItem>
            <SelectItem value="rating_desc" className="rounded-lg cursor-pointer">Melhor avaliados</SelectItem>
            <SelectItem value="recent_desc" className="rounded-lg cursor-pointer">Mais recentes</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 px-6 sm:w-auto w-full transition-colors"
          >
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}
