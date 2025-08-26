# Como Usar Sua Imagem Original no Android

## 🎯 **Objetivo**
Usar a imagem que você criou (com a cruz dourada e fundo azul escuro) em vez do ícone SVG que foi criado automaticamente.

## 📁 **Passos para Usar Sua Imagem**

### 1. **Preparar a Imagem**
- Coloque sua imagem PNG na pasta `public/` com o nome `icon.png`
- A imagem deve ter fundo transparente ou fundo azul escuro
- Resolução recomendada: 512x512 pixels ou maior

### 2. **Executar o Script de Geração**
```bash
# Instalar dependência necessária
pip install Pillow

# Executar o script
python scripts/generate_android_icons.py
```

### 3. **O Script Vai Criar**
- `mipmap-mdpi/ic_launcher_mdpi.png` (48x48)
- `mipmap-hdpi/ic_launcher_hdpi.png` (72x72)
- `mipmap-xhdpi/ic_launcher_xhdpi.png` (96x96)
- `mipmap-xxhdpi/ic_launcher_xxhdpi.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher_xxxhdpi.png` (192x192)

## 🔧 **Configuração Alternativa (Manual)**

Se preferir fazer manualmente:

### Opção A: Usar Apenas PNGs
1. Remover os arquivos XML de ícones adaptativos
2. Colocar suas imagens PNG diretamente nas pastas `mipmap-*`
3. Renomear para `ic_launcher.png`

### Opção B: Manter Ícones Adaptativos
1. Converter sua imagem para SVG
2. Substituir o conteúdo de `ic_launcher_foreground.xml`
3. Manter o fundo transparente

## 📱 **Vantagens da Sua Imagem Original**
- ✅ Design exatamente como você criou
- ✅ Cores e efeitos preservados
- ✅ Sem bordas indesejadas
- ✅ Qualidade visual superior

## ⚠️ **Importante**
- A imagem deve ter fundo transparente ou azul escuro
- Evite bordas brancas ou claras
- Use formato PNG para melhor qualidade
- Resolução mínima: 192x192 pixels

## 🚀 **Após Gerar os Ícones**
1. Limpar cache do Android Studio
2. Fazer rebuild do projeto
3. Reinstalar o app

Sua imagem original será usada em todas as densidades de tela do Android! 🎉 