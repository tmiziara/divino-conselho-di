import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, MessageCircle, Heart, User, Star, GraduationCap, Bell, CalendarDays, NotebookPen } from "lucide-react";
import { useMobileFeatures } from "@/hooks/use-mobile";
import { useShouldShowMobileNav, useDeviceType } from "@/hooks/useTablet";
import { useTranslation } from "react-i18next";

const MobileBottomNavigation = () => {
  const location = useLocation();
  const { hapticFeedback } = useMobileFeatures();
  const shouldShow = useShouldShowMobileNav();
  const { isTablet } = useDeviceType();
  const { t } = useTranslation();

  if (!shouldShow) return null;

  const handleNavClick = () => {
    hapticFeedback();
  };

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems = [
    { path: "/", label: t("navigation.home"), icon: Home },
    { path: "/biblia", label: t("navigation.bible"), icon: BookOpen },
    { path: "/versiculo-do-dia", label: t("navigation.verseShort"), icon: Star },
    { path: "/estudos", label: t("navigation.studies"), icon: GraduationCap },
    { path: "/planos", label: t("navigation.plansShort"), icon: CalendarDays },
    { path: "/diario", label: t("navigation.journalShort"), icon: NotebookPen },
    { path: "/chat", label: t("navigation.chat"), icon: MessageCircle },
  ];

  const tabletNavItems = [
    { path: "/", label: t("navigation.home"), icon: Home },
    { path: "/biblia", label: t("navigation.bible"), icon: BookOpen },
    { path: "/versiculo-do-dia", label: t("navigation.verseShort"), icon: Star },
    { path: "/estudos", label: t("navigation.studies"), icon: GraduationCap },
    { path: "/planos", label: t("navigation.plansShort"), icon: CalendarDays },
    { path: "/diario", label: t("navigation.journalShort"), icon: NotebookPen },
    { path: "/chat", label: t("navigation.chat"), icon: MessageCircle },
    { path: "/favoritos", label: t("navigation.favorites"), icon: Heart },
    { path: "/notificacoes", label: t("navigation.notifications"), icon: Bell },
    { path: "/perfil", label: t("navigation.profile"), icon: User },
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
              isActive(item.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`${isTablet ? "w-6 h-6" : "w-5 h-5"} mb-1 flex-shrink-0`} />
            <span className="text-xs text-center leading-tight truncate max-w-full">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
