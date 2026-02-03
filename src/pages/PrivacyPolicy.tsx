import React, { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "@/components/AuthDialog";
import { useLanguage } from "@/hooks/useLanguage";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const handleAuthClick = () => setShowAuth(true);
  const { isEnglish } = useLanguage();

  const copy = useMemo(() => {
    if (isEnglish) {
      return {
        back: "Back to Settings",
        title: "Privacy Policy",
        meta: "Last update: July 15, 2025 | Version: 1.3",
        sections: [
          {
            title: "1. GENERAL INFORMATION",
            paragraphs: [
              "This Privacy Policy explains how Conexao com Deus collects, uses, stores, and protects your data. The app is available on mobile (Android/iOS) and web.",
            ],
          },
          {
            title: "2. DATA WE COLLECT",
            paragraphs: ["2.1 Personal information"],
            bullets: [
              "Full name",
              "Email (required for login and communication)",
              "Gender (optional)",
              "Password (stored in encrypted/hashed form)",
            ],
          },
          {
            title: "2.2 Usage data",
            bullets: [
              "Bible reading progress (book, chapter, verse)",
              "Favorites and highlighted verses",
              "Study and devotional history",
              "Notification preferences (themes and schedules)",
              "Spiritual chat interactions with AI",
            ],
          },
          {
            title: "2.3 Technical data",
            bullets: [
              "Device information (model, OS, version)",
              "Network status (online/offline)",
              "Account status (free or premium)",
              "Anonymous usage logs for app improvements",
            ],
          },
          {
            title: "3. HOW WE USE YOUR DATA",
            bullets: [
              "Login and authentication via Supabase",
              "Cross-device sync for progress and favorites",
              "Personalized content and notifications",
              "AI-generated spiritual responses (OpenAI)",
            ],
          },
          {
            title: "4. DATA SHARING",
            bullets: [
              "Supabase: authentication and database",
              "Stripe: payments and subscriptions",
              "Google AdMob: ads for free users",
              "OpenAI: chat response processing",
            ],
          },
          {
            title: "5. STORAGE AND SECURITY",
            bullets: [
              "Local data: chat history, progress, favorites, and settings",
              "Server data protected in Supabase with secure backups",
            ],
          },
          {
            title: "6. ADS AND MONETIZATION",
            bullets: [
              "Free users: banner, interstitial, and rewarded ads",
              "Premium users: ad-free experience and full access",
            ],
          },
          {
            title: "7. NOTIFICATIONS",
            bullets: [
              "Scheduled verses and reminders",
              "Prayer reminders and study updates",
              "Full user control over themes, schedules, and permissions",
            ],
          },
          {
            title: "8. YOUR RIGHTS",
            bullets: [
              "View, edit, or delete your data",
              "Request full account deletion",
              "Disable notifications at any time",
            ],
          },
          {
            title: "9. DATA RETENTION",
            bullets: [
              "Data is kept while your account is active",
              "Full deletion within up to 30 days after request",
              "Technical logs retained up to 90 days (non-identifying)",
            ],
          },
          {
            title: "10. TECHNOLOGIES",
            bullets: [
              "LocalStorage/AsyncStorage for preferences and progress",
              "Web cookies only for basic functionality",
              "Anonymous analytics for product improvement",
            ],
          },
          {
            title: "11. INTERNATIONAL TRANSFERS",
            bullets: [
              "Supabase, Stripe, OpenAI, and AdMob may process data outside Brazil",
            ],
          },
          {
            title: "12. MINORS",
            bullets: [
              "The app is not intended to intentionally collect data from children under 13",
            ],
          },
          {
            title: "13. POLICY CHANGES",
            bullets: [
              "Updates may be announced in-app and by email",
              "Previous versions are kept for reference",
            ],
          },
          {
            title: "14. CONTACT",
            bullets: [
              "Email: [your-email@domain.com]",
              "Support: Monday to Friday, 9AM-6PM",
            ],
          },
          {
            title: "15. AGREEMENT",
            paragraphs: [
              "By using Conexao com Deus, you agree to this Privacy Policy.",
            ],
          },
        ] as Section[],
      };
    }

    return {
      back: "Voltar às Configurações",
      title: "Política de Privacidade",
      meta: "Última atualização: 15 de julho de 2025 | Versão: 1.3",
      sections: [
        {
          title: "1. INFORMAÇÕES GERAIS",
          paragraphs: [
            "Esta Política de Privacidade descreve como o aplicativo Conexao com Deus coleta, utiliza, armazena e protege seus dados. O app está disponível nas versões móvel (Android/iOS) e web.",
          ],
        },
        {
          title: "2. DADOS QUE COLETAMOS",
          paragraphs: ["2.1 Informações pessoais"],
          bullets: [
            "Nome completo",
            "E-mail (obrigatório para login e comunicação)",
            "Gênero (opcional)",
            "Senha (armazenada com proteção criptográfica/hash)",
          ],
        },
        {
          title: "2.2 Dados de uso",
          bullets: [
            "Progresso de leitura bíblica (livro, capítulo, versículo)",
            "Favoritos e destaques de versículos",
            "Histórico de estudos e devocionais",
            "Preferências de notificações (temas e horários)",
            "Interações com o chat espiritual com IA",
          ],
        },
        {
          title: "2.3 Dados técnicos",
          bullets: [
            "Informações do dispositivo (modelo, SO, versão)",
            "Status de rede (online/offline)",
            "Status da conta (gratuito ou premium)",
            "Logs anônimos para melhoria do app",
          ],
        },
        {
          title: "3. COMO USAMOS SEUS DADOS",
          bullets: [
            "Login e autenticação via Supabase",
            "Sincronização de progresso e favoritos entre dispositivos",
            "Personalização de conteúdo e notificações",
            "Geração de respostas espirituais com IA (OpenAI)",
          ],
        },
        {
          title: "4. COMPARTILHAMENTO DE DADOS",
          bullets: [
            "Supabase: autenticação e banco de dados",
            "Stripe: pagamentos e assinaturas",
            "Google AdMob: anúncios para usuários gratuitos",
            "OpenAI: processamento das mensagens do chat",
          ],
        },
        {
          title: "5. ARMAZENAMENTO E SEGURANÇA",
          bullets: [
            "Dados locais: histórico de chat, progresso, favoritos e configurações",
            "Dados em servidor protegidos no Supabase com backups seguros",
          ],
        },
        {
          title: "6. ANÚNCIOS E MONETIZAÇÃO",
          bullets: [
            "Usuários gratuitos: banners, intersticiais e recompensados",
            "Usuários premium: experiência sem anúncios e acesso completo",
          ],
        },
        {
          title: "7. NOTIFICAÇÕES",
          bullets: [
            "Versículos e lembretes agendados",
            "Lembretes de oração e estudos",
            "Controle total de temas, horários e permissões",
          ],
        },
        {
          title: "8. SEUS DIREITOS",
          bullets: [
            "Visualizar, editar ou excluir seus dados",
            "Solicitar exclusão completa da conta",
            "Cancelar notificações a qualquer momento",
          ],
        },
        {
          title: "9. RETENÇÃO DE DADOS",
          bullets: [
            "Dados mantidos enquanto a conta estiver ativa",
            "Exclusão completa em até 30 dias após solicitação",
            "Logs técnicos por até 90 dias (sem identificação)",
          ],
        },
        {
          title: "10. TECNOLOGIAS UTILIZADAS",
          bullets: [
            "LocalStorage/AsyncStorage para preferências e progresso",
            "Cookies web apenas para funcionalidade básica",
            "Analytics anônimos para melhoria contínua",
          ],
        },
        {
          title: "11. TRANSFERÊNCIAS INTERNACIONAIS",
          bullets: ["Supabase, Stripe, OpenAI e AdMob podem processar dados fora do Brasil"],
        },
        {
          title: "12. MENORES DE IDADE",
          bullets: ["O app não é destinado a coletar intencionalmente dados de menores de 13 anos"],
        },
        {
          title: "13. ALTERAÇÕES NA POLÍTICA",
          bullets: [
            "Atualizações podem ser informadas no app e por e-mail",
            "Versões anteriores são mantidas para referência",
          ],
        },
        {
          title: "14. CONTATO",
          bullets: [
            "E-mail: [seu-email@dominio.com]",
            "Atendimento: segunda a sexta, das 9h às 18h",
          ],
        },
        {
          title: "15. CONCORDÂNCIA",
          paragraphs: [
            "Ao utilizar o Conexao com Deus, você concorda com os termos desta Política de Privacidade.",
          ],
        },
      ] as Section[],
    };
  }, [isEnglish]);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/configuracoes")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {copy.back}
        </Button>

        <div className="flex flex-col items-center my-6">
          <Shield className="w-10 h-10 text-primary mb-2" />
          <h1 className="text-2xl font-bold heavenly-text mb-2">{copy.title}</h1>
          <p className="text-muted-foreground text-sm">{copy.meta}</p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {copy.sections.map((section) => (
            <section key={section.title} className="mb-6">
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p key={`${section.title}-p-${index}`}>{paragraph}</p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul>
                  {section.bullets.map((bullet, index) => (
                    <li key={`${section.title}-b-${index}`}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
}
