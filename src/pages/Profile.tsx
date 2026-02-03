import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Calendar, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AuthDialog from '@/components/AuthDialog';
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";

const profileSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  gender: z.enum(["masculino", "feminino", "outros"]),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Senha atual obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, signOut } = useAuth();
  const { subscription, openCustomerPortal, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const isEnglish = language === "en";
  const tx = useCallback((pt: string, en: string) => (isEnglish ? en : pt), [isEnglish]);
  const deletePhrase = isEnglish ? "DELETE MY ACCOUNT" : "EXCLUIR MINHA CONTA";
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const handleAuthClick = () => setShowAuth(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      email: "",
      gender: "masculino",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        profileForm.reset({
          display_name: data.display_name || "",
          email: data.email || user.email || "",
          gender: (data.gender as "masculino" | "feminino" | "outros") || "masculino",
        });

      }
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível carregar o perfil", "Could not load the profile"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [profileForm, toast, tx, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, user]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: data.display_name,
          email: data.email,
          gender: data.gender,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: tx("Sucesso", "Success"),
        description: tx("Perfil atualizado com sucesso", "Profile updated successfully"),
      });

      fetchProfile();
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível atualizar o perfil", "Could not update the profile"),
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = async (nextLanguage: "pt" | "en") => {
    setIsSavingLanguage(true);

    try {
      await setLanguage(nextLanguage);

      if (user?.id) {
        const payload = {
          language: nextLanguage,
          updated_at: new Date().toISOString(),
        };

        const { data: updatedRows, error: updateError } = await supabase
          .from("profiles")
          .update(payload)
          .eq("user_id", user.id)
          .select("user_id");

        if (updateError) throw updateError;

        if (!updatedRows || updatedRows.length === 0) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              language: nextLanguage,
              updated_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }
      }

      toast({ title: t("language.changeSuccess") });
    } catch (error) {
      toast({
        title: t("language.changeError"),
        variant: "destructive",
      });
    } finally {
      setIsSavingLanguage(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: tx("Sucesso", "Success"),
        description: tx("Senha atualizada com sucesso", "Password updated successfully"),
      });

      passwordForm.reset();
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível atualizar a senha", "Could not update the password"),
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const data = await openCustomerPortal();
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível abrir o portal de assinaturas.", "Could not open the subscriptions portal."),
        variant: "destructive",
      });
    }
  };

  // Função para excluir conta
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== deletePhrase) {
      toast({
        title: tx("Confirmação incorreta", "Incorrect confirmation"),
        description: tx(`Digite exatamente '${deletePhrase}' para confirmar.`, `Type exactly '${deletePhrase}' to confirm.`),
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Você precisa estar logado para excluir sua conta.", "You must be logged in to delete your account."),
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);

    try {
      // 1. Excluir dados do usuário
      const { error: favoritesError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

      if (favoritesError) {
      }

      // 2. Excluir dados de progresso (se existir)
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) {
      }

      // 3. Excluir dados de assinatura (se existir)
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (subscriptionError) {
      }

      // 4. Excluir dados de créditos (se existir)
      const { error: creditsError } = await supabase
        .from('user_credits')
        .delete()
        .eq('user_id', user.id);

      if (creditsError) {
      }

      // 5. Excluir a conta do usuário
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        throw authError;
      }

      toast({
        title: tx("Conta excluída", "Account deleted"),
        description: tx("Sua conta foi excluída com sucesso. Todos os dados foram removidos.", "Your account was deleted successfully. All data was removed."),
      });

      // Fazer logout e redirecionar
      await signOut();
      window.location.href = "/";

    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível excluir sua conta. Tente novamente ou entre em contato conosco.", "Could not delete your account. Please try again or contact us."),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanDisplayName = (tier: string) => {
    switch (tier) {
      case "premium": return "Premium";
      default: return tx("Gratuito", "Free");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
                {tx("Perfil", "Profile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                {tx("Faça login para acessar e gerenciar seu perfil", "Sign in to access and manage your profile")}
              </p>
              <Button className="divine-button" onClick={handleAuthClick}>
                {tx("Fazer Login", "Sign In")}
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 pt-4 pb-8 max-w-4xl flex flex-col items-center">
        <div className="mb-6 w-full text-center">
          <h1 className="text-3xl font-bold mx-auto">{tx("Meu Perfil", "My Profile")}</h1>
          <p className="text-muted-foreground">{tx("Gerencie suas informações pessoais", "Manage your personal information")}</p>
        </div>
        {!subscriptionLoading && subscription !== undefined && (
          <div className="mb-6 w-full text-center">
            {subscription.subscribed && (
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                <Crown className="w-4 h-4 mr-1" />
                {getPlanDisplayName(subscription.subscription_tier)}
              </Badge>
            )}
          </div>
        )}
        <Card className="mb-6 w-full max-w-xl bg-card dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>{t("profile.languageTitle")}</CardTitle>
            <CardDescription>{t("profile.languageDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={language}
              onValueChange={(value) => {
                if (value === "pt" || value === "en") {
                  void handleLanguageChange(value);
                }
              }}
              disabled={isSavingLanguage}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">{t("language.pt")}</SelectItem>
                <SelectItem value="en">{t("language.en")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          {/* Subscription Status */}
          <Card className="bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                {tx("Status da Assinatura", "Subscription Status")}
              </CardTitle>
              <CardDescription>
                {tx("Gerencie sua assinatura e planos", "Manage your subscription and plans")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{tx("Plano Atual", "Current Plan")}</p>
                  <p className="text-sm text-muted-foreground">
                    {getPlanDisplayName(subscription.subscription_tier)}
                  </p>
                </div>
                <Badge 
                  variant={subscription.subscribed ? "default" : "secondary"}
                  className="text-sm"
                >
                  {subscription.subscribed ? tx("Ativo", "Active") : tx("Gratuito", "Free")}
                </Badge>
              </div>
              
              {subscription.subscription_end && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{tx("Próxima renovação", "Next renewal")}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(subscription.subscription_end)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                {subscription.subscribed ? (
                  <Button onClick={handleManageSubscription} className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {tx("Gerenciar Assinatura", "Manage Subscription")}
                  </Button>
                ) : (
                  <Link to="/assinatura?plan=premium" className="flex-1">
                    <Button className="w-full divine-button">
                      <Crown className="w-4 h-4 mr-2" />
                      {tx("Upgrade para Premium", "Upgrade to Premium")}
                    </Button>
                  </Link>
                )}
                <Link to="/assinatura">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {tx("Ver Planos", "View Plans")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Pessoais */}
          <Card className="bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>{tx("Informações Pessoais", "Personal Information")}</CardTitle>
              <CardDescription>
                {tx("Atualize suas informações de perfil", "Update your profile information")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tx("Nome de Exibição", "Display Name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={tx("Seu nome", "Your name")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tx("Gênero", "Gender")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={tx("Selecione seu gênero", "Select your gender")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="masculino">{tx("Masculino", "Male")}</SelectItem>
                            <SelectItem value="feminino">{tx("Feminino", "Female")}</SelectItem>
                            <SelectItem value="outros">{tx("Outros", "Other")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    {tx("Atualizar Perfil", "Update Profile")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="bg-card dark:bg-zinc-900 mb-2">
            <CardHeader>
              <CardTitle className="text-lg">{tx("Alterar Senha", "Change Password")}</CardTitle>
              <CardDescription className="text-sm">
                {tx("Mantenha sua conta segura", "Keep your account secure")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-2">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">{tx("Senha Atual", "Current Password")}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-9 py-2 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">{tx("Nova Senha", "New Password")}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-9 py-2 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">{tx("Confirmar Nova Senha", "Confirm New Password")}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-9 py-2 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-9 text-sm mt-1">
                    {tx("Alterar Senha", "Change Password")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Exclusão de Conta - NOVO CARD */}
          <Card className="bg-card dark:bg-zinc-900 mb-2 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {tx("Excluir Conta", "Delete Account")}
              </CardTitle>
              <CardDescription className="text-sm">
                {tx("Exclua permanentemente sua conta e todos os dados associados", "Permanently delete your account and all associated data")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2"><strong>{tx("⚠️ Atenção:", "⚠️ Warning:")}</strong> {tx("Esta ação é irreversível.", "This action is irreversible.")}</p>
                  <p className="mb-2">{tx("Serão excluídos:", "The following will be deleted:")}</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{tx("Favoritos salvos", "Saved favorites")}</li>
                    <li>{tx("Progresso de estudos", "Study progress")}</li>
                    <li>{tx("Histórico de chat", "Chat history")}</li>
                    <li>{tx("Dados de assinatura", "Subscription data")}</li>
                    <li>{tx("Créditos disponíveis", "Available credits")}</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="deleteConfirmation" className="text-sm">
                      {tx(`Digite "${deletePhrase}" para confirmar`, `Type "${deletePhrase}" to confirm`)}
                    </Label>
                    <Input
                      id="deleteConfirmation"
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder={deletePhrase}
                      className="h-9 py-2 text-sm font-mono"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== deletePhrase || isDeleting}
                    className="w-full h-9 text-sm bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {tx("Excluindo conta...", "Deleting account...")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {tx("Excluir Conta Permanentemente", "Delete Account Permanently")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          </div>
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Profile;
