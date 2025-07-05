import { useState, useEffect } from "react";
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
import { Crown, CreditCard, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

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
  const { user } = useAuth();
  const { subscription, openCustomerPortal, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
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
      console.error('Erro ao buscar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });

      fetchProfile();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso",
      });

      passwordForm.reset();
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a senha",
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
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de assinaturas.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanDisplayName = (tier: string) => {
    switch (tier) {
      case "premium": return "Premium";
      default: return "Gratuito";
    }
  };

  if (loading || subscriptionLoading || subscription === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onAuthClick={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={() => {}} />
      <div className="container mx-auto px-4 pt-4 pb-8 max-w-4xl flex flex-col items-center">
        <div className="mb-6 w-full text-center">
          <h1 className="text-3xl font-bold mx-auto">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
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
        <div className="grid gap-6">
          {/* Subscription Status */}
          <Card className="bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Status da Assinatura
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura e planos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Plano Atual</p>
                  <p className="text-sm text-muted-foreground">
                    {getPlanDisplayName(subscription.subscription_tier)}
                  </p>
                </div>
                <Badge 
                  variant={subscription.subscribed ? "default" : "secondary"}
                  className="text-sm"
                >
                  {subscription.subscribed ? "Ativo" : "Gratuito"}
                </Badge>
              </div>
              
              {subscription.subscription_end && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Próxima renovação</p>
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
                    Gerenciar Assinatura
                  </Button>
                ) : (
                  <Link to="/assinatura?plan=premium" className="flex-1">
                    <Button className="w-full divine-button">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade para Premium
                    </Button>
                  </Link>
                )}
                <Link to="/assinatura">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Pessoais */}
          <Card className="bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
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
                        <FormLabel>Nome de Exibição</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
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
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu gênero" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Atualizar Perfil
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="bg-card dark:bg-zinc-900 mb-2">
            <CardHeader>
              <CardTitle className="text-lg">Alterar Senha</CardTitle>
              <CardDescription className="text-sm">
                Mantenha sua conta segura
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
                        <FormLabel className="text-sm">Senha Atual</FormLabel>
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
                        <FormLabel className="text-sm">Nova Senha</FormLabel>
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
                        <FormLabel className="text-sm">Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="h-9 py-2 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-9 text-sm mt-1">
                    Alterar Senha
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;