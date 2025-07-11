# 🎯 Guia Completo: Configuração de Notificações Precisas

## 📋 **Configurações Implementadas**

### **✅ Permissões Adicionadas no AndroidManifest.xml:**

```xml
<!-- Permissões essenciais para notificações precisas -->
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
```

### **✅ Receivers Adicionados:**

```xml
<!-- Receivers para notificações locais -->
<receiver android:name="de.appplant.cordova.plugin.localnotification.TriggerReceiver" />
<receiver android:name="de.appplant.cordova.plugin.localnotification.ClearReceiver" />
<receiver android:name="de.appplant.cordova.plugin.notification.TriggerReceiver" />
<receiver android:name="de.appplant.cordova.plugin.notification.ClearReceiver" />
<receiver android:name="de.appplant.cordova.plugin.notification.CancelReceiver" />
<receiver android:name="de.appplant.cordova.plugin.notification.UpdateReceiver" />
```

### **✅ Configurações de Notificação Otimizadas:**

```typescript
const notificationConfig = {
  // ... configurações básicas
  androidPriority: 1, // PRIORITY_HIGH
  androidImportance: 4, // IMPORTANCE_HIGH
  androidVisibility: 1, // VISIBILITY_PUBLIC
  androidChannelId: 'versiculos',
  androidChannelName: 'Versículos Bíblicos',
  androidChannelDescription: 'Notificações de versículos agendados',
  androidChannelImportance: 4, // IMPORTANCE_HIGH
  androidChannelShowBadge: true,
  androidChannelEnableVibration: true,
  androidChannelEnableLights: true,
  androidChannelLightColor: '#FF0000',
  androidChannelSound: null,
  androidChannelVibrationPattern: [0, 1000, 500, 1000],
};
```

## 🔧 **Configurações do Usuário (IMPORTANTE)**

### **📱 Passo 1: Permissões de Notificação**

1. **Abra o app** no dispositivo
2. **Vá para Configurações** do app
3. **Permita notificações** quando solicitado
4. **Verifique** se as notificações estão habilitadas

### **📱 Passo 2: Otimização de Bateria (CRÍTICO)**

#### **Para Android 6+ (API 23+):**

1. **Vá em Configurações** do dispositivo
2. **Bateria** → **Otimização de bateria**
3. **Procure por "Conexao com Deus"**
4. **Selecione "Não otimizar"**
5. **Confirme** a alteração

#### **Para Android 12+ (API 31+):**

1. **Configurações** → **Aplicativos**
2. **Conexao com Deus** → **Bateria**
3. **Desative** "Otimização de bateria"
4. **Ative** "Executar em segundo plano"

### **📱 Passo 3: Configurações de Notificação**

#### **Para Android 8+ (API 26+):**

1. **Configurações** → **Aplicativos**
2. **Conexao com Deus** → **Notificações**
3. **Ative** "Mostrar notificações"
4. **Ative** "Som"
5. **Ative** "Vibração"
6. **Ative** "Luz de notificação"

#### **Para Android 13+ (API 33+):**

1. **Configurações** → **Notificações**
2. **Permissões de notificação**
3. **Conexao com Deus** → **Permitir**

### **📱 Passo 4: Configurações de Alarme**

#### **Para Android 12+ (API 31+):**

1. **Configurações** → **Aplicativos**
2. **Conexao com Deus** → **Permissões**
3. **Alarmes e lembretes** → **Permitir**

## 🎯 **Por que essas configurações são importantes?**

### **🔋 Otimização de Bateria:**
- **Android 6+**: Sistema Doze Mode pode matar apps em background
- **Solução**: Desativar otimização para o app
- **Resultado**: Notificações aparecem no horário exato

### **⏰ Alarmes Precisos:**
- **Android 12+**: Novas restrições para alarmes exatos
- **Solução**: Permissão `USE_EXACT_ALARM`
- **Resultado**: Notificações não são atrasadas

### **🔔 Canal de Notificação:**
- **Android 8+**: Sistema de canais obrigatório
- **Solução**: Canal com `IMPORTANCE_HIGH`
- **Resultado**: Notificações aparecem mesmo com app fechado

### **📱 Foreground Service:**
- **Android 8+**: Restrições para apps em background
- **Solução**: Permissão `FOREGROUND_SERVICE`
- **Resultado**: App pode executar em background

## 🧪 **Como Testar**

### **Teste 1: Notificação Imediata**
1. **Abra o app**
2. **Vá para Notificações**
3. **Clique em "Teste"**
4. **Verifique** se aparece em 1 minuto

### **Teste 2: Notificação Agendada**
1. **Crie um agendamento** para 2 minutos no futuro
2. **Feche o app** completamente
3. **Aguarde** o horário
4. **Verifique** se a notificação aparece

### **Teste 3: Notificação com App Fechado**
1. **Crie um agendamento** para amanhã
2. **Feche o app** e **force stop**
3. **Aguarde** até o horário
4. **Verifique** se a notificação aparece

## 🚨 **Problemas Comuns e Soluções**

### **❌ Notificação não aparece:**
- **Verifique** permissões de notificação
- **Desative** otimização de bateria
- **Verifique** se o app não está sendo morto pelo sistema

### **❌ Notificação atrasada:**
- **Verifique** configurações de alarme
- **Desative** modo economia de bateria
- **Verifique** se o dispositivo não está em modo Doze

### **❌ Notificação não repete:**
- **Verifique** se `repeats: true` está configurado
- **Verifique** se o trigger está correto
- **Verifique** logs do console para erros

## 📊 **Logs de Debug**

### **Verificar Status:**
```javascript
// No console do navegador
checkNotificationPersistence()
```

### **Logs Esperados:**
```
[Notifications] Notificação 861000 agendada com sucesso via Cordova
[Notifications] Notificação recebida: {id: 861000, ...}
[Notifications] Notificação clicada: {id: 861000, ...}
```

## 🎉 **Resultado Esperado**

Com todas essas configurações implementadas:

- ✅ **Notificações aparecem no horário exato**
- ✅ **Funcionam mesmo com app fechado**
- ✅ **Repetem automaticamente** na próxima semana
- ✅ **Aparecem na barra de status** do Android
- ✅ **Têm som e vibração** configurados
- ✅ **Não são afetadas** por otimização de bateria

## 📞 **Suporte**

Se as notificações ainda não funcionarem:

1. **Verifique** todas as configurações acima
2. **Teste** em dispositivo diferente
3. **Verifique** logs do console
4. **Reinicie** o dispositivo
5. **Reinstale** o app se necessário

---

**💡 Dica**: As configurações de otimização de bateria são **CRÍTICAS** para o funcionamento correto das notificações em Android moderno. 