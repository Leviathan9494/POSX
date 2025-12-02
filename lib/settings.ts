export interface StockSettings {
  lowStockThreshold: number;
  mediumStockThreshold: number;
  criticalStockThreshold: number;
}

export const DEFAULT_STOCK_SETTINGS: StockSettings = {
  lowStockThreshold: 15,
  mediumStockThreshold: 30,
  criticalStockThreshold: 5,
};

export function getStockSettings(): StockSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_STOCK_SETTINGS;
  }

  try {
    const saved = localStorage.getItem('stockSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load stock settings:', error);
  }

  return DEFAULT_STOCK_SETTINGS;
}

export function saveStockSettings(settings: StockSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('stockSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save stock settings:', error);
  }
}

export interface BusinessSettings {
  businessName: string;
  businessType: string;
  currency: string;
  taxRate: number;
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'My Store',
  businessType: 'retail',
  currency: 'USD',
  taxRate: 10,
};

export function getBusinessSettings(): BusinessSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_BUSINESS_SETTINGS;
  }

  try {
    return {
      businessName: localStorage.getItem('businessName') || DEFAULT_BUSINESS_SETTINGS.businessName,
      businessType: localStorage.getItem('businessType') || DEFAULT_BUSINESS_SETTINGS.businessType,
      currency: localStorage.getItem('currency') || DEFAULT_BUSINESS_SETTINGS.currency,
      taxRate: parseFloat(localStorage.getItem('taxRate') || String(DEFAULT_BUSINESS_SETTINGS.taxRate)),
    };
  } catch (error) {
    console.error('Failed to load business settings:', error);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export function saveBusinessSettings(settings: BusinessSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('businessName', settings.businessName);
    localStorage.setItem('businessType', settings.businessType);
    localStorage.setItem('currency', settings.currency);
    localStorage.setItem('taxRate', String(settings.taxRate));
  } catch (error) {
    console.error('Failed to save business settings:', error);
  }
}
