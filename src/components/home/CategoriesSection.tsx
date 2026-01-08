import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CategoriesSection = () => {
  const categories = [
    {
      id: "masculino",
      title: "Moda Masculina",
      description: "Elegância e sofisticação para o homem moderno. Blazers, casacos, jaquetas e muito mais.",
      image: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&h=600&fit=crop",
      href: "/masculino",
    },
    {
      id: "feminino",
      title: "Moda Feminina",
      description: "Peças exclusivas que realçam a beleza e a personalidade. Descubra nossa seleção feminina.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
      href: "/feminino",
    },
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block font-body text-sm font-medium tracking-widest text-primary uppercase mb-4">
            Categorias
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore Nosso Catálogo
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            Peças selecionadas com o mais alto padrão de qualidade importadas 
            especialmente para você.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-hover transition-all duration-500"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-background mb-3">
                  {category.title}
                </h3>
                <p className="font-body text-background/80 text-base md:text-lg mb-6 max-w-md">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 font-body font-medium text-bluebay-sky group-hover:gap-4 transition-all duration-300">
                  Explorar coleção
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
