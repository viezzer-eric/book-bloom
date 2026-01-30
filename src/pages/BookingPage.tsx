import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}

interface ProviderProfile {
  id: string;
  business_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  working_hours: any;
}



const weekDayMap: Record<string, string> = {
  dom: "Domingo",
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sáb: "Sábado",
};



export default function BookingPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);

    function generateTimeSlots(
    open: string | null,
    close: string | null,
    intervalMinutes = selectedService.duration_minutes
  ): string[] {
    if (!open || !close) return [];

    const slots: string[] = [];

    const [openH, openM] = open.split(":").map(Number);
    const [closeH, closeM] = close.split(":").map(Number);

    let current = new Date();
    current.setHours(openH, openM, 0, 0);

    const end = new Date();
    end.setHours(closeH, closeM, 0, 0);

    while (current < end) {
      const hours = String(current.getHours()).padStart(2, "0");
      const minutes = String(current.getMinutes()).padStart(2, "0");
      slots.push(`${hours}:${minutes}`);

      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  }


  const generateCalendarDays = () => {
  const today = new Date();
  const days = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const shortDay = date
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "")
      .toLowerCase();

    const weekDayName = weekDayMap[shortDay];
    const dayConfig = provider?.working_hours[weekDayName];

    const available =
      i !== 0 && 
      !!dayConfig &&
      !dayConfig.closed &&
      !!dayConfig.open &&
      !!dayConfig.close;

    days.push({
      date,
      dayName: shortDay,
      dayNumber: date.getDate(),
      isToday: i === 0,
      available,
    });
  }
  return days;
};

  const calendarDays = generateCalendarDays();

  useEffect(() => {
    if (providerId) {
      fetchProviderData();
    }
  }, [providerId]);

  const fetchProviderData = async () => {
    setIsLoading(true);
    try {
      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', providerId)
        .maybeSingle();

      if (providerError || !providerData) {
        console.error('Provider not found');
        return;
      }
      setProvider(providerData);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId)
        .eq('active', true);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDay = calendarDays[selectedDate];

  const dayConfig = provider?.working_hours[weekDayMap[selectedDay?.dayName]];

  const timeSlots = dayConfig && !dayConfig.closed
  ? generateTimeSlots(dayConfig.open, dayConfig.close)
  : [];

  const handleSubmit = async () => {
    if (!provider || !selectedService || selectedDate === null || !selectedTime) return;
    
    setIsSubmitting(true);
    try {
      const selectedServiceData = services.find(s => s.id === selectedService.id);
      const appointmentDate = calendarDays[selectedDate].date.toISOString().split('T')[0];
      const endTime = calculateEndTime(selectedTime, selectedServiceData?.duration_minutes || 60);

      const { error } = await supabase
        .from('appointments')
        .insert({
          provider_id: provider.id,
          client_id: user?.id || null,
          service_id: selectedService.id,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          appointment_date: appointmentDate,
          start_time: selectedTime,
          end_time: endTime,
          notes: formData.notes,
          status: 'pending',
        });

      if (error) throw error;

      setIsBooked(true);
      toast.success("Agendamento realizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Profissional não encontrado</h1>
          <p className="text-muted-foreground mb-6">O link de agendamento pode estar incorreto.</p>
          <Link to="/buscar">
            <Button>Voltar para Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isBooked) {
    const selectedServiceData = services.find(s => s.id === selectedService.id);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Agendamento Confirmado!</h1>
          <p className="text-muted-foreground mb-6">
            Seu agendamento foi realizado. Você receberá uma confirmação em breve.
          </p>
          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <p className="font-semibold text-card-foreground">
              {selectedServiceData?.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {calendarDays[selectedDate!]?.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {selectedTime}
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">Voltar para Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl gradient-hero flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">{provider.business_name}</h1>
              {(provider.address || provider.city) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{[provider.address, provider.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Serviço" },
              { num: 2, label: "Data e Hora" },
              { num: 3, label: "Seus Dados" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s.num 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${
                  step >= s.num ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {s.label}
                </span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Selecione um Serviço</h2>
              <p className="text-muted-foreground">Escolha o serviço que deseja agendar</p>
            </div>
            <div className="grid gap-3">
              {services.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Nenhum serviço disponível</h3>
                  <p className="text-muted-foreground">Este profissional ainda não cadastrou serviços.</p>
                </div>
              ) : (
                services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedService.id === service.id
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-foreground">{formatPrice(service.price)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <Button 
              size="lg" 
              className="w-full"
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Selecione Data e Hora</h2>
                <p className="text-muted-foreground">Escolha o melhor horário para você</p>
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Datas Disponíveis</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {calendarDays.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day.available && setSelectedDate(i)}
                    disabled={!day.available}
                    className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                      !day.available 
                        ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : selectedDate === i
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-card border border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="text-xs opacity-70 capitalize">{day.dayName}</div>
                    <div className="text-lg font-semibold">{day.dayNumber}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate !== null && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-semibold text-foreground">Horários Disponíveis</h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-card border border-border hover:border-primary/30 text-foreground"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full"
              disabled={selectedDate === null || !selectedTime}
              onClick={() => setStep(3)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setStep(2)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Seus Dados</h2>
                <p className="text-muted-foreground">Informe seus dados de contato</p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Resumo do Agendamento</h3>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{services.find(s => s.id === selectedService.id)?.name}</span>
                </p>
                <p className="text-muted-foreground capitalize">
                  {calendarDays[selectedDate!]?.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {selectedTime}
                </p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {formatPrice(services.find(s => s.id === selectedService.id)?.price || 0)}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">E-mail *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Telefone *</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Observações (opcional)</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Alguma informação adicional"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <Button 
              size="lg" 
              variant="hero"
              className="w-full"
              disabled={!formData.name || !formData.email || !formData.phone || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
