import { Award, Globe, Shield, Truck } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Globe,
      title: "Importação Direta",
      description: "Peças exclusivas importadas diretamente das melhores marcas internacionais.",
    },
    {
      icon: Award,
      title: "30+ Anos de Experiência",
      description: "Tradição e expertise no mercado de moda importada no Brasil.",
    },
    {
      icon: Shield,
      title: "Qualidade Garantida",
      description: "Todos os produtos passam por rigoroso controle de qualidade.",
    },
    {
      icon: Truck,
      title: "Entrega Nacional",
      description: "Atendemos lojistas em todo o território brasileiro.",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block font-body text-sm font-medium tracking-widest text-primary uppercase mb-4">
              Nossa História
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Tradição e Excelência
              <span className="text-primary"> desde 1994</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">
              A Bluebay é uma das marcas mais respeitadas do Brasil quando se trata de 
              importação de confecções. Com mais de três décadas de experiência, nos 
              especializamos em trazer o melhor da moda internacional com qualidade 
              incomparável e preços competitivos.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Nosso compromisso é oferecer peças que combinem elegância, conforto e 
              durabilidade, atendendo lojistas exigentes que buscam diferenciação 
              para seus clientes.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="font-body text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-elegant">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1000&fit=crop"
                alt="Loja Bluebay"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-card rounded-xl shadow-hover p-6 max-w-xs">
              <p className="font-display text-4xl font-bold text-primary mb-2">30+</p>
              <p className="font-body text-foreground font-medium">Anos de tradição</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Referência em moda importada no Brasil
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
