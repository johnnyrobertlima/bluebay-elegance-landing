
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, Music } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-display text-3xl font-bold text-background">
                BLUEBAY
              </span>
            </Link>
            <p className="font-body text-sm text-background/70 leading-relaxed">
              Há mais de 30 anos trazendo o melhor da moda internacional para o Brasil.
              Qualidade, elegância e estilo em cada peça.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/bluebayoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/bluebaycomercial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@bluebayoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors duration-200"
                aria-label="TikTok"
              >
                <Music className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold">Links Rápidos</h4>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/colecao"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Coleção OI26
              </Link>
              <Link
                to="/masculino"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Moda Masculina
              </Link>
              <Link
                to="/feminino"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Moda Feminina
              </Link>
              <Link
                to="/sobre"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Sobre Nós
              </Link>
            </nav>
          </div>

          {/* Client Area */}
          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold">Área do Cliente</h4>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/login"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Fazer Login
              </Link>
              <Link
                to="/catalogo"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Catálogo Digital
              </Link>
              <Link
                to="/pedidos"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Meus Pedidos
              </Link>
              <Link
                to="/downloads"
                className="font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                Downloads
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold">Contato</h4>
            <div className="flex flex-col space-y-4">
              <a
                href="mailto:vendas@bluebay.com.br"
                className="flex items-center space-x-3 font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>vendas@bluebay.com.br</span>
              </a>
              <a
                href="tel:+551126189758"
                className="flex items-center space-x-3 font-body text-sm text-background/70 hover:text-background transition-colors duration-200"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>(11) 2618-9758</span>
              </a>
              <div className="flex items-start space-x-3 font-body text-sm text-background/70">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-background/50">
              © {currentYear} Bluebay. Todos os direitos reservados - Desenvolvido por <a href="https://www.oniagencia.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">Oni Agência</a>
            </p>
            <p className="font-body text-xs text-background/50">
              +30 anos de tradição em moda importada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
