// Utilitário para compartilhar imagem do versículo no app nativo (Android/iOS) usando API global do Capacitor/Cordova
async function ensureFilesystemPermission() {
  const Permissions = (window as any).Capacitor?.Plugins?.Permissions;
  if (!Permissions) return; // Se não houver plugin, ignora (pode ser iOS ou já concedido)
  try {
    // Solicita permissão de armazenamento (Android)
    const result = await Permissions.request({ permissions: ['storage'] });
    if (!result.storage || result.storage !== 'granted') {
      throw new Error('Permissão de armazenamento não concedida');
    }
  } catch (err) {
    throw new Error('Erro ao solicitar permissão de armazenamento: ' + err);
  }
}

export async function shareVerseImage(imageUrl: string) {
  const Filesystem = (window as any).Capacitor?.Plugins?.Filesystem;
  const Directory = { Cache: 'CACHE' };

  if (!Filesystem) {
    alert('Capacitor Filesystem plugin não disponível.');
    return;
  }

  // Checa permissão antes de salvar
  try {
    await ensureFilesystemPermission();
  } catch (err) {
    alert('Permissão de armazenamento não concedida. Não é possível compartilhar imagem.');
    console.error('[Compartilhar Versículo] Erro ao pedir permissão:', err);
    return;
  }

  const base64 = imageUrl.replace(/^data:image\/png;base64,/, '');
  const result = await Filesystem.writeFile({
    path: 'versiculo.png',
    data: base64,
    directory: Directory.Cache
  });

  // Para Cordova SocialSharing
  const SocialSharing = (window as any).plugins?.socialsharing;
  if (!SocialSharing) {
    alert('Cordova SocialSharing plugin não disponível.');
    return;
  }

  SocialSharing.share(
    '', // mensagem
    'Versículo do Dia', // título
    result.uri, // arquivo
    null // url
  );
} 