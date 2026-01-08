import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CollectionSection = () => {
  const collectionImages = [
    {
      id: 1,
      title: "Casacos Premium",
      category: "Masculino",
      image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=800&fit=crop",
    },
    {
      id: 2,
      title: "Blazers Elegantes",
      category: "Masculino",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    },
    {
      id: 3,
      title: "Vestidos Sofisticados",
      category: "Feminino",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    },
    {
      id: 4,
      title: "Sobretudos Clássicos",
      category: "Masculino",
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop",
    },
    {
      id: 5,
      title: "Jaquetas de Couro",
      category: "Masculino",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
    },
    {
      id: 6,
      title: "Casacos Femininos",
      category: "Feminino",
      image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block font-body text-sm font-medium tracking-widest text-primary uppercase mb-4">
            Nova Coleção
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Outono Inverno 2026
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            Peças exclusivas que combinam elegância atemporal com tendências contemporâneas. 
            Descubra o que preparamos para esta temporada.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionImages.map((item, index) => (
            <Link
              key={item.id}
              to="/colecao"
              className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-card hover:shadow-hover transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="font-body text-xs font-medium tracking-widest text-bluebay-sky uppercase mb-2">
                  {item.category}
                </span>
                <h3 className="font-display text-xl font-semibold text-background mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
                <div className="flex items-center text-background/80 font-body text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Ver detalhes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/colecao"
            className="inline-flex items-center gap-2 font-body font-medium text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Ver coleção completa
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
