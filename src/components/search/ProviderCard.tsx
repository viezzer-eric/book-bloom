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
}

export function ProviderCard({
  id,
  businessName,
  description,
  address,
  services,
  avatar_url,
  rating_average
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
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-medium transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        
        {/* Avatar/Inicial */}
        <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground text-xl font-display font-semibold shrink-0 overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Avatar do negócio"
              className="w-full h-full object-cover"
            />
          ) : (
            businessName?.charAt(0).toUpperCase()
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
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

          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}

          {/* Localização */}
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground hover:text-primary transition cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span className="underline">{address}</span>
            </a>
          )}

          {/* Serviços */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {services.slice(0, 3).map((service) => (
                <Badge 
                  key={service.id} 
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  {service.name}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{services.length - 3} mais
                </Badge>
              )}
            </div>
          )}

          {/* Preço e Duração */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            {minPrice !== null && (
              <span className="text-foreground font-semibold">
                A partir de R$ {minPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            {services.length > 0 && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {services[0].duration_minutes} min
              </span>
            )}
          </div>
        </div>

        {/* Botão de ação */}
        <div className="sm:self-center mt-3 sm:mt-0">
          <Link to={`/agendar/${id}`}>
            <Button className="w-full sm:w-auto rounded-xl group/btn">
              Agendar
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
