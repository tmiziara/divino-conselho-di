import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Menu, User, Crown, LogOut, Home, BookOpen, MessageCircle, Heart, User as UserIcon, X, GraduationCap, Sparkles, Settings as SettingsIcon, Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsMobile, useMobileFeatures } from "@/hooks/use-mobile";
import { useSystemNavigation } from "@/hooks/useSystemNavigation";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";

interface NavigationProps {
  onAuthClick: () => void;
}

const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return {
    isDark,
    setIsDark,
    toggle: () => setIsDark((v) => !v),
  };
};

const Navigation = ({ onAuthClick }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const isMobile = useIsMobile();
  const { hapticFeedback } = useMobileFeatures();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  const handleMenuClick = () => {
    hapticFeedback();
    setIsDrawerOpen(true);
  };

  const handleAuthClick = () => {
    hapticFeedback();
    onAuthClick();
  };

  const handleSignOut = async () => {
    hapticFeedback();
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/biblia', label: 'Bíblia', icon: BookOpen },
    { path: '/estudos', label: 'Estudos Bíblicos', icon: GraduationCap },
    { path: '/chat', label: 'Conversa', icon: MessageCircle },
    { path: '/favoritos', label: 'Favoritos', icon: Heart },
    { path: '/notificacoes', label: 'Notificações', icon: Bell },
    { path: '/perfil', label: 'Perfil', icon: UserIcon },
    { path: '/configuracoes', label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="flex items-center relative">
              <span className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2" />
              </span>
              <span className="ml-3 font-bold text-xl heavenly-text">Conexão com Deus</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth */}
          <div className="flex items-center space-x-2">
            {/* Botão de alternância de tema */}
            <Button variant="ghost" size="sm" onClick={toggle} aria-label="Alternar modo noturno">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {/* Botão de login/logout */}
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:ml-2">Sair</span>
              </Button>
            ) : (
              <Button onClick={handleAuthClick} className="divine-button">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:block">Entrar</span>
              </Button>
            )}
            {/* Botão do menu lateral (Drawer) */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleMenuClick}>
                  <Menu className="w-5 h-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm" className="absolute right-4 top-4">
                      <X className="w-4 h-4" />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="px-4 pb-16 space-y-2">
                  {menuItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsDrawerOpen(false)}>
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
