import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Scissors, Sparkles, Tag, Power } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateService, useUpdateService } from "@/hooks/useServices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
  active: boolean;
}

interface ServicesTabProps {
  services: Service[];
  providerId: string;
  onServiceAdded: () => void;
  onServiceUpdated: () => void;
}

export function ServicesTab({ services, providerId, onServiceAdded, onServiceUpdated }: ServicesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [active, setActive] = useState(true);

  const createService = useCreateService();
  const updateService = useUpdateService();

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
    setActive(true);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Nome do serviço é obrigatório");
      return false;
    }
    if (!price || parseFloat(price) < 0) {
      toast.error("Preço é obrigatório e deve ser válido");
      return false;
    }
    if (!duration || parseInt(duration) <= 0) {
      toast.error("Duração é obrigatória e deve ser maior que zero");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createService.mutateAsync({
        provider_id: providerId,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        duration_minutes: parseInt(duration),
        active: active,
      });

      toast.success("Serviço adicionado com sucesso!");
      handleCloseModal();
      onServiceAdded();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Erro ao adicionar serviço. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleToggleStatus = async (serviceId: string, currentActive: boolean) => {
    setTogglingServiceId(serviceId);
    try {
      await updateService.mutateAsync({
        id: serviceId,
        data: { active: !currentActive }
      });

      toast.success(
        !currentActive ? "Serviço ativado com sucesso!" : "Serviço desativado com sucesso!"
      );
      onServiceUpdated();
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast.error("Erro ao alterar status do serviço");
    } finally {
      setTogglingServiceId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
             Meus Serviços
             <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 text-sm font-semibold text-primary">
                {services.length}
             </div>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Quais serviços os clientes podem agendar com você?
          </p>
        </div>
        <Button 
          onClick={handleOpenModal} 
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:brightness-110 shadow-medium shadow-primary/25 transition-all w-full sm:w-auto text-primary-foreground font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {services.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-card/40 backdrop-blur-sm rounded-3xl border border-border/60 shadow-soft">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Scissors className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Você ainda não adicionou nenhum serviço. Comece adicionando seu primeiro serviço para habilitar agendamentos.
            </p>
            <Button onClick={handleOpenModal} variant="outline" className="rounded-xl border-border/60 bg-card/40 hover:bg-muted">
              <Plus className="w-4 h-4 mr-2 text-primary" />
              Adicionar meu primeiro serviço
            </Button>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group overflow-hidden
                ${service.active 
                  ? "bg-card border-border/50 hover:border-primary/40 hover:shadow-medium" 
                  : "bg-muted/30 border-border/30 grayscale-[0.3] opacity-80"
                }
              `}
            >
              {/* STATUS INDICATOR GLOW */}
              {service.active && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border 
                    ${service.active ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border/50 text-muted-foreground'}`}>
                      <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2 pr-2">{service.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${service.active ? "bg-green-500/10 text-green-500" : "bg-muted-foreground/10 text-muted-foreground"}
                      `}>
                        {service.active ? "Habilitado" : "Desabilitado"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* TOGGLE SWITCH */}
                <div className="shrink-0 flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group/switch"
                     title={service.active ? "Desativar serviço" : "Ativar serviço"}
                >
                  <Switch
                    checked={service.active}
                    onCheckedChange={() => handleToggleStatus(service.id, service.active)}
                    disabled={togglingServiceId === service.id}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                  {service.description}
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {service.duration_minutes} min
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xl text-foreground">
                  <Tag className="w-5 h-5 text-primary/60" />
                  {formatPrice(service.price)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Adicionar Serviço */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b border-border/40">
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-primary" />
               Novo Serviço
            </DialogTitle>
            <DialogDescription>
              Crie uma oferta incrível para seus clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Nome do serviço <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Corte de Cabelo e Barba"
                className="h-11 rounded-xl bg-background border-input focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do que está incluso"
                 className="h-11 rounded-xl bg-background border-input focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground font-medium">
                  Preço (R$) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground font-medium">
                  Duração (min) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60"
                    className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-1">
                <Label htmlFor="active" className="text-foreground font-semibold flex items-center gap-2">
                   <Power className="w-4 h-4 text-green-500" />
                   Serviço Ativo
                </Label>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Ao deixar ativo, clientes poderão agendar este serviço imediatamente.
                </p>
              </div>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 gap-3 sm:gap-0">
            <Button variant="ghost" onClick={handleCloseModal} disabled={isSubmitting} className="rounded-xl hover:bg-muted">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-medium shadow-primary/20 min-w-[120px]">
              {isSubmitting ? "Salvando..." : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
