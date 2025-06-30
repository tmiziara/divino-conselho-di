import CryptoJS from 'crypto-js';

// Tipos para o sistema de cache local
export interface LocalLicense {
  userId: string;
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  expiresAt: string;
  features: string[];
  lastValidated: string;
  validationKey: string;
}

export interface LocalAppData {
  publicContent: {
    basicVerses: string[];
    freeStudies: any[];
  };
  premiumContent: {
    encryptedStudies: string;
    encryptedVerses: string;
    encryptedChatHistory: string;
  };
  license: LocalLicense | null;
  cache: {
    [key: string]: {
      data: any;
      timestamp: string;
      expiresAt: string;
    };
  };
}

// Chaves de armazenamento
const STORAGE_KEYS = {
  LICENSE: 'divino_conselho_license',
  CACHE: 'divino_conselho_cache',
  PUBLIC_CONTENT: 'divino_conselho_public',
  PREMIUM_CONTENT: 'divino_conselho_premium',
} as const;

// Função para gerar hash de validação
const generateValidationHash = (license: Omit<LocalLicense, 'validationKey'>): string => {
  const data = `${license.userId}-${license.subscriptionStatus}-${license.expiresAt}-${license.features.join(',')}`;
  return CryptoJS.SHA256(data).toString();
};

// Função para criptografar dados simples (base64 + reversão)
const encryptData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  const base64 = btoa(jsonString);
  return base64.split('').reverse().join('');
};

// Função para descriptografar dados
const decryptData = (encryptedData: string): any => {
  try {
    const reversed = encryptedData.split('').reverse().join('');
    const base64 = atob(reversed);
    return JSON.parse(base64);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

// Classe principal para gerenciar armazenamento local
export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  private constructor() {}
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  // Gerenciar licença
  setLicense(license: Omit<LocalLicense, 'validationKey'>): void {
    const validationKey = generateValidationHash(license);
    const fullLicense: LocalLicense = { ...license, validationKey };
    
    window.localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(fullLicense));
  }

  getLicense(): LocalLicense | null {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.LICENSE);
      if (!stored) return null;
      
      const license: LocalLicense = JSON.parse(stored);
      
      // Validar integridade da licença
      const expectedHash = generateValidationHash({
        userId: license.userId,
        subscriptionStatus: license.subscriptionStatus,
        expiresAt: license.expiresAt,
        features: license.features,
        lastValidated: license.lastValidated
      });
      
      if (license.validationKey !== expectedHash) {
        console.warn('License integrity check failed');
        this.clearLicense();
        return null;
      }
      
      return license;
    } catch (error) {
      console.error('Error reading license:', error);
      return null;
    }
  }

  clearLicense(): void {
    window.localStorage.removeItem(STORAGE_KEYS.LICENSE);
  }

  // Gerenciar cache
  setCacheItem(key: string, data: any, expiresInHours: number = 24): void {
    const cache = this.getCache();
    cache[key] = {
      data,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
    };
    
    window.localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cache));
  }

  getCacheItem(key: string): any {
    const cache = this.getCache();
    const item = cache[key];
    
    if (!item) return null;
    
    // Verificar se expirou
    if (new Date(item.expiresAt) <= new Date()) {
      delete cache[key];
      window.localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cache));
      return null;
    }
    
    return item.data;
  }

  private getCache(): Record<string, any> {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.CACHE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading cache:', error);
      return {};
    }
  }

  clearCache(): void {
    window.localStorage.removeItem(STORAGE_KEYS.CACHE);
  }

  // Gerenciar conteúdo público
  setPublicContent(content: any): void {
    window.localStorage.setItem(STORAGE_KEYS.PUBLIC_CONTENT, JSON.stringify(content));
  }

  getPublicContent(): any {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.PUBLIC_CONTENT);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading public content:', error);
      return null;
    }
  }

  // Gerenciar conteúdo premium (criptografado)
  setPremiumContent(key: string, data: any): void {
    const encrypted = encryptData(data);
    const premiumContent = this.getPremiumContent();
    premiumContent[key] = encrypted;
    
    window.localStorage.setItem(STORAGE_KEYS.PREMIUM_CONTENT, JSON.stringify(premiumContent));
  }

  getPremiumContent(key?: string): any {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.PREMIUM_CONTENT);
      const premiumContent = stored ? JSON.parse(stored) : {};
      
      if (key) {
        const encrypted = premiumContent[key];
        return encrypted ? decryptData(encrypted) : null;
      }
      
      return premiumContent;
    } catch (error) {
      console.error('Error reading premium content:', error);
      return key ? null : {};
    }
  }

  // Limpar todos os dados
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      window.localStorage.removeItem(key);
    });
  }

  // Verificar se tem acesso a funcionalidade
  hasAccess(feature: string): boolean {
    const license = this.getLicense();
    
    if (!license) return false;
    
    // Verificar se a licença não expirou
    if (new Date(license.expiresAt) <= new Date()) {
      return false;
    }
    
    // Verificar se tem a funcionalidade
    return license.features.includes(feature);
  }

  // Verificar se precisa validar com servidor
  needsServerValidation(): boolean {
    const license = this.getLicense();
    
    if (!license) return true;
    
    // Validar a cada 24 horas
    const lastValidated = new Date(license.lastValidated);
    const now = new Date();
    const hoursSinceValidation = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceValidation >= 24;
  }
}

// Instância singleton
export const localStorage = LocalStorageManager.getInstance(); 