
import { useState, useEffect } from "react";
import { Instagram, Loader2 } from "lucide-react";
import SocialLinks from "@/components/layout/SocialLinks";
import { fetchInstagramConfig, InstagramConfigData } from "@/services/bluebay_adm/landingPageService";

const SocialSection = () => {
  const [data, setData] = useState<InstagramConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const config = await fetchInstagramConfig();
      if (config) {
        setData(config);
      }
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

  const config = data || {
    username: "@bluebayoficial",
    title: "@bluebayoficial no Instagram",
    subtitle: "Acompanhe nossas novidades, lançamentos e inspire-se com nossos looks exclusivos nas redes sociais.",
    manual_posts: [
      { image_url: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=400&fit=crop", link: "https://www.instagram.com/bluebayoficial" },
      { image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop", link: "https://www.instagram.com/bluebayoficial" },
      { image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop", link: "https://www.instagram.com/bluebayoficial" },
      { image_url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop", link: "https://www.instagram.com/bluebayoficial" },
    ]
  };

  const instagramPosts = config.manual_posts.slice(0, 4);

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-body text-sm font-medium tracking-widest text-primary uppercase mb-4">
            Siga-nos
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            {config.title}
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed mb-8">
            {config.subtitle}
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
              href={post.link || `https://instagram.com/${config.username.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={post.image_url}
                alt={(post as any).caption || `Instagram post ${index + 1}`}
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
            href={`https://instagram.com/${config.username.replace('@', '')}`}
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
