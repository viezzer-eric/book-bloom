import { Calendar, Clock, Bell, Users, Sparkles, Shield } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Calendar",
    description: "Manage your availability with an intuitive drag-and-drop calendar. Set working hours, block time off, and sync with your existing tools.",
  },
  {
    icon: Clock,
    title: "Real-Time Booking",
    description: "Clients see your live availability and can book instantly. No more back-and-forth emails or phone calls.",
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description: "Reduce no-shows with automated email and SMS reminders sent to both you and your clients.",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Keep track of client history, preferences, and notes. Build lasting relationships with personalized service.",
  },
  {
    icon: Sparkles,
    title: "Beautiful Booking Page",
    description: "Your personalized booking page reflects your brand. Easy to share and looks great on any device.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security protects your data. 99.9% uptime means you never miss a booking.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Everything you need to manage appointments
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for service professionals who want to spend less time managing and more time doing what they love.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
