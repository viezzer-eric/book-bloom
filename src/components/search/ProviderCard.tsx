import { MapPin, Clock, Briefcase, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface ProviderCardProps {
  id: string;
  businessName: string;
  description: string | null;
  address: string | null;
  services: Service[];
  rating_average: number | null;
  avatar_url: string | null;
  index?: number;
}

export function ProviderCard({
  id,
  businessName,
  description,
  address,
  services,
  avatar_url,
  rating_average,
  index = 0
}: ProviderCardProps) {

  const minPrice = services.length > 0 
    ? Math.min(...services.map(s => s.price)) 
    : null;

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!avatar_url) return;
    const { data } = supabase.storage
      .from("avatar_urls")
      .getPublicUrl(avatar_url);
    setPreview(`${data.publicUrl}?t=${Date.now()}`);
  }, [avatar_url]);

  return (
    <div 
      className="bg-card/80 backdrop-blur-md border border-border/60 rounded-[1.5rem] p-6 hover:border-primary/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group animate-fade-up relative overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
        
        {/* Avatar/Inicial */}
        <div className="w-16 h-16 rounded-[1.25rem] gradient-subtle border border-border flex items-center justify-center text-foreground font-display font-semibold shrink-0 overflow-hidden shadow-sm">
          {preview ? (
            <img
              src={preview}
              alt="Avatar do negócio"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl opacity-70">
              {businessName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                {businessName}
              </h3>

              {/* ⭐ Rating */}
              {rating_average !== null && rating_average > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    {rating_average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Duração e Preço mínimo */}
            <div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1 text-sm bg-background/50 sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg w-fit">
              {minPrice !== null && (
                <span className="text-foreground font-semibold">
                  A partir de <span className="text-primary text-base">R$ {minPrice.toFixed(2).replace('.', ',')}</span>
                </span>
              )}
              {services.length > 0 && (
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {services[0].duration_minutes} min
                </span>
              )}
            </div>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Localização */}
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-muted-foreground hover:text-primary transition cursor-pointer bg-muted/40 px-2 py-1 rounded-md"
            >
              <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
              <span className="truncate">{address}</span>
            </a>
          )}

          {/* Serviços */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
              {services.slice(0, 3).map((service) => (
                <Badge 
                  key={service.id} 
                  variant="secondary"
                  className="text-xs font-normal bg-background/60 hover:bg-background border-border/50 text-foreground/80 py-1"
                >
                  <Briefcase className="w-3 h-3 mr-1.5 opacity-70" />
                  {service.name}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal border-border/50 bg-transparent text-muted-foreground py-1">
                  +{services.length - 3} serviços
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <div className="sm:self-center mt-4 sm:mt-0 lg:ml-4 shrink-0 w-full sm:w-auto">
          <Link to={`/agendar/${id}`} className="block w-full">
            <Button className="w-full sm:w-auto rounded-xl group/btn shadow-soft hover:shadow-glow transition-all py-6 sm:py-5 px-6">
              Agendar
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
