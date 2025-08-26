#!/usr/bin/env python3
"""
Script para gerar ícones do Android a partir de uma imagem PNG original.
Este script cria ícones nas diferentes densidades necessárias para o Android.
"""

import os
import sys
from PIL import Image

def create_android_icon(input_image_path, output_dir, size, density_name):
    """Cria um ícone do Android com a densidade especificada"""
    try:
        # Abre a imagem original
        with Image.open(input_image_path) as img:
            # Converte para RGBA se necessário
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Redimensiona para o tamanho especificado
            img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Salva o ícone exatamente como está, sem máscara
            output_path = os.path.join(output_dir, "ic_launcher.png")
            img_resized.save(output_path, 'PNG')
            print(f"✅ Criado: {output_path} ({size}x{size})")
            
    except Exception as e:
        print(f"❌ Erro ao criar ícone {density_name}: {e}")

def main():
    # Configurações dos ícones Android
    icon_sizes = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192
    }
    
    # Caminho da imagem original
    input_image = "public/icon.png"
    
    # Verifica se a imagem existe
    if not os.path.exists(input_image):
        print(f"❌ Imagem não encontrada: {input_image}")
        print("Por favor, coloque sua imagem PNG na pasta 'public' com o nome 'icon.png'")
        return
    
    print(f"🎨 Usando imagem: {input_image}")
    print("📱 Gerando ícones para todas as densidades...")
    
    # Cria os diretórios de saída
    base_output_dir = "android/app/src/main/res"
    
    for density, size in icon_sizes.items():
        # Cria o diretório mipmap se não existir
        output_dir = os.path.join(base_output_dir, f"mipmap-{density}")
        os.makedirs(output_dir, exist_ok=True)
        
        # Gera o ícone
        create_android_icon(input_image, output_dir, size, density)
    
    print("\n🎉 Ícones do Android gerados com sucesso!")
    print("✨ Sua imagem será exibida exatamente como criou, sem bordas!")
    print("📋 Agora você pode fazer build do projeto.")

if __name__ == "__main__":
    main() 