import { Instagram } from "lucide-react";
import SocialLinks from "@/components/layout/SocialLinks";

const SocialSection = () => {
  const instagramPosts = [
    "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop",
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-body text-sm font-medium tracking-widest text-primary uppercase mb-4">
            Siga-nos
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            @bluebay no Instagram
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed mb-8">
            Acompanhe nossas novidades, lançamentos e inspire-se com nossos looks 
            exclusivos nas redes sociais.
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center">
            <SocialLinks size="lg" />
          </div>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instagramPosts.map((post, index) => (
            <a
              key={index}
              href="https://instagram.com/bluebay"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={post}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 flex items-center justify-center transition-all duration-300">
                <Instagram className="h-8 w-8 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/bluebay"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body font-medium text-primary hover:text-primary/80 transition-colors duration-200"
          >
            <Instagram className="h-5 w-5" />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialSection;
