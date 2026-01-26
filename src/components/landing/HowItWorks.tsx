import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Set up your business details, add your services, and define your pricing. It takes less than 5 minutes.",
    details: ["Business name & description", "Service catalog", "Pricing & duration"],
  },
  {
    number: "02",
    title: "Set Your Availability",
    description: "Define your working hours and block off personal time. Your calendar syncs in real-time.",
    details: ["Working hours", "Buffer times", "Holiday scheduling"],
  },
  {
    number: "03",
    title: "Share & Accept Bookings",
    description: "Share your unique booking link. Clients book directly and you both get instant confirmations.",
    details: ["Shareable booking page", "Instant notifications", "Calendar sync"],
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            No complicated setup. No technical skills required. Just simple scheduling that works.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0" />
              )}
              
              <div className="relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-display font-bold text-primary/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
