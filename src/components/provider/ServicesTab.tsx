import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
}

export function ServicesTab({ services, providerId, onServiceAdded }: ServicesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [active, setActive] = useState(true);

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
      const { error } = await supabase.from("services").insert({
        provider_id: providerId,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        duration_minutes: parseInt(duration),
        active: active,
      });

      if (error) {
        console.error("Error adding service:", error);
        toast.error("Erro ao adicionar serviço. Tente novamente.");
        return;
      }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">Gerencie seus serviços oferecidos</p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Nenhum serviço cadastrado ainda</h3>
            <p className="text-muted-foreground mb-4">
              Adicione seus serviços para que os clientes possam agendar.
            </p>
            <Button onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar serviço
            </Button>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-card-foreground">{service.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      service.active
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {service.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{service.duration_minutes} min</p>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {formatPrice(service.price)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Modal Adicionar Serviço */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Serviço</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo serviço
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do serviço <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Corte de cabelo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do serviço"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Preço (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duração (min) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Status</Label>
                <p className="text-sm text-muted-foreground">
                  Serviço disponível para agendamento
                </p>
              </div>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
