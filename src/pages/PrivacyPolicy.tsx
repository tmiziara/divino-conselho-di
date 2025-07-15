import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from '@/components/AuthDialog';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const handleAuthClick = () => setShowAuth(true);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/configuracoes')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar às Configurações
        </Button>
        <div className="flex flex-col items-center my-6">
          <Shield className="w-10 h-10 text-primary mb-2" />
          <h1 className="text-2xl font-bold heavenly-text mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground text-sm">
            Última atualização: 15 de julho de 2025 | Versão: 1.1
          </p>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h2>1. INFORMAÇÕES GERAIS</h2>
          <p>Esta Política de Privacidade descreve como o aplicativo Conexão com Deus coleta, utiliza, armazena e protege seus dados. O app está disponível nas versões móvel (Android/iOS) e web, sendo regido pela LGPD (Lei Geral de Proteção de Dados – Lei 13.709/2018) e demais legislações aplicáveis.</p>
          
          <h2>2. DADOS QUE COLETAMOS</h2>
          <h3>2.1 Informações Pessoais</h3>
          <ul>
            <li>Nome completo (informado no cadastro)</li>
            <li>E-mail (obrigatório para login e comunicação)</li>
            <li>Gênero (opcional)</li>
            <li>Senha (armazenada de forma criptografada)</li>
          </ul>
          
          <h3>2.2 Dados de Uso</h3>
          <ul>
            <li>Progresso de leitura bíblica (livro, capítulo, versículo)</li>
            <li>Favoritos e destaques de versículos</li>
            <li>Histórico de estudos e devocionais</li>
            <li>Preferências de notificações (temas, horários)</li>
            <li>Interações com o chat espiritual com IA</li>
          </ul>
          <p><strong>Atenção:</strong> as mensagens enviadas e recebidas no chat não são armazenadas em servidores. Elas permanecem apenas localmente no seu dispositivo.</p>
          
          <h3>2.3 Dados Técnicos</h3>
          <ul>
            <li>Informações do dispositivo (modelo, SO, versão)</li>
            <li>Status de rede (online/offline)</li>
            <li>Status da conta (gratuito ou premium)</li>
            <li>Logs de uso anônimos para melhoria do app</li>
          </ul>
          
          <h2>3. COMO USAMOS SEUS DADOS</h2>
          <h3>3.1 Funcionalidades do App</h3>
          <ul>
            <li>Login e autenticação via Supabase</li>
            <li>Sincronização de progresso e favoritos entre dispositivos</li>
            <li>Personalização de conteúdos e notificações</li>
            <li>Geração de respostas espirituais com IA (OpenAI)</li>
          </ul>
          
          <h3>3.2 Melhorias e Diagnósticos</h3>
          <ul>
            <li>Correção de erros técnicos</li>
            <li>Aperfeiçoamento de funcionalidades</li>
            <li>Desenvolvimento de novos recursos</li>
          </ul>
          
          <h2>4. COMPARTILHAMENTO DE DADOS</h2>
          <h3>4.1 Com Terceiros de Confiança</h3>
          <ul>
            <li>Supabase: autenticação e banco de dados</li>
            <li>Stripe: pagamentos e assinaturas</li>
            <li>Google AdMob: anúncios para usuários gratuitos</li>
            <li>OpenAI: processamento das mensagens do chat espiritual (sem vínculo de identidade pessoal)</li>
          </ul>
          
          <h3>4.2 O Que Não Compartilhamos</h3>
          <ul>
            <li>Seus dados com anunciantes</li>
            <li>Seu histórico do chat com terceiros (exceto envio anônimo para OpenAI, sem identificação)</li>
            <li>Informações bancárias ou de cartão (só tratadas pelo Stripe)</li>
          </ul>
          
          <h2>5. ARMAZENAMENTO E SEGURANÇA</h2>
          <h3>5.1 Local (no seu dispositivo)</h3>
          <ul>
            <li>Históricos do chat com IA</li>
            <li>Progresso de leitura e favoritos</li>
            <li>Configurações personalizadas</li>
            <li>Cache para acesso offline</li>
          </ul>
          
          <h3>5.2 Servidores</h3>
          <ul>
            <li>Dados pessoais armazenados com segurança no Supabase</li>
            <li>Senhas com hashing seguro</li>
            <li>Backups criptografados</li>
          </ul>
          
          <h2>6. ANÚNCIOS E MONETIZAÇÃO</h2>
          <h3>6.1 Usuários Gratuitos</h3>
          <ul>
            <li>Banners publicitários</li>
            <li>Anúncios intersticiais a cada 5 versículos</li>
            <li>Anúncios recompensados para ganhar créditos no chat</li>
            <li>Anúncios ao concluir estudos</li>
          </ul>
          
          <h3>6.2 Usuários Premium</h3>
          <ul>
            <li>Navegação 100% livre de anúncios</li>
            <li>Acesso completo ao conteúdo e funcionalidades</li>
          </ul>
          
          <h2>7. NOTIFICAÇÕES</h2>
          <ul>
            <li>Envio de versículos agendados por você</li>
            <li>Lembretes de oração e novos estudos</li>
            <li>Total controle do usuário sobre temas, horários e permissões</li>
          </ul>
          
          <h2>8. SEUS DIREITOS</h2>
          <ul>
            <li>Visualizar, editar ou excluir seus dados</li>
            <li>Baixar seus dados em formato JSON</li>
            <li>Solicitar exclusão completa da conta e dados vinculados</li>
            <li>Cancelar notificações a qualquer momento</li>
          </ul>
          
          <h2>9. RETENÇÃO DE DADOS</h2>
          <ul>
            <li>Dados mantidos enquanto a conta estiver ativa</li>
            <li>Remoção completa em até 30 dias após solicitação de exclusão</li>
            <li>Logs técnicos retidos por até 90 dias (sem identificação)</li>
            <li>Dados financeiros mantidos conforme exigência fiscal</li>
          </ul>
          
          <h2>10. TECNOLOGIAS UTILIZADAS</h2>
          <ul>
            <li>LocalStorage e AsyncStorage: preferências e progresso</li>
            <li>Cookies (versão web): apenas para funcionalidade básica</li>
            <li>Analytics anônimos: uso estatístico e melhoria contínua</li>
          </ul>
          
          <h2>11. TRANSFERÊNCIAS INTERNACIONAIS</h2>
          <ul>
            <li>Supabase, Stripe, OpenAI e AdMob usam servidores fora do Brasil (EUA)</li>
            <li>Garantimos conformidade com a LGPD por meio de contratos com cláusulas de proteção de dados</li>
          </ul>
          
          <h2>12. MENORES DE IDADE</h2>
          <ul>
            <li>O app não coleta intencionalmente dados de menores de 13 anos</li>
            <li>Recomendamos supervisão dos pais/responsáveis</li>
            <li>Caso identificado, os dados serão removidos imediatamente</li>
          </ul>
          
          <h2>13. ALTERAÇÕES NA POLÍTICA</h2>
          <ul>
            <li>Atualizações serão notificadas dentro do app e por e-mail</li>
            <li>Manteremos registro de versões anteriores</li>
            <li>Você pode aceitar ou recusar a nova versão da política</li>
          </ul>
          
          <h2>14. CONTATO</h2>
          <ul>
            <li>E-mail: [seu-email@dominio.com]</li>
            <li>Formulário: [link do formulário, se houver]</li>
            <li>Atendimento: Segunda a sexta, das 9h às 18h</li>
            <li>ANPD: www.gov.br/anpd</li>
          </ul>
          
          <h2>15. CONCORDÂNCIA</h2>
          <p>Ao utilizar o app Conexão com Deus, você declara estar de acordo com os termos desta Política de Privacidade. Caso não concorde, recomendamos não utilizar o serviço.</p>
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
} 