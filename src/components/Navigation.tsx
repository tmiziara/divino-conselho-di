import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Home, BookOpen, MessageCircle, Heart, User as UserIcon, X, GraduationCap, Sparkles, Settings as SettingsIcon, Bell, Sun, Moon, Star, CalendarDays, NotebookPen, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMobileFeatures } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

interface NavigationProps {
  onAuthClick: () => void;
}

const Navigation = ({ onAuthClick }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const { hapticFeedback } = useMobileFeatures();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { t } = useTranslation();

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
    { path: "/", label: t("navigation.home"), icon: Home },
    { path: "/biblia", label: t("navigation.bible"), icon: BookOpen },
    { path: "/versiculo-do-dia", label: t("navigation.verseOfDay"), icon: Star },
    { path: "/estudos", label: t("navigation.studies"), icon: GraduationCap },
    { path: "/planos", label: t("navigation.readingPlans"), icon: CalendarDays },
    { path: "/resumo-semanal", label: t("navigation.weeklySummary"), icon: BarChart3 },
    { path: "/diario", label: t("navigation.prayerJournal"), icon: NotebookPen },
    { path: "/chat", label: t("navigation.chat"), icon: MessageCircle },
    { path: "/favoritos", label: t("navigation.favorites"), icon: Heart },
    { path: "/notificacoes", label: t("navigation.notifications"), icon: Bell },
    { path: "/perfil", label: t("navigation.profile"), icon: UserIcon },
    { path: "/configuracoes", label: t("navigation.settings"), icon: SettingsIcon },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="flex items-center relative">
              <span className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2" />
              </span>
              <span className="ml-3 font-bold text-xl heavenly-text">{t("app.name")}</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant={isActive(item.path) ? "default" : "ghost"} className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggle} aria-label={t("navigation.toggleDarkMode")}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:ml-2">{t("navigation.logout")}</span>
              </Button>
            ) : (
              <Button onClick={handleAuthClick} className="divine-button">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:block">{t("navigation.login")}</span>
              </Button>
            )}

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleMenuClick}>
                  <span className="text-sm font-medium">{t("navigation.menu")}</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{t("navigation.menu")}</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm" className="absolute right-4 top-4">
                      <X className="w-4 h-4" />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="px-4 pb-16 space-y-2">
                  {menuItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsDrawerOpen(false)}>
                      <Button variant={isActive(item.path) ? "default" : "ghost"} className="w-full justify-start">
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
