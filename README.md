# Conexão com Deus - Aplicativo Cristão

Um aplicativo cristão moderno para fortalecer sua fé através de estudos bíblicos, orações e conversas espirituais.

## 🚀 Funcionalidades

- **📖 Leitura da Bíblia**: Navegue por todos os 66 livros bíblicos
- **💬 Conversa Espiritual**: IA para orientação espiritual e orações
- **❤️ Favoritos**: Salve versículos e mensagens importantes
- **👤 Perfil Personalizado**: Acompanhe seu progresso espiritual
- **📱 Experiência Mobile**: Otimizado para Android e iOS

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Mobile**: Capacitor
- **Backend**: Supabase
- **PWA**: Vite PWA Plugin

## 📱 Build para Android

### Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Android Studio** com Android SDK
3. **Java JDK** (versão 11 ou superior)
4. **Gradle** (gerenciado pelo Android Studio)

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd divino-conselho-di

# Instale as dependências
npm install

# Instale as dependências do Capacitor
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen @capacitor/storage @capacitor/device @capacitor/network

# Instale o plugin PWA
npm install vite-plugin-pwa --save-dev
```

### Build e Deploy

```bash
# Build do projeto
npm run build

# Sincronize com o Android
npx cap sync android

# Abra no Android Studio
npx cap open android

# Ou execute diretamente no dispositivo/emulador
npx cap run android
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Build e abrir Android Studio
npm run android:build

# Executar no Android
npm run android
```

## 🎨 Melhorias Mobile Implementadas

### 1. **Navegação Mobile**
- Bottom navigation para dispositivos móveis
- Navegação por gestos
- Feedback háptico
- Ícones intuitivos

### 2. **Experiência do Usuário**
- Design responsivo otimizado
- Touch targets adequados (44px mínimo)
- Scroll suave e natural
- Loading states melhorados

### 3. **Funcionalidades Nativas**
- Feedback háptico
- Gerenciamento de teclado
- Status bar personalizada
- Splash screen otimizada
- Detecção de conectividade

### 4. **Performance**
- Cache inteligente
- Lazy loading
- Otimização de imagens
- Service Worker para offline

### 5. **PWA (Progressive Web App)**
- Instalação na tela inicial
- Funcionamento offline
- Atualizações automáticas
- Experiência nativa

## 📋 Configurações Android

### Permissões
- `INTERNET`: Conexão com APIs
- `ACCESS_NETWORK_STATE`: Detecção de conectividade
- `VIBRATE`: Feedback háptico
- `WAKE_LOCK`: Manter tela ativa durante leitura

### Configurações de Segurança
- HTTPS obrigatório
- Configuração de segurança de rede
- Certificados SSL válidos

## 🔧 Configurações do Capacitor

### Splash Screen
- Duração: 2 segundos
- Cor de fundo: #3b82f6 (azul primário)
- Modo fullscreen
- Sem spinner

### Status Bar
- Estilo: dark
- Cor de fundo: #3b82f6
- Integração com tema do app

### Teclado
- Redimensionamento automático
- Estilo dark
- Modo fullscreen

## 📊 Monitoramento

### Métricas de Performance
- Tempo de carregamento inicial
- Tempo de resposta da API
- Uso de memória
- Taxa de erro

### Analytics
- Eventos de navegação
- Interações do usuário
- Tempo de sessão
- Funcionalidades mais usadas

## 🚀 Deploy

### Google Play Store
1. Build de release: `npm run build`
2. Sincronizar: `npx cap sync android`
3. Gerar APK/AAB no Android Studio
4. Upload para Google Play Console

### PWA
1. Build: `npm run build`
2. Deploy para servidor HTTPS
3. Configurar Service Worker
4. Testar instalação

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Comunidade cristã
- Contribuidores do projeto
- Bibliotecas open source utilizadas

---

**Conexão com Deus** - Fortalecendo vidas através da tecnologia e fé. 🙏✨
