import { Button } from "@/components/ui/button";
import { Shield, Menu, User, Crown, LogOut, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  onAuthClick: () => void;
}

const Navigation = ({ onAuthClick }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Início", path: "/" },
    { name: "Conversa", path: "/conversa" },
    { name: "Favoritos", path: "/favoritos" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold heavenly-text">
              Conexão com Deus
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  isActive(item.path)
                    ? "text-primary font-medium"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Olá, {user.email?.split('@')[0]}
                </span>
                <Button 
                  onClick={signOut} 
                  variant="outline"
                  size="sm"
                  className="border-primary/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={onAuthClick}>
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
                <Button className="divine-button">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-primary font-medium"
                      : "text-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Logado: {user.email?.split('@')[0]}
                    </p>
                    <Button 
                      onClick={signOut} 
                      variant="outline"
                      className="justify-start border-primary/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="ghost" onClick={onAuthClick} className="justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                    <Button className="divine-button justify-start">
                      <Crown className="w-4 h-4 mr-2" />
                      Premium
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;