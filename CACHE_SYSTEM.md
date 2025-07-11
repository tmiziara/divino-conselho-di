# Sistema de Cache Local - Documentação

## Visão Geral

Este sistema implementa uma estratégia de cache local para melhorar a performance da aplicação, reduzir flickering de conteúdo premium e fornecer suporte offline. O sistema carrega dados locais primeiro (rápido) e sincroniza com o Supabase em background (lento).

## Componentes Principais

### 1. useLocalData Hook
**Arquivo:** `src/hooks/useLocalData.ts`

Gerencia dados locais do usuário incluindo:
- Tier de assinatura (free, basic, premium)
- Status da assinatura (active, inactive, cancelled)
- Data de expiração
- Timestamp da última sincronização

**Funcionalidades:**
- Carregamento/salvamento de dados locais
- Sincronização com Supabase
- Comparação de dados para evitar atualizações desnecessárias
- Sincronização periódica (a cada 5 minutos)
- Limpeza automática no logout

### 2. useSubscription Hook Otimizado
**Arquivo:** `src/hooks/useSubscription.ts`

Hook modificado para usar dados locais:
- Carrega dados locais primeiro (instantâneo)
- Sincroniza com Supabase em background
- Listener para atualizações de dados locais
- Conversão automática entre formatos

### 3. LoadingProvider
**Arquivo:** `src/components/LoadingProvider.tsx`

Gerencia estado de carregamento:
- Evita flickering de conteúdo premium
- Mostra tela de carregamento quando necessário
- Determina quando os dados estão prontos
- Delay de 500ms para transições suaves

### 4. useContentAccess Hook
**Arquivo:** `src/hooks/useContentAccess.ts`

Hook otimizado para verificar acesso:
- Usa dados locais durante carregamento
- Verificações rápidas de acesso premium
- Status de sincronização
- Fallback para dados padrão

## Fluxo de Funcionamento

### 1. Inicialização
```
App inicia → LoadingProvider verifica dados → 
Se dados locais existem → Carrega instantaneamente →
Sincroniza em background → Atualiza se necessário
```

### 2. Login do Usuário
```
Usuário faz login → Dispara evento 'userLoggedIn' →
useLocalData força sincronização inicial →
Dados salvos localmente → App atualiza
```

### 3. Sincronização Periódica
```
A cada 5 minutos → Compara dados locais com Supabase →
Se diferentes → Atualiza dados locais →
Dispara evento 'userDataUpdated' → App atualiza
```

### 4. Logout
```
Usuário faz logout → Dispara evento 'userLoggedOut' →
useLocalData limpa dados locais → App reseta
```

## Benefícios

### Performance
- **Carregamento instantâneo:** Dados locais carregam imediatamente
- **Sincronização em background:** Não bloqueia a interface
- **Cache inteligente:** Só atualiza quando necessário

### Experiência do Usuário
- **Sem flickering:** Conteúdo premium não pisca
- **Suporte offline:** Funciona sem internet
- **Transições suaves:** Loading states otimizados

### Confiabilidade
- **Fallback robusto:** Funciona mesmo com erros de rede
- **Dados consistentes:** Sincronização automática
- **Limpeza automática:** Dados limpos no logout

## Estrutura de Dados

### LocalUserData Interface
```typescript
interface LocalUserData {
  subscription_tier: 'free' | 'premium' | 'basic';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_expires_at: string | null;
  last_sync: string;
  user_id: string;
}
```

### SyncStatus Interface
```typescript
interface SyncStatus {
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}
```

## Eventos do Sistema

### userLoggedIn
Disparado quando usuário faz login
```typescript
window.dispatchEvent(new CustomEvent('userLoggedIn', {
  detail: { userId: string }
}));
```

### userLoggedOut
Disparado quando usuário faz logout
```typescript
window.dispatchEvent(new CustomEvent('userLoggedOut'));
```

### userDataUpdated
Disparado quando dados locais são atualizados
```typescript
window.dispatchEvent(new CustomEvent('userDataUpdated', {
  detail: LocalUserData
}));
```

## Configurações

### Intervalo de Sincronização
```typescript
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
```

### Chave de Armazenamento
```typescript
const LOCAL_DATA_KEY = 'local_user_data';
```

### Delay de Transição
```typescript
setTimeout(() => {
  setShowLoadingScreen(false);
}, 500); // 500ms
```

## Debug e Monitoramento

### DebugInfo Component
Componente de debug disponível apenas em desenvolvimento:
- Status de sincronização
- Dados locais atuais
- Acesso premium
- Ações de debug (sincronizar, limpar)

### Logs do Sistema
Todos os componentes incluem logs detalhados:
- `[LocalData]` - Logs do useLocalData
- `[useSubscription]` - Logs do useSubscription
- `[LoadingProvider]` - Logs do LoadingProvider
- `[useAuth]` - Logs de autenticação

## Considerações de Segurança

1. **Dados sensíveis:** Apenas dados de assinatura são armazenados localmente
2. **Limpeza automática:** Dados são limpos no logout
3. **Validação:** Dados são validados antes do uso
4. **Fallback:** Sistema funciona mesmo com dados corrompidos

## Troubleshooting

### Problema: Dados não sincronizam
**Solução:** Verificar logs do `[LocalData]` e usar DebugInfo para forçar sincronização

### Problema: Flickering ainda ocorre
**Solução:** Verificar se LoadingProvider está configurado corretamente

### Problema: Dados desatualizados
**Solução:** Usar DebugInfo para limpar cache e forçar nova sincronização

## Próximos Passos

1. **Métricas:** Implementar métricas de performance
2. **Otimização:** Ajustar intervalos baseado no uso
3. **Compressão:** Comprimir dados locais para economizar espaço
4. **Versioning:** Sistema de versionamento para dados locais 