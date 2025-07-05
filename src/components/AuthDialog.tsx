import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Mail, Lock, User, Shield, Crown, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("masculino");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: "R$ 0",
      description: "Recursos básicos para começar",
      icon: Star,
      features: ["Leitura completa da Bíblia", "Busca básica", "Favoritos limitados (10)"]
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 45/mês",
      description: "Para líderes espirituais",
      icon: Zap,
      features: ["Tudo do Básico", "Chat ilimitado", "Comentários avançados", "Grupos de estudo"]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });
        
        onOpenChange(false);
      } else {
        // Sign up process
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: name,
              gender: gender,
              selected_plan: selectedPlan,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });

        onOpenChange(false);

        // If user selected a paid plan, redirect to subscription page
        if (selectedPlan !== "free") {
          setTimeout(() => {
            window.location.href = "/assinatura";
          }, 2000);
        }
      }
      
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
      setGender("masculino");
      setSelectedPlan("free");
    } catch (error: any) {
      toast({
        title: isLogin ? "Erro no login" : "Erro ao criar conta",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary" />
              <Heart className="w-4 h-4 text-accent absolute -bottom-1 -right-1" />
            </div>
          </div>
          <DialogTitle className="text-2xl heavenly-text">
            {isLogin ? "Bem-vindo de volta" : "Comece sua jornada"}
          </DialogTitle>
          <DialogDescription>
            {isLogin 
              ? "Entre em sua conta para continuar sua caminhada espiritual"
              : "Crie sua conta e conecte-se com o Divino"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <Label>Gênero</Label>
              <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="masculino" />
                  <Label htmlFor="masculino">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feminino" id="feminino" />
                  <Label htmlFor="feminino">Feminino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outros" id="outros" />
                  <Label htmlFor="outros">Outros</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Escolha seu plano</Label>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="grid grid-cols-1 gap-2">
                  {plans.map((plan) => {
                    const IconComponent = plan.icon;
                    return (
                      <div key={plan.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={plan.id} id={plan.id} />
                        <Label htmlFor={plan.id} className="flex-1">
                          <Card 
                            className={`cursor-pointer transition-all ${
                              selectedPlan === plan.id 
                                ? 'ring-2 ring-primary bg-primary/5' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <CardHeader className="pb-1 pt-3 px-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <IconComponent className="w-3 h-3 text-primary" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-sm">{plan.name}</CardTitle>
                                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary text-sm">{plan.price}</div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-2 px-3">
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {plan.features.map((feature, index) => (
                                  <li key={index}>• {feature}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          )}

          <Button type="submit" className="w-full divine-button" disabled={isLoading}>
            {isLoading ? (isLogin ? "Entrando..." : "Criando conta...") : (isLogin ? "Entrar" : "Criar conta")}
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
            ou
          </span>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary/80"
          >
            {isLogin 
              ? "Não tem uma conta? Cadastre-se" 
              : "Já tem uma conta? Faça login"
            }
          </Button>
        </div>

        {isLogin && (
          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground">
              Esqueceu sua senha?
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
