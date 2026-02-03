import i18n, { DEFAULT_LANGUAGE, normalizeLanguage } from "@/i18n";

const tx = (pt: string, en: string) => {
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE);
  return language === "en" ? en : pt;
};

// Utility to share verse image in native app (Android/iOS) using Capacitor/Cordova globals.
async function ensureFilesystemPermission() {
  const Permissions = (window as any).Capacitor?.Plugins?.Permissions;
  if (!Permissions) return; // If plugin is not available, ignore (iOS or already granted).
  try {
    const result = await Permissions.request({ permissions: ["storage"] });
    if (!result.storage || result.storage !== "granted") {
      throw new Error(tx("Permissão de armazenamento não concedida", "Storage permission not granted"));
    }
  } catch (err) {
    throw new Error(`${tx("Erro ao solicitar permissão de armazenamento: ", "Error requesting storage permission: ")}${err}`);
  }
}

export async function shareVerseImage(imageUrl: string) {
  const Filesystem = (window as any).Capacitor?.Plugins?.Filesystem;
  const Directory = { Cache: "CACHE" };

  if (!Filesystem) {
    alert(tx("Plugin Capacitor Filesystem não disponível.", "Capacitor Filesystem plugin is not available."));
    return;
  }

  try {
    await ensureFilesystemPermission();
  } catch (err) {
    alert(tx("Permissão de armazenamento não concedida. Não é possível compartilhar imagem.", "Storage permission not granted. Cannot share image."));
    return;
  }

  const base64 = imageUrl.replace(/^data:image\/png;base64,/, "");
  const result = await Filesystem.writeFile({
    path: "versiculo.png",
    data: base64,
    directory: Directory.Cache,
  });

  const SocialSharing = (window as any).plugins?.socialsharing;
  if (!SocialSharing) {
    alert(tx("Plugin Cordova SocialSharing não disponível.", "Cordova SocialSharing plugin is not available."));
    return;
  }

  SocialSharing.share(
    "",
    tx("Versículo do Dia", "Verse of the Day"),
    result.uri,
    null
  );
}
