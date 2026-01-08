import { ArrowRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-elegant opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-background/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-background/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-8">
            <Lock className="h-4 w-4 text-background" />
            <span className="font-body text-sm text-background/90">
              Área exclusiva para clientes
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-background mb-6 leading-tight">
            Acesse o Catálogo Digital
            <span className="block text-bluebay-sky">e Faça Seus Pedidos</span>
          </h2>

          <p className="font-body text-lg text-background/70 mb-10 leading-relaxed">
            Como cliente Bluebay, você tem acesso exclusivo ao nosso catálogo digital 
            completo, pode fazer pedidos online, acompanhar o histórico de compras 
            e baixar materiais promocionais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="group bg-background text-foreground hover:bg-background/90 font-body font-medium px-8 py-6 text-base"
              >
                Fazer Login
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button
                variant="outline"
                size="lg"
                className="border-background/30 text-background hover:bg-background/10 font-body font-medium px-8 py-6 text-base"
              >
                Quero Ser Cliente
              </Button>
            </Link>
          </div>

          <p className="font-body text-sm text-background/50 mt-8">
            Já é cliente? Entre com suas credenciais para acessar a área exclusiva.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
