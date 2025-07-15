# 📱 Implementação de Ads no Projeto

## 🎯 Estratégia de Monetização

### **Ads Implementados:**

1. **Banner Ads** - Em todas as páginas (já existia)
2. **Ads Recompensados** - Para ganhar créditos no chat (já existia)
3. **Ads Intersticiais** - Novos ads implementados:
   - A cada 5 versículos navegados
   - Após completar 1 estudo completo

## 🔧 Implementação Técnica

### **Hook Personalizado: `useAdManager`**

Criado em `src/hooks/useAdManager.ts` para centralizar toda a lógica de ads:

```typescript
const { incrementVerseCount, incrementStudyCount, showRewardedAd } = useAdManager({
  versesPerAd: 5,    // Ad a cada 5 versículos
  studiesPerAd: 1    // Ad a cada 1 estudo
});
```

### **Funcionalidades:**

- ✅ **Contador de versículos** - Incrementa a cada swipe entre versículos
- ✅ **Contador de estudos** - Incrementa quando capítulo é completado
- ✅ **Persistência localStorage** - Contadores mantidos entre navegações
- ✅ **Ads intersticiais** - Aparecem automaticamente quando contador atinge limite
- ✅ **Ads recompensados** - Para ganhar créditos no chat
- ✅ **Respeito a usuários premium** - Ads não aparecem para assinantes premium
- ✅ **IDs de teste** - Usando IDs de teste do AdMob para desenvolvimento

## 📍 Integração nas Páginas

### **1. Versículo do Dia (`src/pages/VersiculoDoDia.tsx`)**

```typescript
const { incrementVerseCount } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });

const navigateVerse = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
    setCurrentBackground(getRandomBackground());
    incrementVerseCount(); // ← Adicionado aqui
  } else if (direction === 'next' && currentIndex < verses.length - 1) {
    setCurrentIndex(currentIndex + 1);
    setCurrentBackground(getRandomBackground());
    incrementVerseCount(); // ← Adicionado aqui
  }
};
```

### **2. Capítulos de Estudo (`src/pages/StudyChapter.tsx`)**

```typescript
const { incrementStudyCount } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });

const handleMarkAsCompleted = async () => {
  await markChapterAsCompleted(chapter.id, study.id);
  incrementStudyCount(); // ← Adicionado aqui
  // ... resto da lógica
};
```

### **3. Chat (`src/pages/Chat.tsx`)**

```typescript
const { showRewardedAd } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });

const handleWatchAd = async () => {
  await showRewardedAd(async () => {
    // Callback executado quando usuário recebe recompensa
    // Atualiza créditos no banco de dados
  });
};
```

## 🧪 Página de Teste

Criada página de teste em `/ad-test` para verificar funcionamento:

- ✅ Simular navegação de versículos
- ✅ Simular estudo completado  
- ✅ Testar ad recompensado
- ✅ Visualizar contadores em tempo real
- ✅ Verificar status premium/gratuito

## 🔒 Controle de Acesso

### **Usuários Premium:**
- ❌ Não veem ads intersticiais
- ❌ Não veem ads recompensados
- ✅ Ainda podem usar ads recompensados voluntariamente

### **Usuários Gratuitos:**
- ✅ Veem banner em todas as páginas
- ✅ Veem ads intersticiais a cada 5 versículos
- ✅ Veem ads intersticiais após completar estudo
- ✅ Podem assistir ads recompensados para créditos

## 📊 IDs de Ads (Teste)

### **Android:**
- Intersticial: `ca-app-pub-3940256099942544/1033173712`
- Recompensado: `ca-app-pub-3940256099942544/5224354917`
- Banner: `ca-app-pub-3940256099942544/6300978111`

### **iOS:**
- Intersticial: `ca-app-pub-3940256099942544/4411468910`
- Recompensado: `ca-app-pub-3940256099942544/1712485313`
- Banner: `ca-app-pub-3940256099942544/6300978111`

## 🚀 Próximos Passos

1. **Testar em dispositivo real** - Verificar se ads aparecem corretamente
2. **Ajustar frequência** - Baseado no feedback dos usuários
3. **Implementar IDs de produção** - Quando app for para produção
4. **Analytics** - Adicionar tracking de performance dos ads
5. **A/B Testing** - Testar diferentes frequências de ads

## 🐛 Troubleshooting

### **Ads não aparecem:**
- Verificar se usuário é premium
- Verificar logs do console
- Verificar se AdMob está inicializado
- Verificar conectividade
- Verificar se contadores estão sendo persistidos no localStorage

### **Ads aparecem demais:**
- Ajustar configuração `versesPerAd` e `studiesPerAd`
- Verificar se contadores estão sendo resetados corretamente

### **Contadores resetam entre navegações:**
- ✅ **CORRIGIDO** - Implementada persistência com localStorage
- Contadores agora são mantidos entre páginas
- Verificar logs do console para debug

### **Erro de inicialização:**
- Verificar se `@capacitor-community/admob` está instalado
- Verificar se AndroidManifest.xml tem App ID correto
- Verificar se Info.plist tem configuração correta (iOS) 