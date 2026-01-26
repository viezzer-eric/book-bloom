import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Bell,
  Link as LinkIcon
} from "lucide-react";
import { Link } from "react-router-dom";

// Sample data
const appointments = [
  { id: 1, time: "10:00 AM", client: "Sarah Johnson", service: "Facial Treatment", duration: "60 min", status: "confirmed" },
  { id: 2, time: "1:00 PM", client: "Mike Chen", service: "Consultation", duration: "30 min", status: "pending" },
  { id: 3, time: "3:30 PM", client: "Emma Davis", service: "Massage Therapy", duration: "90 min", status: "confirmed" },
];

const services = [
  { id: 1, name: "Facial Treatment", duration: "60 min", price: "$80" },
  { id: 2, name: "Consultation", duration: "30 min", price: "$40" },
  { id: 3, name: "Massage Therapy", duration: "90 min", price: "$120" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("calendar");
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">2</span>
              </Button>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: "calendar", icon: Calendar, label: "Calendar" },
                { id: "services", icon: Clock, label: "Services" },
                { id: "clients", icon: Users, label: "Clients" },
                { id: "settings", icon: Settings, label: "Settings" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            
            {/* Share booking link */}
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Your Booking Link</h4>
              <p className="text-sm text-muted-foreground mb-3">Share this link with clients</p>
              <Link to="/book/demo">
                <Button variant="outline" size="sm" className="w-full">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  View Booking Page
                </Button>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "calendar" && (
              <div className="space-y-6">
                {/* Date navigation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">{formattedDate}</h1>
                    <p className="text-muted-foreground">{appointments.length} appointments today</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">Today</Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Appointments list */}
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div 
                      key={apt.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all"
                    >
                      <div className="w-20 text-center">
                        <span className="text-lg font-semibold text-foreground">{apt.time}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground">{apt.client}</h3>
                        <p className="text-sm text-muted-foreground">{apt.service} · {apt.duration}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'confirmed' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent/10 text-accent'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
                    <p className="text-muted-foreground">Manage your service offerings</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>

                <div className="grid gap-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-card-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.duration}</p>
                      </div>
                      <span className="text-lg font-semibold text-foreground">{service.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "clients" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Clients</h1>
                    <p className="text-muted-foreground">Your client list</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>

                <div className="grid gap-4">
                  {['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'John Smith'].map((client, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {client.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{client}</h3>
                        <p className="text-sm text-muted-foreground">3 appointments · Last visit: Jan 15</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
                  <p className="text-muted-foreground">Manage your business profile</p>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">Business Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Business Name</label>
                        <input 
                          type="text" 
                          defaultValue="Serenity Spa & Wellness"
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <textarea 
                          rows={3}
                          defaultValue="Premium spa and wellness services in downtown."
                          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">Working Hours</h3>
                    <div className="space-y-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="text-foreground font-medium">9:00 AM - 6:00 PM</span>
                        </div>
                      ))}
                      {['Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="text-muted-foreground">Closed</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button>Save Changes</Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
