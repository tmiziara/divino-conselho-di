import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, MessageCircle, Heart, User, Star, GraduationCap, Bell, Settings } from "lucide-react";
import { useMobileFeatures } from "@/hooks/use-mobile";
import { useShouldShowMobileNav, useDeviceType } from "@/hooks/useTablet";

const MobileBottomNavigation = () => {
  const location = useLocation();
  const { hapticFeedback } = useMobileFeatures();
  const shouldShow = useShouldShowMobileNav();
  const { isTablet } = useDeviceType();

  // Não mostrar em desktop
  if (!shouldShow) return null;

  const handleNavClick = () => {
    hapticFeedback();
  };

  const isActive = (path: string) => location.pathname === path;

  // Itens principais da navegação (os mais importantes)
  const mainNavItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/biblia', label: 'Bíblia', icon: BookOpen },
    { path: '/versiculo-do-dia', label: 'Versículo', icon: Star },
    { path: '/estudos', label: 'Estudos', icon: GraduationCap },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
  ];

  // Para tablets, podemos mostrar mais itens
  const tabletNavItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/biblia', label: 'Bíblia', icon: BookOpen },
    { path: '/versiculo-do-dia', label: 'Versículo', icon: Star },
    { path: '/estudos', label: 'Estudos', icon: GraduationCap },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/favoritos', label: 'Favoritos', icon: Heart },
    { path: '/notificacoes', label: 'Notificações', icon: Bell },
    { path: '/perfil', label: 'Perfil', icon: User },
  ];

  const navItems = isTablet ? tabletNavItems : mainNavItems;

  return (
    <div className="mobile-bottom-nav">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors duration-200 ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className={`${isTablet ? 'w-6 h-6' : 'w-5 h-5'} mb-1 flex-shrink-0`} />
            <span className={`${isTablet ? 'text-xs' : 'text-xs'} text-center leading-tight truncate max-w-full`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;

