# 🔗 Implementação de Deeplinks

## 📱 **Como Funciona o Sistema de Deeplinks**

### **1. Configuração Android**
O app já possui deeplinks configurados no `AndroidManifest.xml`:
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="conexaodeus" />
</intent-filter>
```

### **2. Listener de Deeplinks**
Adicionado no `App.tsx` para capturar URLs:
```typescript
CapacitorApp.addListener('appUrlOpen', (data) => {
  // Processa o URL recebido
  const url = new URL(data.url);
  const path = url.pathname;
  const params = new URLSearchParams(url.search);
  
  if (path === '/versiculo-do-dia') {
    const verse = params.get('verse');
    if (verse) {
      window.location.href = `/versiculo-do-dia?verse=${verse}`;
    }
  }
});
```

### **3. Criação de Deeplinks nas Notificações**
Quando uma notificação é criada, um deeplink é gerado:
```typescript
const encodedVerse = encodeURIComponent(JSON.stringify(verse));
const deepLinkUrl = `conexaodeus://versiculo-do-dia?verse=${encodedVerse}`;

// Adicionado à configuração da notificação
const notificationConfig = {
  // ... outras configurações
  url: deepLinkUrl  // URL para deeplink
};
```

## 🎯 **Fluxo Completo**

### **Antes (localStorage):**
1. Notificação clicada → Dados salvos no localStorage
2. App aberto → Verifica localStorage
3. Dados encontrados → Redireciona

### **Agora (Deeplinks):**
1. Notificação clicada → Sistema Android abre app com URL
2. App recebe URL → Listener processa
3. URL processado → Redireciona diretamente

## ✅ **Vantagens dos Deeplinks**

- **Mais rápido**: Processamento nativo do Android
- **Mais confiável**: Não depende de localStorage
- **Padrão nativo**: Usa APIs oficiais do Android
- **Melhor UX**: Transição mais suave
- **Fallback**: Mantém localStorage como backup

## 🔧 **URLs Suportadas**

- `conexaodeus://versiculo-do-dia?verse=dados` - Abre versículo específico
- `conexaodeus://notificacoes` - Abre página de notificações
- `conexaodeus://biblia` - Abre página da bíblia

## 🧪 **Como Testar**

1. **Agende uma notificação**
2. **Aguarde a notificação chegar**
3. **Clique na notificação**
4. **App deve abrir diretamente na página "Versículo do Dia"**

## 📊 **Logs de Debug**

O sistema gera logs detalhados:
- `[Deeplink] URL recebido: conexaodeus://versiculo-do-dia?verse=...`
- `[Deeplink] Path: /versiculo-do-dia`
- `[Deeplink] Redirecionando para versículo: ...`

## 🔄 **Fallback**

Se por algum motivo o deeplink não funcionar, o sistema ainda usa localStorage como fallback, garantindo que o redirecionamento sempre funcione. 