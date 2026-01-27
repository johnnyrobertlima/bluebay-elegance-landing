import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/components/home/HeroSection";
import CollectionSection from "@/components/home/CollectionSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import AboutSection from "@/components/home/AboutSection";
import SocialSection from "@/components/home/SocialSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  const { user, loading, homePage } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in and not currently loading, and has a dedicated homePage
    // redirect them away from landing page to their dashboard/home area
    if (!loading && user && homePage && homePage !== "/") {
      console.log("[Index] Authenticated user on root, redirecting to:", homePage);
      navigate(homePage);
    }
  }, [user, loading, homePage, navigate]);

  if (loading) return null; // Or a global spinner
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <HeroSection />
        <CollectionSection />
        <CategoriesSection />
        <AboutSection />
        <SocialSection />
        <CTASection />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
