import { useState, useEffect, useCallback, useRef } from 'react';

interface Verse {
  tema: string;
  referencia: string;
  texto: string;
}

interface UseVerseImageProps {
  verse: Verse | null;
  backgroundImage?: string;
}

export const useVerseImage = ({ verse, backgroundImage = 'background1.jpg' }: UseVerseImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const generationId = useRef(0);

  const generateImage = useCallback(async (verseData: Verse, bgImage: string, genId: number) => {
    if (!verseData) return;
    setLoading(true);
    console.log('[useVerseImage] Iniciando geração da imagem', { verseData, bgImage, genId });
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas não suportado');
      const width = 400;
      const height = 600;
      canvas.width = width;
      canvas.height = height;
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        backgroundImg.onload = resolve;
        backgroundImg.onerror = reject;
        backgroundImg.src = `/templates/${bgImage}`;
      });
      ctx.drawImage(backgroundImg, 0, 0, width, height);
      const overlay = ctx.createLinearGradient(0, 0, 0, height);
      overlay.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
      overlay.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      const referenceY = 80;
      ctx.fillText(verseData.referencia, width / 2, referenceY);
      ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      const maxWidth = width - 40;
      const words = verseData.texto.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);
      const lineHeight = 28;
      const startY = referenceY + 60;
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        ctx.fillText(line, width / 2, y);
      });
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 2;
      ctx.fillText(`Tema: ${verseData.tema}`, width / 2, height - 40);
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 1;
      ctx.fillText('Conexão com Deus', width / 2, height - 20);
      const dataUrl = canvas.toDataURL('image/png');
      // Só atualiza se for a geração mais recente
      if (generationId.current === genId) {
        setImageUrl(dataUrl);
        console.log('[useVerseImage] Imagem gerada com sucesso', { genId, dataUrlLength: dataUrl.length });
      }
    } catch (error) {
      console.error('[useVerseImage] Erro ao gerar imagem:', error, { verseData, bgImage, genId });
      if (generationId.current === genId) {
        setImageUrl(null);
      }
    } finally {
      if (generationId.current === genId) {
        setLoading(false);
        console.log('[useVerseImage] Finalizou geração', { genId });
      }
    }
  }, []);

  useEffect(() => {
    console.log('[useVerseImage] useEffect disparado', { verse, backgroundImage });
    if (verse) {
      generationId.current += 1;
      const currentGen = generationId.current;
      setImageUrl(null); // Limpa antes de gerar nova imagem
      generateImage(verse, backgroundImage, currentGen);
    } else {
      setImageUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse, backgroundImage]);

  useEffect(() => {
    if (imageUrl && imageUrl.startsWith('data:')) {
      console.log('[useVerseImage] imageUrl atualizado', { imageUrlLength: imageUrl.length });
    }
  }, [imageUrl]);

  return {
    imageUrl,
    loading,
    generateImage
  };
}; 