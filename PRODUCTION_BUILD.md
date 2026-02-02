# 🚀 Guia para Build de Produção - Conexão com Deus

## 📋 Pré-requisitos

### 1. **Keystore (Chave de Assinatura)**
Execute este comando para criar sua chave:
```bash
keytool -genkey -v -keystore conexao-deus.keystore -alias conexao-deus -keyalg RSA -keysize 2048 -validity 10000
```

**Informações que você precisará fornecer:**
- Nome e sobrenome
- Unidade organizacional
- Organização
- Cidade
- Estado
- Código do país (BR)
- Senha do keystore
- Senha da chave

### 2. **Mover o Keystore**
Coloque o arquivo `conexao-deus.keystore` na pasta `android/app/`

### 3. **Configurar Senhas**
No arquivo `android/app/build.gradle`, substitua:
- `SUA_SENHA_AQUI` pela senha do keystore
- `SUA_SENHA_CHAVE_AQUI` pela senha da chave

## 🔧 Passos para Build

### 1. **Build do Web App**
```bash
npm run build
```

### 2. **Sincronizar com Capacitor**
```bash
npx cap sync android
```

### 3. **Build de Produção**
```bash
npx cap build android --release
```

## 📱 Arquivo Gerado
O APK será gerado em:
```
android/app/build/outputs/apk/release/app-release.apk
```

## ⚠️ **IMPORTANTE: Guarde suas senhas!**
- **NUNCA** perca o arquivo keystore
- **NUNCA** esqueça as senhas
- **SEMPRE** faça backup do keystore

## 🎯 **Para Google Play Store**
- Use o arquivo APK gerado
- Faça upload na Google Play Console
- Configure as informações do app
- Envie para revisão

## 🔍 **Verificar Build**
Antes de publicar, teste o APK:
1. Desinstale a versão de desenvolvimento
2. Instale o APK de produção
3. Teste todas as funcionalidades
4. Verifique se AdMob está funcionando

## 📞 **Suporte**
Se tiver problemas, verifique:
- Senhas corretas no build.gradle
- Keystore na pasta correta
- Build do web app bem-sucedido
- Sincronização do Capacitor

## 📋 **Informações do App**
- **Nome**: Conexão com Deus
- **Package**: com.mizflow.conexaodeus
- **Versão**: 1.0
- **Keystore**: conexao-deus.keystore 