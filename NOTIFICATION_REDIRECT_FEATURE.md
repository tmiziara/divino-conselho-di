# Funcionalidade de Redirecionamento de Notificações

## Visão Geral

Esta funcionalidade permite que quando o usuário clica em uma notificação agendada, ele seja redirecionado para a página de "Versículo do Dia" com a imagem específica do versículo que apareceu na notificação.

## Como Funciona

### 1. Criação da Notificação

Quando uma notificação é agendada, os dados do versículo são incluídos na configuração da notificação:

```typescript
const notificationConfig = {
  id: notificationId,
  title: "Versículo do Dia",
  text: `${verse.referencia}: ${verse.texto}`,
  // ... outras configurações
  data: {
    scheduleId: schedule.id,
    theme: schedule.theme,
    day: day,
    verseData: {
      tema: verse.tema,
      referencia: verse.referencia,
      texto: verse.texto
    }
  }
};
```

### 2. Listener de Notificação Clicada

Quando o usuário clica na notificação, o listener captura o evento e redireciona para a página de versículo do dia:

```typescript
window.cordova!.plugins.notification.local.on('click', (notification) => {
  if (notification.data && notification.data.verseData) {
    const verseData = notification.data.verseData;
    const encodedVerse = encodeURIComponent(JSON.stringify(verseData));
    const redirectUrl = `/versiculo-do-dia?verse=${encodedVerse}`;
    window.location.href = redirectUrl;
  }
});
```

### 3. Processamento na Página de Versículo do Dia

A página `VersiculoDoDia.tsx` foi modificada para:

1. **Detectar parâmetros da URL**: Verifica se há um parâmetro `verse` na URL
2. **Processar dados do versículo**: Decodifica e processa os dados do versículo
3. **Exibir versículo específico**: Coloca o versículo da notificação no início da lista
4. **Indicador visual**: Mostra um badge indicando que o versículo veio de uma notificação
5. **Limpar URL**: Remove o parâmetro da URL após processar

```typescript
const verseParam = searchParams.get('verse');
if (verseParam) {
  const specificVerse = JSON.parse(decodeURIComponent(verseParam));
  const updatedVerses = [specificVerse, ...data];
  setVerses(updatedVerses);
  setCurrentIndex(0);
}
```

## Benefícios

### Para o Usuário
- ✅ **Experiência contínua**: Ao clicar na notificação, vê exatamente o versículo que recebeu
- ✅ **Imagem personalizada**: A imagem do versículo é gerada automaticamente
- ✅ **Navegação intuitiva**: Redirecionamento direto para a página correta
- ✅ **Indicador visual**: Badge mostra que o versículo veio de uma notificação

### Para o Desenvolvedor
- ✅ **Código limpo**: Implementação modular e bem estruturada
- ✅ **Fallback robusto**: Funciona mesmo se os dados estiverem corrompidos
- ✅ **Logs detalhados**: Facilita debugging e monitoramento
- ✅ **Compatibilidade**: Funciona tanto com app aberto quanto fechado

## Fluxo Completo

1. **Usuário agenda notificação** → Sistema salva dados do versículo
2. **Notificação aparece** → Usuário vê versículo na notificação
3. **Usuário clica** → App abre e redireciona para `/versiculo-do-dia?verse=...`
4. **Página carrega** → Processa dados do versículo da URL
5. **Versículo exibido** → Mostra versículo específico com imagem
6. **URL limpa** → Remove parâmetros para navegação limpa

## Tratamento de Erros

- **Dados corrompidos**: Fallback para versículo aleatório
- **App fechado**: `window.location.href` garante navegação
- **Parâmetros inválidos**: Comportamento padrão mantido
- **Falha na decodificação**: Logs detalhados para debugging

## Logs de Debug

```
[Notifications] Notificação clicada: { data: { verseData: {...} } }
[Notifications] Redirecionando para versículo do dia: /versiculo-do-dia?verse=...
[VersiculoDoDia] Versículo específico recebido: { tema: "amor", referencia: "João 3:16", texto: "..." }
```

## Configuração

A funcionalidade é **ativada automaticamente** quando:
- O app está rodando em ambiente móvel (Cordova)
- O sistema de notificações está inicializado
- O usuário tem permissões de notificação

**Nenhuma configuração adicional é necessária** - a funcionalidade funciona automaticamente com o sistema de notificações existente. 