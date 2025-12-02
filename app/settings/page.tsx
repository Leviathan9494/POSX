'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, DollarSign, Receipt, Package, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  getStockSettings, 
  saveStockSettings, 
  getBusinessSettings, 
  saveBusinessSettings,
  StockSettings,
  BusinessSettings 
} from '@/lib/settings';

export default function SettingsPage() {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: 'My Store',
    businessType: 'retail',
    currency: 'USD',
    taxRate: 10
  });
  const [stockSettings, setStockSettings] = useState<StockSettings>({
    lowStockThreshold: 15,
    mediumStockThreshold: 30,
    criticalStockThreshold: 5
  });
  const router = useRouter();

  useEffect(() => {
    // Load all settings from localStorage
    setStockSettings(getStockSettings());
    setBusinessSettings(getBusinessSettings());
  }, []);

  const handleSave = () => {
    // Save all settings
    saveStockSettings(stockSettings);
    saveBusinessSettings(businessSettings);
    
    toast.success('Settings saved successfully!');
  };

  const handleStockSettingChange = (field: keyof StockSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    setStockSettings(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleBusinessSettingChange = (field: keyof BusinessSettings, value: string | number) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
              ← Back
            </button>
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Store className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={businessSettings.businessType}
                  onChange={(e) => handleBusinessSettingChange('businessType', e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="retail">Retail Store</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="shop">Small Shop</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {businessSettings.businessType === 'retail' &&
                    'Optimized for retail operations with inventory tracking'}
                  {businessSettings.businessType === 'restaurant' &&
                    'Includes table management and kitchen order features'}
                  {businessSettings.businessType === 'shop' && 'Simple setup for small shops and boutiques'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessSettings.businessName}
                  onChange={(e) => handleBusinessSettingChange('businessName', e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stock Threshold Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Package className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Stock Alert Thresholds</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Configure when products display different stock status badges across the system
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critical Stock Threshold
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock Warning
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockSettings.criticalStockThreshold}
                  onChange={(e) => handleStockSettingChange('criticalStockThreshold', e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Products at or below this level show a red "Low Stock" badge (Currently: ≤{stockSettings.criticalStockThreshold} units)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Low Stock
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockSettings.lowStockThreshold}
                  onChange={(e) => handleStockSettingChange('lowStockThreshold', e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Products at or below this level also show red badge (Currently: ≤{stockSettings.lowStockThreshold} units)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medium Stock Threshold
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Medium Stock
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockSettings.mediumStockThreshold}
                  onChange={(e) => handleStockSettingChange('mediumStockThreshold', e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Products at or below this level show a yellow badge (Currently: ≤{stockSettings.mediumStockThreshold} units)
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Badge Preview</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-lg shadow-red-500/50">
                      Critical (0-{stockSettings.criticalStockThreshold})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-lg shadow-red-500/50">
                      Low ({stockSettings.criticalStockThreshold + 1}-{stockSettings.lowStockThreshold})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-lg shadow-yellow-500/50">
                      Medium ({stockSettings.lowStockThreshold + 1}-{stockSettings.mediumStockThreshold})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg shadow-green-500/50">
                      In Stock (&gt;{stockSettings.mediumStockThreshold})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Financial Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={businessSettings.currency}
                  onChange={(e) => handleBusinessSettingChange('currency', e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={businessSettings.taxRate}
                  onChange={(e) => handleBusinessSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Receipt Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Receipt className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Receipt Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Print receipts automatically</p>
                  <p className="text-sm text-gray-500">Automatically print receipt after each sale</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email receipts</p>
                  <p className="text-sm text-gray-500">Send receipt via email to customers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Assistant Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable AI suggestions</p>
                  <p className="text-sm text-gray-500">Get intelligent recommendations and insights</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Make sure to set your OpenAI API key in the .env file for AI
                  features to work.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 font-semibold"
            >
              <Save className="w-5 h-5" />
              <span>Save All Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
