# 🔧 Troubleshooting - Build Android

## Problemas Comuns e Soluções

### 1. **Erro: resource integer/google_play_services_version not found**

**Causa**: Referência a Google Play Services não configurada.

**Solução**: ✅ **Já corrigido** - Removida a referência desnecessária do AndroidManifest.xml.

### 2. **Erro: network_security_config not found**

**Causa**: Arquivo de configuração de segurança não encontrado.

**Solução**: ✅ **Já corrigido** - Removida a referência temporariamente.

### 3. **Botões de navegação do sistema sobrepondo os botões do app (Samsung Galaxy)**

**Causa**: A barra de navegação do Android não está sendo escondida ou posicionada corretamente.

**Solução**: ✅ **Já implementado** - Configurações específicas para Samsung Galaxy:

```bash
# Rebuild completo para aplicar as mudanças
npm run build
npx cap sync android
npx cap open android
```

**Configurações implementadas**:
- Barra de navegação transparente
- Navegação translúcida
- Safe areas configuradas
- Z-index alto para botões do app
- Padding ajustado para considerar a barra do sistema

### 4. **Build falha com erros de dependências**

**Solução**:
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Sincronizar Capacitor
npx cap sync android
```

### 5. **Erro de permissões no Android Studio**

**Solução**:
```bash
# Verificar se o Android SDK está configurado
echo $ANDROID_HOME

# Se não estiver configurado, adicione ao PATH:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### 6. **App não abre no dispositivo/emulador**

**Soluções**:
```bash
# 1. Limpar build do Android Studio
# Build > Clean Project
# Build > Rebuild Project

# 2. Sincronizar via linha de comando
npx cap sync android

# 3. Verificar se o dispositivo está conectado
adb devices
```

### 7. **Erro de certificado SSL**

**Solução**: Para desenvolvimento, você pode temporariamente permitir tráfego HTTP:

```xml
<!-- No AndroidManifest.xml -->
android:usesCleartextTraffic="true"
```

### 8. **Problemas com PWA**

**Solução**:
```bash
# Verificar se o plugin PWA está instalado
npm list vite-plugin-pwa

# Se não estiver, instalar:
npm install vite-plugin-pwa --save-dev

# Rebuild
npm run build
npx cap sync android
```

### 9. **Erro de memória durante build**

**Solução**:
```bash
# Aumentar memória do Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Ou no package.json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
}
```

### 10. **Problemas com Capacitor plugins**

**Solução**:
```bash
# Verificar plugins instalados
npx cap ls

# Reinstalar plugins
npm install @capacitor/core @capacitor/cli
npx cap sync android
```

### 11. **Erro de versão do Java**

**Solução**: Certifique-se de usar Java 11 ou superior:
```bash
java -version
# Deve mostrar versão 11 ou superior
```

### 12. **Problemas persistentes com Android**

**Solução**: Reset completo da plataforma Android:
```bash
# Remover plataforma Android e recriar
npm run android:reset

# Ou manualmente:
rm -rf android
npx cap add android
npx cap sync android
```

## 🔄 Processo de Build Limpo

Se você encontrar problemas persistentes, siga este processo completo:

```bash
# 1. Limpar tudo
rm -rf node_modules package-lock.json
rm -rf android/app/build
rm -rf android/.gradle

# 2. Reinstalar dependências
npm install

# 3. Build do projeto
npm run build

# 4. Sincronizar Capacitor
npx cap sync android

# 5. Abrir no Android Studio
npx cap open android
```

## 📱 Verificações Pré-Build

Antes de fazer o build, verifique:

- [ ] Node.js versão 18+ instalado
- [ ] Android Studio instalado e configurado
- [ ] Android SDK instalado
- [ ] Dispositivo/emulador conectado
- [ ] Todas as dependências instaladas
- [ ] Capacitor sincronizado

## 🚀 Comandos Úteis

```bash
# Verificar versões
node --version
npm --version
npx cap --version

# Verificar dispositivos conectados
adb devices

# Logs do dispositivo
adb logcat

# Limpar cache do Gradle
cd android
./gradlew clean
cd ..

# Build específico para release
cd android
./gradlew assembleRelease
cd ..

# Comandos Capacitor disponíveis
npx cap --help
npx cap ls
npx cap sync
npx cap run android
npx cap open android
```

## 📞 Suporte

Se você ainda encontrar problemas:

1. Verifique os logs completos no Android Studio
2. Execute `adb logcat` para ver logs do dispositivo
3. Verifique se todas as dependências estão na versão correta
4. Consulte a documentação oficial do Capacitor

---

**Dica**: Sempre faça um build limpo quando adicionar novos plugins ou fazer mudanças significativas na configuração. 