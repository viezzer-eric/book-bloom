import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import PricingSection from "@/components/landing/Prices";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <Features id="funcionalidades" />
        <HowItWorks id="como-funciona" />
        <PricingSection id="valores"/>
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
