import { Button } from "@/components/ui/button";
import { Shield, Menu, User, Crown } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  onAuthClick: () => void;
}

const Navigation = ({ onAuthClick }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold heavenly-text">
              Conexão com Deus
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-foreground hover:text-primary transition-colors">
              Início
            </a>
            <a href="#biblia" className="text-foreground hover:text-primary transition-colors">
              Bíblia
            </a>
            <a href="#conversa" className="text-foreground hover:text-primary transition-colors">
              Conversa Espiritual
            </a>
            <a href="#favoritos" className="text-foreground hover:text-primary transition-colors">
              Favoritos
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={onAuthClick}>
              <User className="w-4 h-4 mr-2" />
              Entrar
            </Button>
            <Button className="divine-button">
              <Crown className="w-4 h-4 mr-2" />
              Premium
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors">
                Início
              </a>
              <a href="#biblia" className="text-foreground hover:text-primary transition-colors">
                Bíblia
              </a>
              <a href="#conversa" className="text-foreground hover:text-primary transition-colors">
                Conversa Espiritual
              </a>
              <a href="#favoritos" className="text-foreground hover:text-primary transition-colors">
                Favoritos
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" onClick={onAuthClick} className="justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
                <Button className="divine-button justify-start">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;