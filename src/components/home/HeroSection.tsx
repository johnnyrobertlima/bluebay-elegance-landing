import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-navy opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-bluebay-ocean/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-bluebay-sky/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-bluebay-gold animate-pulse" />
            <span className="font-body text-sm text-background/90 tracking-wide">
              Nova Coleção Outono Inverno 2026
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-background leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Elegância que
            <span className="block text-bluebay-sky">Atravessa Gerações</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg md:text-xl text-background/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Há mais de 30 anos trazendo o melhor da moda internacional para o Brasil. 
            Descubra peças exclusivas que definem seu estilo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/colecao">
              <Button
                size="lg"
                className="group bg-background text-foreground hover:bg-background/90 font-body font-medium px-8 py-6 text-base"
              >
                Ver Coleção OI26
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-background/30 text-background hover:bg-background/10 font-body font-medium px-8 py-6 text-base"
              >
                Área do Cliente
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-background">30+</p>
              <p className="font-body text-sm text-background/60 mt-1">Anos de Mercado</p>
            </div>
            <div className="text-center border-x border-background/20">
              <p className="font-display text-3xl md:text-4xl font-bold text-background">500+</p>
              <p className="font-body text-sm text-background/60 mt-1">Clientes Ativos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-background">1000+</p>
              <p className="font-body text-sm text-background/60 mt-1">Produtos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-background/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-background/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
