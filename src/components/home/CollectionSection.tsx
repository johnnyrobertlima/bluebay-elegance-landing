
import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchCollectionConfig,
  fetchPublicCollectionItems,
  CollectionConfigData,
  CollectionItemData
} from "@/services/bluebay_adm/landingPageService";

const CollectionSection = () => {
  const [config, setConfig] = useState<CollectionConfigData | null>(null);
  const [items, setItems] = useState<CollectionItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [configData, collectionItems] = await Promise.all([
        fetchCollectionConfig(),
        fetchPublicCollectionItems()
      ]);

      if (configData) setConfig(configData);
      setItems(collectionItems);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-background flex justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </section>
    );
  }

  const section = config || {
    section_title: "Nova Coleção",
    section_subtitle: "Outono Inverno 2026",
    description: "Peças exclusivas que combinam elegância atemporal com tendências contemporâneas. Descubra o que preparamos para esta temporada.",
    collection_cta_text: "Ver coleção completa",
    collection_cta_link: "/colecao"
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block font-body text-sm font-medium tracking-widest text-primary uppercase mb-4">
            {section.section_title}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            {section.section_subtitle}
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            {section.description}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Link
              key={item.id}
              to={item.product_reference ? `/produtos?ref=${item.product_reference}` : "/colecao"}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-card hover:shadow-hover transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <img
                src={item.image_url}
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
            to={section.collection_cta_link}
            className="inline-flex items-center gap-2 font-body font-medium text-primary hover:text-primary/80 transition-colors duration-200"
          >
            {section.collection_cta_text}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
