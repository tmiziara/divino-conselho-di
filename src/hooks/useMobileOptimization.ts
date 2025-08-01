import { useEffect, useCallback } from 'react';

export const useMobileOptimization = () => {
  // Otimizar scroll para mobile
  const optimizeScroll = useCallback(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-overflow-scrolling: touch;
      }
      .scroll-container {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Otimizar performance de imagens
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });
  }, []);

  // Otimizar cache de dados
  const optimizeCache = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker registrado:', registration);
      });
    }
  }, []);

  useEffect(() => {
    optimizeScroll();
    optimizeImages();
    optimizeCache();
  }, [optimizeScroll, optimizeImages, optimizeCache]);

  return {
    optimizeScroll,
    optimizeImages,
    optimizeCache
  };
}; 