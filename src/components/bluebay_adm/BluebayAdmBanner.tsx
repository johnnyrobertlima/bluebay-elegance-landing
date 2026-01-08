
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { getStorageUrl } from "@/utils/imageUtils";
import { useEffect, useState } from "react";
import { Banner } from "@/types/banner";

export const BluebayAdmBanner = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["active-banners", "bluebay_adm"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .or('page_location.eq.bluebay_adm,page_location.eq.both')
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Banner[];
    },
  });

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const currentBanner = banners[currentBannerIndex];
    const duration = currentBanner?.duration || 5000;

    const timer = setTimeout(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentBannerIndex, banners]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show a fallback banner if no banners are found
  if (!banners || banners.length === 0) {
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
              Bluebay Gestão Administrativa
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 mb-6">
              Gerencie seus clientes, faturamentos e acompanhe seus indicadores em um só lugar.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const banner = banners[currentBannerIndex];
  const imageUrl = getStorageUrl(banner.image_url);

  // Extract YouTube video ID from URL if present
  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(banner.youtube_url);

  return (
    <div className="relative h-[30vh] min-h-[250px] w-full overflow-hidden">
      {videoId ? (
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute w-full h-full object-cover"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
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
          <p className="text-lg sm:text-xl text-gray-200 mb-6">
            {banner.description}
          </p>
          {banner.button_text && (
            <a 
              href={banner.button_link} 
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
