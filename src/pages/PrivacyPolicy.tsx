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
      back: "Voltar ?s Configura??es",
      title: "Pol?tica de Privacidade",
      meta: "?ltima atualiza??o: 15 de julho de 2025 | Vers?o: 1.3",
      sections: [
        {
          title: "1. INFORMA??ES GERAIS",
          paragraphs: [
            "Esta Pol?tica de Privacidade descreve como o aplicativo Conexao com Deus coleta, utiliza, armazena e protege seus dados. O app est? dispon?vel nas vers?es m?vel (Android/iOS) e web.",
          ],
        },
        {
          title: "2. DADOS QUE COLETAMOS",
          paragraphs: ["2.1 Informa??es pessoais"],
          bullets: [
            "Nome completo",
            "E-mail (obrigat?rio para login e comunica??o)",
            "G?nero (opcional)",
            "Senha (armazenada com prote??o criptogr?fica/hash)",
          ],
        },
        {
          title: "2.2 Dados de uso",
          bullets: [
            "Progresso de leitura b?blica (livro, cap?tulo, vers?culo)",
            "Favoritos e destaques de vers?culos",
            "Hist?rico de estudos e devocionais",
            "Prefer?ncias de notifica??es (temas e hor?rios)",
            "Intera??es com o chat espiritual com IA",
          ],
        },
        {
          title: "2.3 Dados t?cnicos",
          bullets: [
            "Informa??es do dispositivo (modelo, SO, vers?o)",
            "Status de rede (online/offline)",
            "Status da conta (gratuito ou premium)",
            "Logs an?nimos para melhoria do app",
          ],
        },
        {
          title: "3. COMO USAMOS SEUS DADOS",
          bullets: [
            "Login e autentica??o via Supabase",
            "Sincroniza??o de progresso e favoritos entre dispositivos",
            "Personaliza??o de conte?do e notifica??es",
            "Gera??o de respostas espirituais com IA (OpenAI)",
          ],
        },
        {
          title: "4. COMPARTILHAMENTO DE DADOS",
          bullets: [
            "Supabase: autentica??o e banco de dados",
            "Stripe: pagamentos e assinaturas",
            "Google AdMob: an?ncios para usu?rios gratuitos",
            "OpenAI: processamento das mensagens do chat",
          ],
        },
        {
          title: "5. ARMAZENAMENTO E SEGURAN?A",
          bullets: [
            "Dados locais: hist?rico de chat, progresso, favoritos e configura??es",
            "Dados em servidor protegidos no Supabase com backups seguros",
          ],
        },
        {
          title: "6. AN?NCIOS E MONETIZA??O",
          bullets: [
            "Usu?rios gratuitos: banners, intersticiais e recompensados",
            "Usu?rios premium: experi?ncia sem an?ncios e acesso completo",
          ],
        },
        {
          title: "7. NOTIFICA??ES",
          bullets: [
            "Vers?culos e lembretes agendados",
            "Lembretes de ora??o e estudos",
            "Controle total de temas, hor?rios e permiss?es",
          ],
        },
        {
          title: "8. SEUS DIREITOS",
          bullets: [
            "Visualizar, editar ou excluir seus dados",
            "Solicitar exclus?o completa da conta",
            "Cancelar notifica??es a qualquer momento",
          ],
        },
        {
          title: "9. RETEN??O DE DADOS",
          bullets: [
            "Dados mantidos enquanto a conta estiver ativa",
            "Exclus?o completa em at? 30 dias ap?s solicita??o",
            "Logs t?cnicos por at? 90 dias (sem identifica??o)",
          ],
        },
        {
          title: "10. TECNOLOGIAS UTILIZADAS",
          bullets: [
            "LocalStorage/AsyncStorage para prefer?ncias e progresso",
            "Cookies web apenas para funcionalidade b?sica",
            "Analytics an?nimos para melhoria cont?nua",
          ],
        },
        {
          title: "11. TRANSFER?NCIAS INTERNACIONAIS",
          bullets: ["Supabase, Stripe, OpenAI e AdMob podem processar dados fora do Brasil"],
        },
        {
          title: "12. MENORES DE IDADE",
          bullets: ["O app n?o ? destinado a coletar intencionalmente dados de menores de 13 anos"],
        },
        {
          title: "13. ALTERA??ES NA POL?TICA",
          bullets: [
            "Atualiza??es podem ser informadas no app e por e-mail",
            "Vers?es anteriores s?o mantidas para refer?ncia",
          ],
        },
        {
          title: "14. CONTATO",
          bullets: [
            "E-mail: [seu-email@dominio.com]",
            "Atendimento: segunda a sexta, das 9h ?s 18h",
          ],
        },
        {
          title: "15. CONCORD?NCIA",
          paragraphs: [
            "Ao utilizar o Conexao com Deus, voc? concorda com os termos desta Pol?tica de Privacidade.",
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
