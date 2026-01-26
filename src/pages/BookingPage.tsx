import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { id: 1, name: "Facial Treatment", duration: "60 min", price: "$80", description: "Rejuvenating facial with premium products" },
  { id: 2, name: "Consultation", duration: "30 min", price: "$40", description: "Initial consultation and assessment" },
  { id: 3, name: "Massage Therapy", duration: "90 min", price: "$120", description: "Full body relaxation massage" },
  { id: 4, name: "Deep Cleansing", duration: "45 min", price: "$65", description: "Deep pore cleansing treatment" },
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

// Generate calendar days
const generateCalendarDays = () => {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: i === 0,
      available: i !== 0 && i !== 7, // Make some days unavailable for demo
    });
  }
  return days;
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });
  const [isBooked, setIsBooked] = useState(false);

  const calendarDays = generateCalendarDays();

  const handleSubmit = () => {
    setIsBooked(true);
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Your appointment has been scheduled. You'll receive a confirmation email shortly.
          </p>
          <div className="p-4 rounded-xl bg-card border border-border mb-6">
            <p className="font-semibold text-card-foreground">
              {services.find(s => s.id === selectedService)?.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {calendarDays[selectedDate!]?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
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
              <h1 className="text-xl font-display font-bold text-foreground">Serenity Spa & Wellness</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>123 Wellness Ave, Downtown</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Service" },
              { num: 2, label: "Date & Time" },
              { num: 3, label: "Details" },
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
              <h2 className="text-2xl font-display font-bold text-foreground">Select a Service</h2>
              <p className="text-muted-foreground">Choose the service you'd like to book</p>
            </div>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedService === service.id
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{service.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <Button 
              size="lg" 
              className="w-full"
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              Continue
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
                <h2 className="text-2xl font-display font-bold text-foreground">Select Date & Time</h2>
                <p className="text-muted-foreground">Choose your preferred appointment slot</p>
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Available Dates</h3>
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
                    <div className="text-xs opacity-70">{day.dayName}</div>
                    <div className="text-lg font-semibold">{day.dayNumber}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate !== null && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="font-semibold text-foreground">Available Times</h3>
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
              Continue
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
                <h2 className="text-2xl font-display font-bold text-foreground">Your Details</h2>
                <p className="text-muted-foreground">Enter your contact information</p>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{services.find(s => s.id === selectedService)?.name}</span>
                </p>
                <p className="text-muted-foreground">
                  {calendarDays[selectedDate!]?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                </p>
                <p className="text-lg font-semibold text-foreground mt-2">
                  {services.find(s => s.id === selectedService)?.price}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes (optional)</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests or notes"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <Button 
              size="lg" 
              variant="hero"
              className="w-full"
              disabled={!formData.name || !formData.email || !formData.phone}
              onClick={handleSubmit}
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
