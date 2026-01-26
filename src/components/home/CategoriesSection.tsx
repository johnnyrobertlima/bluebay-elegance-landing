
import { useState, useEffect } from "react";
import { ArrowRight, FileText, Download, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchCatalogs, CatalogItemData } from "@/services/bluebay_adm/landingPageService";

const CategoriesSection = () => {
  const [catalogs, setCatalogs] = useState<CatalogItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCatalogs();
      // Filter to only active ones
      setCatalogs(data.filter(c => c.active));
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-muted flex justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </section>
    );
  }

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
            especialmente para você. Confira nossos catálogos completos.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {catalogs.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-hover transition-all duration-500 bg-background"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category.cover_image_url}
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

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={category.link_url || (category.title.toLowerCase().includes('masculino') ? '/masculino' : '/feminino')}
                    className="flex items-center gap-2 font-body font-medium text-bluebay-sky hover:text-white transition-all duration-300"
                  >
                    Explorar coleção
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  {category.pdf_url && (
                    <a
                      href={category.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-body font-medium text-white bg-bluebay-navy/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-bluebay-navy/60 transition-all duration-300"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Catálogo PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
