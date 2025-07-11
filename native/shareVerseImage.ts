// Utilitário para compartilhar imagem do versículo no app nativo (Android/iOS)
export async function shareVerseImage(imageUrl: string) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { SocialSharing } = await import('@awesome-cordova-plugins/social-sharing');

  const base64 = imageUrl.replace(/^data:image\/png;base64,/, '');
  const result = await Filesystem.writeFile({
    path: 'versiculo.png',
    data: base64,
    directory: Directory.Cache
  });

  await SocialSharing.share(
    '',
    'Versículo do Dia',
    result.uri,
    null
  );
} 