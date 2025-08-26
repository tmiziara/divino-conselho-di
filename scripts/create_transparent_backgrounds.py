#!/usr/bin/env python3
"""
Script para criar backgrounds transparentes para os ícones Android.
Isso garante que não apareçam bordas indesejadas.
"""

import os
from PIL import Image

def create_transparent_background(size, output_path):
    """Cria uma imagem PNG transparente"""
    try:
        # Cria uma imagem transparente
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Salva como PNG transparente
        img.save(output_path, 'PNG')
        print(f"✅ Criado: {output_path} ({size}x{size})")
        
    except Exception as e:
        print(f"❌ Erro ao criar background {output_path}: {e}")

def main():
    # Configurações dos backgrounds Android
    background_sizes = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192
    }
    
    # Cria os diretórios de saída
    base_output_dir = "android/app/src/main/res"
    
    for density, size in background_sizes.items():
        # Cria o diretório mipmap se não existir
        output_dir = os.path.join(base_output_dir, f"mipmap-{density}")
        os.makedirs(output_dir, exist_ok=True)
        
        # Cria o background transparente
        output_path = os.path.join(output_dir, "ic_launcher_background.png")
        create_transparent_background(size, output_path)
    
    print("\n🎉 Backgrounds transparentes criados com sucesso!")
    print("✨ Agora seus ícones aparecerão sem bordas!")

if __name__ == "__main__":
    main() 