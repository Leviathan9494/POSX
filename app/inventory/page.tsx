'use client';

import { useState, useEffect, Suspense } from 'react';
import { Package, Search, Plus, AlertCircle, Edit, Archive } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getStockSettings, StockSettings } from '@/lib/settings';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category: string;
  unit: string;
  image?: string;
  description?: string;
  barcode?: string;
}

function InventoryContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockSettings, setStockSettings] = useState<StockSettings>({
    lowStockThreshold: 15,
    mediumStockThreshold: 30,
    criticalStockThreshold: 5
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProducts();
    
    // Load stock settings
    setStockSettings(getStockSettings());
    
    // Handle URL parameters from AI
    const filterParam = searchParams.get('filter');
    const actionParam = searchParams.get('action');
    
    if (filterParam === 'low-stock') {
      setShowLowStockOnly(true);
      toast.success('Showing low stock items');
    }
    
    if (actionParam === 'add') {
      setShowAddModal(true);
      toast.success('Opening product form');
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  // Low stock threshold - uses settings from localStorage
  const isLowStock = (product: Product) => {
    return product.stock <= product.minStock || product.stock <= stockSettings.lowStockThreshold;
  };

  // Get stock status badge
  const getStockStatus = (product: Product) => {
    if (product.stock <= product.minStock || product.stock <= stockSettings.criticalStockThreshold) {
      return { label: 'Out of Stock', color: 'bg-red-500 text-white shadow-lg shadow-red-500/50' };
    } else if (product.stock <= stockSettings.lowStockThreshold) {
      return { label: 'Low Stock', color: 'bg-red-500 text-white shadow-lg shadow-red-500/50' };
    } else if (product.stock <= stockSettings.mediumStockThreshold) {
      return { label: 'Medium Stock', color: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50' };
    } else {
      return { label: 'In Stock', color: 'bg-green-500 text-white shadow-lg shadow-green-500/50' };
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesLowStock = !showLowStockOnly || isLowStock(p);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockProducts = products.filter(isLowStock);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
              <p className="text-sm text-amber-700">
                {lowStockProducts.length} product(s) are running low on stock
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedProduct(product)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.stock} {product.unit}
                    </div>
                    <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatus(product).color}`}>
                      {getStockStatus(product).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Archive className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          stockSettings={stockSettings}
        />
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={fetchProducts} />
      )}
    </div>
  );
}

function ProductDetailModal({ 
  product, 
  onClose,
  stockSettings 
}: { 
  product: Product; 
  onClose: () => void;
  stockSettings: StockSettings;
}) {
  const getStockStatus = (product: Product) => {
    if (product.stock <= product.minStock || product.stock <= stockSettings.criticalStockThreshold) {
      return { label: 'Out of Stock', color: 'bg-red-500 text-white', textColor: 'text-red-600' };
    } else if (product.stock <= stockSettings.lowStockThreshold) {
      return { label: 'Low Stock', color: 'bg-red-500 text-white', textColor: 'text-red-600' };
    } else if (product.stock <= stockSettings.mediumStockThreshold) {
      return { label: 'Medium Stock', color: 'bg-yellow-500 text-white', textColor: 'text-yellow-600' };
    } else {
      return { label: 'In Stock', color: 'bg-green-500 text-white', textColor: 'text-green-600' };
    }
  };

  const status = getStockStatus(product);
  const profitMargin = product.cost ? ((product.price - product.cost) / product.price * 100).toFixed(1) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Product Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="space-y-4">
              {product.image ? (
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-200">
                  <div className="text-center">
                    <Package className="w-20 h-20 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No image available</p>
                  </div>
                </div>
              )}
              
              {/* Stock Status Badge */}
              <div className="flex items-center justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${status.color} shadow-lg`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                )}
              </div>

              {/* Price & Stock Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">SELLING PRICE</div>
                  <div className="text-2xl font-bold text-blue-900">${product.price.toFixed(2)}</div>
                </div>
                
                <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                  product.stock <= stockSettings.criticalStockThreshold 
                    ? 'from-red-50 to-red-100 border-red-200' 
                    : product.stock <= stockSettings.lowStockThreshold
                    ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                    : 'from-green-50 to-green-100 border-green-200'
                }`}>
                  <div className={`text-xs font-medium mb-1 ${
                    product.stock <= stockSettings.criticalStockThreshold 
                      ? 'text-red-600' 
                      : product.stock <= stockSettings.lowStockThreshold
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>STOCK LEVEL</div>
                  <div className={`text-2xl font-bold ${
                    product.stock <= stockSettings.criticalStockThreshold 
                      ? 'text-red-900' 
                      : product.stock <= stockSettings.lowStockThreshold
                      ? 'text-yellow-900'
                      : 'text-green-900'
                  }`}>{product.stock} {product.unit}</div>
                  <div className="text-xs text-gray-500 mt-1">Min: {product.minStock} {product.unit}</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    {product.category}
                  </span>
                </div>
                
                {product.sku && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SKU</span>
                    <span className="text-sm font-mono text-gray-900 bg-white px-3 py-1 rounded border border-gray-200">
                      {product.sku}
                    </span>
                  </div>
                )}
                
                {product.barcode && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Barcode</span>
                    <span className="text-sm font-mono text-gray-900 bg-white px-3 py-1 rounded border border-gray-200">
                      {product.barcode}
                    </span>
                  </div>
                )}
                
                {product.cost && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cost Price</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${product.cost.toFixed(2)}
                      </span>
                    </div>
                    
                    {profitMargin && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Profit Margin</span>
                        <span className="text-sm font-semibold text-green-600">
                          {profitMargin}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium shadow-lg shadow-blue-500/50"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    category: '',
    unit: 'unit',
    sku: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock),
        }),
      });

      if (response.ok) {
        toast.success('Product added successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      toast.error('Error adding product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
              <input
                type="number"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU (optional)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
