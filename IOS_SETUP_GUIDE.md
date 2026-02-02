# 🍎 Guia de Configuração iOS

## ✅ **Status Atual**

Seu projeto está **quase 100% configurado** para iOS. Apenas algumas configurações finais precisam ser feitas quando você tiver acesso a um Mac.

## 🛠️ **O que JÁ está configurado:**

### **✅ Estrutura iOS**
- ✅ Projeto Xcode criado (`ios/App/App.xcodeproj`)
- ✅ Workspace configurado (`ios/App/App.xcworkspace`)
- ✅ Podfile com todos os plugins
- ✅ Info.plist configurado
- ✅ AppDelegate.swift básico

### **✅ Plugins iOS**
- ✅ @capacitor/ios
- ✅ @capacitor-community/admob
- ✅ @capacitor/local-notifications
- ✅ @capacitor/device
- ✅ @capacitor/filesystem
- ✅ @capacitor/haptics
- ✅ @capacitor/keyboard
- ✅ @capacitor/network
- ✅ @capacitor/share
- ✅ @capacitor/splash-screen
- ✅ @capacitor/status-bar

### **✅ Configurações**
- ✅ Capacitor configurado
- ✅ Tailwind CSS funcionando
- ✅ TypeScript configurado
- ✅ Build system pronto

## 🔧 **O que PRECISA ser feito no Mac:**

### **1. Instalar Ferramentas**
```bash
# Instalar Xcode (via App Store)
# Instalar CocoaPods
sudo gem install cocoapods

# Instalar Node.js (se necessário)
brew install node
```

### **2. Sincronizar Projeto**
```bash
# No diretório do projeto
npm run build
npx cap sync ios
```

### **3. Configurar AdMob iOS**
Você precisa adicionar o arquivo `GoogleService-Info.plist` no projeto iOS:

1. **Baixar do Google AdMob Console:**
   - Acesse [console.admob.google.com](https://console.admob.google.com)
   - Crie um app iOS
   - Baixe o `GoogleService-Info.plist`

2. **Adicionar ao projeto:**
   - Abra o projeto no Xcode: `npx cap open ios`
   - Arraste o `GoogleService-Info.plist` para o projeto
   - Certifique-se de que está incluído no target "App"

### **4. Configurar App ID iOS**
No `capacitor.config.ts`, adicione:

```typescript
const config: CapacitorConfig = {
  appId: 'com.mizflow.conexaodeus',
  appName: 'Conexao com Deus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // ... configurações existentes
  },
  android: {
    backgroundColor: '#3b82f6'
  },
  ios: {
    backgroundColor: '#3b82f6'
  }
};
```

### **5. Configurar Permissões iOS**
No `ios/App/App/Info.plist`, adicione se necessário:

```xml
<!-- Para notificações -->
<key>NSUserNotificationUsageDescription</key>
<string>Este app precisa enviar notificações para lembrar você de ler versículos diários.</string>

<!-- Para câmera (se usar) -->
<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para compartilhar imagens.</string>

<!-- Para microfone (se usar) -->
<key>NSMicrophoneUsageDescription</key>
<string>Este app precisa acessar o microfone para funcionalidades de áudio.</string>
```

### **6. Configurar Certificados**
1. **Apple Developer Account** (necessário para distribuição)
2. **Certificados de Desenvolvimento**
3. **Provisioning Profiles**
4. **App ID registrado**

## 🚀 **Comandos para Testar**

### **Desenvolvimento:**
```bash
# Build e sincronizar
npm run build
npx cap sync ios

# Abrir no Xcode
npx cap open ios

# Executar no simulador
npx cap run ios
```

### **Produção:**
```bash
# Build de produção
npm run build

# Sincronizar
npx cap sync ios

# Abrir no Xcode para distribuição
npx cap open ios
```

## 📱 **Testes Necessários**

### **Funcionalidades para Testar:**
- ✅ **Navegação** entre telas
- ✅ **Ads** (intersticiais e recompensados)
- ✅ **Notificações** locais
- ✅ **Compartilhamento** de versículos
- ✅ **Tema escuro/claro**
- ✅ **Orientação** (portrait/landscape)
- ✅ **Feedback háptico**
- ✅ **Teclado** e input
- ✅ **Splash screen**
- ✅ **Status bar**

### **Testes Específicos iOS:**
- ✅ **Safe Area** (notch, home indicator)
- ✅ **Gestos** nativos iOS
- ✅ **Animações** suaves
- ✅ **Performance** no iOS
- ✅ **Compatibilidade** com diferentes iPhones

## 🐛 **Possíveis Problemas**

### **1. CocoaPods Issues:**
```bash
cd ios/App
pod install
pod update
```

### **2. Build Errors:**
```bash
# Limpar cache
npx cap clean ios
npx cap sync ios
```

### **3. AdMob Issues:**
- Verificar se `GoogleService-Info.plist` está no projeto
- Verificar se App ID está correto
- Verificar se ads estão habilitados no console

### **4. Permissões:**
- Verificar se todas as permissões estão no `Info.plist`
- Testar funcionalidades que requerem permissões

## 📊 **IDs de Ads iOS**

### **Teste (já configurados):**
- Intersticial: `ca-app-pub-3940256099942544/4411468910`
- Recompensado: `ca-app-pub-3940256099942544/1712485313`
- Banner: `ca-app-pub-3940256099942544/6300978111`

### **Produção (quando pronto):**
- Substituir pelos IDs reais do seu app no AdMob Console

## ✅ **Resumo**

Seu projeto está **muito bem configurado** para iOS! Só precisa:

1. **Mac com Xcode**
2. **GoogleService-Info.plist** (AdMob)
3. **Certificados Apple** (para distribuição)
4. **Testes finais** no dispositivo

**Tempo estimado:** 2-4 horas para configurar tudo no Mac.

O projeto está **pronto para iOS**! 🍎 