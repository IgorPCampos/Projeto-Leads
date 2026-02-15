import FreightCalculator from "@/components/FreightCalculator";
import { Truck, Shield, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Projeto Leads
            </span>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Cotação de Frete{" "}
              <span className="text-primary">Rápida e Simples</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Calcule o valor do envio entre qualquer CEP do Brasil.
            </p>
          </div>

          <FreightCalculator />
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground"></footer>
    </div>
  );
};

export default Index;
