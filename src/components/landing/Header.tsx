import { Button } from "@/components/ui/button";
import { Calendar, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-semibold text-foreground">Bookly</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                Features
              </Link>
              <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                Pricing
              </Link>
              <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                About
              </Link>
              <div className="flex gap-2 mt-2 px-4">
                <Link to="/dashboard" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/dashboard" className="flex-1">
                  <Button size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
