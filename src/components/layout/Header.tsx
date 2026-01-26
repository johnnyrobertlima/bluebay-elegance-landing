import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/admin/NotificationBell";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/produtos", label: "Produtos" },
    { href: "/colecao", label: "Coleção OI26" },
    { href: "/sobre", label: "Sobre Nós" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-card"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className={cn(
              "font-display text-2xl font-bold transition-colors duration-300",
              isScrolled ? "text-primary" : "text-white"
            )}>
              BLUEBAY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "font-body text-sm font-medium tracking-wide transition-colors duration-200",
                  location.pathname === link.href
                    ? (isScrolled ? "text-primary" : "text-white underline underline-offset-4")
                    : (isScrolled ? "text-foreground/80 hover:text-primary" : "text-white/80 hover:text-white")
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {isAdmin && (
                  <>
                    <NotificationBell />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/client-area/bluebay_adm')}
                      className={cn(
                        "flex items-center gap-2 transition-colors",
                        isScrolled
                          ? "text-primary hover:text-primary hover:bg-primary/10"
                          : "text-white hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                      Bluebay ADM
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className={cn(
                        "flex items-center gap-2 transition-colors",
                        isScrolled
                          ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isScrolled
                      ? "text-foreground/80 hover:text-primary"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Minha Conta
                </Button>
                <Button
                  size="sm"
                  onClick={handleSignOut}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    isScrolled
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-bluebay-beige-dark text-white hover:bg-bluebay-beige-dark/90 border-none shadow-lg"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  size="sm"
                  className={cn(
                    "hidden sm:flex items-center gap-2 transition-all duration-300",
                    isScrolled
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-bluebay-beige-dark text-white hover:bg-bluebay-beige-dark/90 border-none shadow-lg"
                  )}
                >
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className={cn("h-6 w-6 transition-colors", isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white")} />
              ) : (
                <Menu className={cn("h-6 w-6 transition-colors", isScrolled ? "text-foreground" : "text-white")} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-[500px] pb-6" : "max-h-0"
          )}
        >
          <nav className="flex flex-col space-y-4 pt-4 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "font-body text-sm font-medium tracking-wide transition-colors duration-200 hover:text-primary py-2",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <>
                    <Link
                      to="/client-area/bluebay_adm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-body text-sm font-medium tracking-wide text-primary hover:text-primary py-2 flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      Bluebay ADM
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-body text-sm font-medium tracking-wide text-destructive hover:text-destructive py-2 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Painel Admin
                    </Link>
                  </>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-body text-sm font-medium tracking-wide text-foreground/80 hover:text-primary py-2 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Minha Conta
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
