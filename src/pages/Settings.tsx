import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Info, Shield, Bell, Languages, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "@/components/AuthDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";

const APP_VERSION = "1.0.0";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [showAuth, setShowAuth] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{ enabled: boolean; message: string } | null>(null);
  const { getNotificationStatus, testNotification } = useNotifications({ enableInitialization: false });

  const handleAuthClick = () => setShowAuth(true);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    getNotificationStatus().then((status) => setNotificationStatus(status));
  }, [getNotificationStatus]);

  const handleLanguageChange = async (nextLanguage: string) => {
    if (nextLanguage !== "pt" && nextLanguage !== "en") return;

    setIsSavingLanguage(true);

    try {
      await setLanguage(nextLanguage);

      if (user?.id) {
        const { error } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: user.id,
              language: nextLanguage,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (error) throw error;
      }

      toast({
        title: t("language.changeSuccess"),
      });
    } catch (error) {
      toast({
        title: t("language.changeError"),
        variant: "destructive",
      });
    } finally {
      setIsSavingLanguage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("settings.backHome")}
          </Button>
        </div>

        <h2 className="text-2xl font-bold heavenly-text text-center mb-6">{t("settings.title")}</h2>

        <div className="flex flex-col gap-6 items-center">
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold">{t("settings.version", { version: APP_VERSION })}</span>
          </div>

          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">{t("settings.privacyPolicy")}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-primary hover:text-primary/80"
              onClick={() => navigate("/politica-privacidade")}
            >
              {t("settings.viewPolicy")}
            </Button>
          </div>

          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              <div className="w-full">
                <span className="font-semibold">{t("language.label")}</span>
                <Select value={language} onValueChange={handleLanguageChange} disabled={isSavingLanguage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">{t("language.pt")}</SelectItem>
                    <SelectItem value="en">{t("language.en")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold">{t("settings.notifications")}</span>
                <p className="text-sm text-muted-foreground">
                  {notificationStatus?.message || t("settings.checkingNotificationStatus")}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => testNotification()}>
              {t("settings.testNotification")}
            </Button>
          </div>

          <Button variant="outline" className="w-full max-w-xs flex items-center gap-2 mt-4" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            {t("settings.logout")}
          </Button>
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
}
