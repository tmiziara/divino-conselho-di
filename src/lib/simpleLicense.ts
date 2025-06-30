// Tipos para licença simples
export interface SimpleLicense {
  userId: string;
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  expiresAt: string;
  features: string[];
  lastValidated: string;
}

// Chaves de armazenamento
const LICENSE_KEY = 'divino_conselho_license';

// Classe para gerenciar licenças simples
export class SimpleLicenseManager {
  private static instance: SimpleLicenseManager;
  
  private constructor() {}
  
  static getInstance(): SimpleLicenseManager {
    if (!SimpleLicenseManager.instance) {
      SimpleLicenseManager.instance = new SimpleLicenseManager();
    }
    return SimpleLicenseManager.instance;
  }

  // Salvar licença
  setLicense(license: SimpleLicense): void {
    try {
      window.localStorage.setItem(LICENSE_KEY, JSON.stringify(license));
    } catch (error) {
      console.error('Error saving license:', error);
    }
  }

  // Obter licença
  getLicense(): SimpleLicense | null {
    try {
      const stored = window.localStorage.getItem(LICENSE_KEY);
      if (!stored) return null;
      
      const license: SimpleLicense = JSON.parse(stored);
      
      // Verificar se expirou
      if (new Date(license.expiresAt) <= new Date()) {
        this.clearLicense();
        return null;
      }
      
      return license;
    } catch (error) {
      console.error('Error reading license:', error);
      return null;
    }
  }

  // Limpar licença
  clearLicense(): void {
    try {
      window.localStorage.removeItem(LICENSE_KEY);
    } catch (error) {
      console.error('Error clearing license:', error);
    }
  }

  // Verificar se tem acesso a funcionalidade
  hasAccess(feature: string): boolean {
    const license = this.getLicense();
    
    if (!license) return false;
    
    // Verificar se a licença não expirou
    if (new Date(license.expiresAt) <= new Date()) {
      this.clearLicense();
      return false;
    }
    
    // Verificar se tem a funcionalidade
    return license.features.includes(feature);
  }

  // Verificar se precisa validar com servidor
  needsServerValidation(): boolean {
    const license = this.getLicense();
    
    if (!license) return true;
    
    // Validar a cada 7 dias (mais simples)
    const lastValidated = new Date(license.lastValidated);
    const now = new Date();
    const daysSinceValidation = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceValidation >= 7;
  }

  // Validar com servidor (simplificado)
  async validateWithServer(): Promise<boolean> {
    try {
      // Por enquanto, retorna false (sem assinatura)
      // Aqui você pode integrar com Stripe ou outro sistema de pagamento
      return false;
    } catch (error) {
      console.error('Error validating with server:', error);
      return false;
    }
  }

  // Obter estatísticas
  getStats() {
    const license = this.getLicense();
    
    return {
      hasLicense: !!license,
      licenseStatus: license?.subscriptionStatus,
      expiresAt: license?.expiresAt,
      features: license?.features || [],
      lastValidated: license?.lastValidated
    };
  }
}

// Instância singleton
export const simpleLicense = SimpleLicenseManager.getInstance(); 