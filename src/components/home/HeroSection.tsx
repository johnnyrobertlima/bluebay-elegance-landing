
import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchHeroData, HeroSectionData } from "@/services/bluebay_adm/landingPageService";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [data, setData] = useState<HeroSectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const heroData = await fetchHeroData();
      if (heroData) {
        setData(heroData);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-bluebay-navy">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </section>
    );
  }

  // Fallback to defaults if no data (though migration should provide it)
  const hero = data || {
    bg_image_url: heroBg,
    badge_text: "Nova Coleção Outono Inverno 2026",
    heading_text: "Elegância que Atravessa Gerações",
    subtitle_text: "Há mais de 30 anos trazendo o melhor da moda internacional para o Brasil. Descubra peças exclusivas que definem seu estilo.",
    button_primary_text: "Ver Coleção OI26",
    button_primary_link: "/colecao",
    button_secondary_text: "Área do Cliente",
    button_secondary_link: "/login",
    stats_years: "30+",
    stats_clients: "500+",
    stats_products: "1000+"
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero.bg_image_url || heroBg})` }}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-bluebay-navy/60" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-bluebay-ocean/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-bluebay-sky/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {hero.badge_text && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-bluebay-gold animate-pulse" />
              <span className="font-body text-sm text-background/90 tracking-wide">
                {hero.badge_text}
              </span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-background leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {hero.heading_text}
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg md:text-xl text-background/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {hero.subtitle_text}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {hero.button_primary_text && (
              <Link to={hero.button_primary_link}>
                <Button
                  size="lg"
                  className="group bg-background text-foreground hover:bg-background/90 font-body font-medium px-8 py-6 text-base"
                >
                  {hero.button_primary_text}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
            {hero.button_secondary_text && (
              <Link to={hero.button_secondary_link}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-background/30 text-background hover:bg-background/10 font-body font-medium px-8 py-6 text-base"
                >
                  {hero.button_secondary_text}
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-background">{hero.stats_years}</p>
              <p className="font-body text-sm text-background/60 mt-1">Anos de Mercado</p>
            </div>
            <div className="text-center border-x border-background/20">
              <p className="font-display text-3xl md:text-4xl font-bold text-background">{hero.stats_clients}</p>
              <p className="font-body text-sm text-background/60 mt-1">Clientes Ativos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-background">{hero.stats_products}</p>
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
