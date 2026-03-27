import { useMemo, useState } from "react";
import { Users, Star, Calendar, Mail, TrendingUp, Search, Award } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  status: string;
  profiles?: { avatar_url: string };
  service?: { name: string; duration_minutes: number; price?: number } | null;
}

interface ClientsTabProps {
  appointments: Appointment[];
}

export function ClientsTab({ appointments }: ClientsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const clientStats = useMemo(() => {
    const clientsMap = new Map<string, any>();

    // Filter out cancelled to just count actual interest / loyalty
    const validAppointments = appointments.filter(a => a.status !== "cancelled");

    validAppointments.forEach(apt => {
      // Use email as unique key, or name if email is missing
      const key = apt.client_email?.toLowerCase().trim() || apt.client_name.toLowerCase().trim();
      
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
            name: apt.client_name,
            email: apt.client_email,
            avatar: apt.profiles?.avatar_url,
            totalAppointments: 0,
            completedAppointments: 0,
            totalSpent: 0,
            servicesCount: {} as Record<string, number>,
            lastVisit: apt.appointment_date,
        });
      }

      const client = clientsMap.get(key);
      client.totalAppointments += 1;
      
      if (apt.status === "completed") {
         client.completedAppointments += 1;
         if (apt.service?.price) {
           client.totalSpent += apt.service.price;
         }
      }

      if (new Date(apt.appointment_date) > new Date(client.lastVisit)) {
          client.lastVisit = apt.appointment_date;
      }

      const serviceName = apt.service?.name || "Serviço Padrão";
      client.servicesCount[serviceName] = (client.servicesCount[serviceName] || 0) + 1;
    });

    return Array.from(clientsMap.values()).map(client => {
      // Find preferred service
      let preferredService = "Nenhum";
      let maxCount = 0;
      for (const [sName, count] of Object.entries(client.servicesCount)) {
        if ((count as number) > maxCount) {
           maxCount = count as number;
           preferredService = sName;
        }
      }

      return {
        ...client,
        preferredService
      };
    }).sort((a, b) => b.totalAppointments - a.totalAppointments); // Sort by most frequent
  }, [appointments]);

  const filteredClients = useMemo(() => {
      if(!searchTerm) return clientStats;
      const lowerSearch = searchTerm.toLowerCase();
      return clientStats.filter(c => 
          c.name.toLowerCase().includes(lowerSearch) || 
          (c.email && c.email.toLowerCase().includes(lowerSearch)) ||
          c.preferredService.toLowerCase().includes(lowerSearch)
      );
  }, [clientStats, searchTerm]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const topClient = clientStats.length > 0 ? clientStats[0] : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Clientes Frequentes</h1>
          <p className="text-muted-foreground mt-1 text-lg">Conheça sua base de clientes e histórico de agendamentos</p>
        </div>
        
        <div className="bg-card/40 backdrop-blur-sm border border-border/60 p-1.5 rounded-2xl flex items-center shadow-soft">
            <div className="flex items-center px-3 text-muted-foreground">
                <Search className="w-5 h-5" />
            </div>
            <Input
                type="text"
                placeholder="Buscar cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 h-10 border-0 bg-transparent focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50 font-medium"
            />
        </div>
      </div>

      {clientStats.length === 0 ? (
        <div className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-3xl border border-border/60 shadow-soft">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Users className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Nenhum cliente ainda</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Os clientes vão aparecer aqui automaticamente após agendarem um serviço com você.</p>
        </div>
      ) : (
        <div className="grid gap-6">
            
          {/* Highlight Card for Top Client */}
          {topClient && !searchTerm && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-medium group">
               <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full group-hover:scale-110 transition-transform"></div>
               
               <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden shadow-inner shrink-0">
                      {topClient.avatar ? (
                          <img src={topClient.avatar} alt={topClient.name} className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-3xl font-bold text-primary">{topClient.name.charAt(0).toUpperCase()}</span>
                      )}
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg border-2 border-background animate-bounce z-10" title="Cliente Mais Fiel">
                      <Award className="w-4 h-4 text-white" />
                  </div>
               </div>

               <div className="flex-1 text-center sm:text-left z-10">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 border border-yellow-500/20">
                      Cliente Número 1
                   </div>
                   <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                       {topClient.name}
                   </h2>
                   {topClient.email && (
                     <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mb-4">
                       <Mail className="w-4 h-4" /> {topClient.email}
                     </p>
                   )}
                   
                   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 mt-4">
                       <div>
                           <p className="text-sm text-muted-foreground/80 font-medium mb-1">Total de Visitas</p>
                           <p className="text-xl font-bold text-foreground flex items-center gap-2">
                               <Calendar className="w-5 h-5 text-primary" />
                               {topClient.totalAppointments} {topClient.totalAppointments === 1 ? 'vez' : 'vezes'}
                           </p>
                       </div>
                       <div>
                           <p className="text-sm text-muted-foreground/80 font-medium mb-1">Serviço Favorito</p>
                           <p className="text-xl font-bold text-foreground flex items-center gap-2">
                               <Star className="w-5 h-5 text-yellow-500" />
                               {topClient.preferredService}
                           </p>
                       </div>
                       {topClient.totalSpent > 0 && (
                           <div>
                               <p className="text-sm text-muted-foreground/80 font-medium mb-1">Valor Investido</p>
                               <p className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                   <TrendingUp className="w-5 h-5" />
                                   {formatCurrency(topClient.totalSpent)}
                               </p>
                           </div>
                       )}
                   </div>
               </div>
            </div>
          )}

          {/* Grid of Other Clients */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map((client, index) => {
              if (index === 0 && !searchTerm) return null; // Skip top client in list if no search

              return (
                <div key={client.email || client.name} className="flex flex-col p-6 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/60 hover:border-primary/30 hover:shadow-soft transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-5">
                       <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 shrink-0 overflow-hidden">
                              {client.avatar ? (
                                  <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                              ) : (
                                  <span className="text-xl font-bold text-muted-foreground">{client.name.charAt(0).toUpperCase()}</span>
                              )}
                           </div>
                           <div>
                               <h3 className="font-bold text-lg text-foreground line-clamp-1" title={client.name}>{client.name}</h3>
                               {client.email && (
                                   <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={client.email}>{client.email}</p>
                               )}
                           </div>
                       </div>
                       <div className="flex flex-col items-end text-right shrink-0 ml-2">
                           <span className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Visitas</span>
                           <span className="text-xl font-display font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                               {client.totalAppointments}
                           </span>
                       </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-2xl flex-1 flex flex-col justify-between gap-3 border border-border/40">
                       <div>
                           <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Serviço Favorito</p>
                           <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5" title={client.preferredService}>
                               <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                               {client.preferredService}
                           </p>
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                           <Calendar className="w-3.5 h-3.5 opacity-70" />
                           Última visita: {formatDate(client.lastVisit)}
                       </div>
                       {client.totalSpent > 0 && (
                          <div className="mt-2 pt-3 border-t border-border/50 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground font-semibold">Valor Total Gasto</span>
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(client.totalSpent)}
                              </span>
                          </div>
                      )}
                    </div>
                </div>
              );
            })}
            
            {filteredClients.length === 0 && searchTerm && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    Nenhum cliente encontrado com "{searchTerm}".
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
