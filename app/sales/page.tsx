'use client';

import { useState, useEffect, Suspense } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, User, DollarSign, X, Sparkles, Package } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

function SalesContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Handle URL parameters from AI after products are loaded
    if (products.length === 0) return;
    
    const searchParam = searchParams.get('search');
    const customerParam = searchParams.get('customer');
    const productIdParam = searchParams.get('productId');
    
    if (searchParam) {
      setSearchQuery(searchParam);
      toast.success(`Searching for: ${searchParam}`);
    }
    
    if (customerParam) {
      // Find and select customer by name
      findAndSelectCustomer(customerParam);
    }
    
    if (productIdParam) {
      // Auto-add product to cart by ID
      const product = products.find(p => p.id === productIdParam);
      if (product) {
        addToCart(product);
        toast.success(`✅ ${product.name} added to cart!`, { duration: 3000 });
      }
    }
  }, [searchParams, products]);

  useEffect(() => {
    // Auto-fetch recommendations when customer is selected
    if (selectedCustomer && selectedCustomer.id) {
      fetchRecommendations(selectedCustomer.id);
    } else {
      setRecommendedProducts([]);
      setShowRecommendations(false);
    }
  }, [selectedCustomer]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const findAndSelectCustomer = async (customerName: string) => {
    // Wait for customers to be loaded
    if (customers.length === 0) {
      setTimeout(() => findAndSelectCustomer(customerName), 100);
      return;
    }
    
    const customer = customers.find(
      c => c.name.toLowerCase().includes(customerName.toLowerCase()) ||
           customerName.toLowerCase().includes(c.name.toLowerCase())
    );
    
    if (customer) {
      setSelectedCustomer(customer);
      toast.success(`Selected customer: ${customer.name}`);
    } else {
      toast.error(`Customer "${customerName}" not found`);
    }
  };

  const fetchRecommendations = async (customerId: string) => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/recommendations`);
      const data = await response.json();
      setRecommendedProducts(data.recommendations || []);
      setShowRecommendations(true);
      toast.success(`🎯 ${data.recommendations.length} products recommended`, { duration: 3000 });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    toast.success(`Customer: ${customer.name}`);
  };

  const removeCustomer = () => {
    setSelectedCustomer(null);
    setRecommendedProducts([]);
    setShowRecommendations(false);
    toast.success('Customer removed');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        toast.error('Not enough stock');
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.product.stock) {
              toast.error('Not enough stock');
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          tax: item.product.price * item.quantity * 0.1,
          total: item.product.price * item.quantity * 1.1,
        })),
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        toast.success('Sale completed successfully!');
        setCart([]);
        setSelectedCustomer(null);
        fetchProducts(); // Refresh stock
      } else {
        toast.error('Failed to complete sale');
      }
    } catch (error) {
      toast.error('Error processing sale');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, SKU, or category..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left overflow-hidden"
                  >
                    {product.image && (
                      <div className="relative w-full h-32 mb-2 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}
                    {!product.image && (
                      <div className="relative w-full h-32 mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                    <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                  </button>
                ))}
              </div>

              {/* AI Recommendations */}
              {showRecommendations && recommendedProducts.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-purple-900">🎯 Recommended for {selectedCustomer?.name}</h3>
                    <button
                      onClick={() => setShowRecommendations(false)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendedProducts.slice(0, 6).map((product: any) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="relative p-3 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all text-left overflow-hidden"
                      >
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg z-10">AI</span>
                        {product.image && (
                          <div className="relative w-full h-28 mb-2 bg-white rounded-lg overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 768px) 50vw, 33vw"
                              unoptimized
                            />
                          </div>
                        )}
                        {!product.image && (
                          <div className="relative w-full h-28 mb-2 bg-white rounded-lg flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                        <p className="text-md font-bold text-purple-600">${product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cart</h2>

              {/* Customer Selection */}
              <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <User className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
                      </span>
                      {selectedCustomer && (
                        <p className="text-xs text-gray-500">
                          {selectedCustomer.email || selectedCustomer.phone || 'No contact info'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowCustomerModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-all"
                    >
                      {selectedCustomer ? 'Change' : 'Select'}
                    </button>
                    {selectedCustomer && (
                      <button
                        onClick={removeCustomer}
                        className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-100 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                {loadingRecommendations && (
                  <div className="mt-2 text-xs text-purple-600 flex items-center space-x-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Loading recommendations...</span>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      {item.product.image ? (
                        <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.product.name}</p>
                        <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital">Digital Wallet</option>
                </select>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={completeSale}
                disabled={cart.length === 0}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
              >
                <DollarSign className="w-5 h-5" />
                <span>Complete Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[600px] overflow-hidden border-2 border-blue-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Select Customer</h2>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search customers by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div className="overflow-y-auto max-h-[400px] p-4">
              {customers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No customers found</p>
                  <button
                    onClick={() => router.push('/customers?action=add')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Add First Customer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {customers
                    .filter(customer => 
                      !customerSearchQuery ||
                      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                      customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                      customer.phone?.includes(customerSearchQuery)
                    )
                    .map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="w-full p-4 text-left bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-100 hover:to-purple-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {customer.name}
                            </h3>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                              {customer.email && (
                                <span className="flex items-center">
                                  📧 {customer.email}
                                </span>
                              )}
                              {customer.phone && (
                                <span className="flex items-center">
                                  📱 {customer.phone}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>💰 ${customer.totalSpent?.toFixed(2) || '0.00'} spent</span>
                              <span>🛒 {customer.visitCount || 0} visits</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  {customers.filter(customer => 
                    !customerSearchQuery ||
                    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                    customer.phone?.includes(customerSearchQuery)
                  ).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No customers match your search</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.push('/customers?action=add')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all font-medium"
                >
                  + Add New Customer
                </button>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SalesContent />
    </Suspense>
  );
}
