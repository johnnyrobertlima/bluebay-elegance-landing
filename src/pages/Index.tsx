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
