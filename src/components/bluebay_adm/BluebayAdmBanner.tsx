
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// Fallback banner component that doesn't depend on the banners table
export const BluebayAdmBanner = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const banners = [
    {
      id: "1",
      title: "Bluebay Gestão Administrativa",
      description: "Gerencie seus clientes, faturamentos e acompanhe seus indicadores em um só lugar.",
      image_url: null,
      button_text: null,
      button_link: null,
    }
  ];

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setTimeout(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentBannerIndex, banners.length]);

  const banner = banners[currentBannerIndex];

  return (
    <div className="relative h-[30vh] min-h-[250px] w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-500">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto h-full flex items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {banner.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-6">
            {banner.description}
          </p>
          {banner.button_text && (
            <a 
              href={banner.button_link || "#"} 
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {banner.button_text}
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
};
