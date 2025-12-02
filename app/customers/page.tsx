'use client';

import { useState, useEffect, Suspense } from 'react';
import { Users, Search, Plus, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  createdAt: Date;
}

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState<any>(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [allRecommendationsData, setAllRecommendationsData] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCustomers();
    
    // Handle URL parameters from AI
    const searchParam = searchParams.get('search');
    const actionParam = searchParams.get('action');
    const nameParam = searchParams.get('name');
    const viewParam = searchParams.get('view');
    const openFirstParam = searchParams.get('openFirst');
    
    if (viewParam === 'all-recommendations') {
      setTimeout(() => fetchAllRecommendations(), 500);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
      toast.success(`Searching for: ${searchParam}`);
      
      // If openFirst=true, automatically open the first matching customer
      if (openFirstParam === 'true') {
        setTimeout(() => {
          const customer = customers.find(c => 
            c.name.toLowerCase().includes(searchParam.toLowerCase())
          );
          if (customer) {
            setSelectedCustomer(customer);
            toast.success(`Opened ${customer.name}'s profile`);
          }
        }, 500);
      }
      
      // If view=recommendations, find the customer and show recommendations
      if (viewParam === 'recommendations') {
        setTimeout(() => {
          const customer = customers.find(c => 
            c.name.toLowerCase().includes(searchParam.toLowerCase())
          );
          if (customer) {
            fetchRecommendations(customer);
          }
        }, 500);
      }
    }
    
    if (actionParam === 'add') {
      setShowAddModal(true);
      if (nameParam) {
        toast.success(`Adding customer: ${nameParam}`);
      }
    }
    
    if (viewParam === 'history' || viewParam === 'recommendations') {
      toast.success(`Showing ${viewParam} view`);
    }
  }, [searchParams, customers.length]);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...');
      const response = await fetch('/api/customers');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Customers data:', data);
      setCustomers(data);
      if (data.length === 0) {
        toast.success('No customers found. Add your first customer!');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const fetchRecommendations = async (customer: Customer) => {
    try {
      toast.loading('Generating recommendations...', { id: 'recommendations' });
      const response = await fetch(`/api/customers/${customer.id}/recommendations`);
      const data = await response.json();
      setRecommendationsData(data);
      setSelectedCustomer(customer);
      setShowRecommendations(true);
      toast.success(`Found ${data.recommendations.length} recommendations for ${customer.name}`, { id: 'recommendations' });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations', { id: 'recommendations' });
    }
  };

  const fetchAllRecommendations = async () => {
    try {
      toast.loading('Generating recommendations for all customers...', { id: 'all-recommendations' });
      const promises = customers.map(customer => 
        fetch(`/api/customers/${customer.id}/recommendations`)
          .then(res => res.json())
          .catch(err => null)
      );
      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null);
      setAllRecommendationsData(validResults);
      setShowAllRecommendations(true);
      toast.success(`Generated recommendations for ${validResults.length} customers`, { id: 'all-recommendations' });
    } catch (error) {
      console.error('Error fetching all recommendations:', error);
      toast.error('Failed to load recommendations', { id: 'all-recommendations' });
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchAllRecommendations}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>✨</span>
                <span>All Recommendations</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {customers.length > 0
                    ? (
                        customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                        customers.reduce((sum, c) => sum + c.visitCount, 0)
                      ).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.visitCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, email, or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first customer'}
                    </p>
                    {!searchQuery && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Customer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          {customer.address && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.visitCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastVisit
                        ? new Date(customer.lastVisit).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => fetchRecommendations(customer)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Recommendations
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal onClose={() => setShowAddModal(false)} onSuccess={fetchCustomers} />
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && !showRecommendations && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Recommendations Modal */}
      {showRecommendations && recommendationsData && selectedCustomer && (
        <RecommendationsModal
          customer={selectedCustomer}
          data={recommendationsData}
          onClose={() => {
            setShowRecommendations(false);
            setRecommendationsData(null);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* All Recommendations Modal */}
      {showAllRecommendations && (
        <AllRecommendationsModal
          data={allRecommendationsData}
          onClose={() => {
            setShowAllRecommendations(false);
            setAllRecommendationsData([]);
          }}
          onSelectCustomer={(customer) => {
            setShowAllRecommendations(false);
            fetchRecommendations(customer);
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Customer added successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to add customer');
      }
    } catch (error) {
      toast.error('Error adding customer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerDetailsModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{customer.name}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900">{customer.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-gray-900 font-bold">${customer.totalSpent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Visit Count</p>
              <p className="text-gray-900 font-bold">{customer.visitCount}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="text-gray-900">{customer.address || 'N/A'}</p>
          </div>
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllRecommendationsModal({
  data,
  onClose,
  onSelectCustomer,
}: {
  data: any[];
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">All Customer Recommendations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((customerData) => (
            <div key={customerData.customer.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{customerData.customer.name}</h3>
                <button
                  onClick={() => onSelectCustomer(customerData.customer)}
                  className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                >
                  View Details
                </button>
              </div>
              
              <div className="space-y-2 text-sm mb-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Total Spent:</span> ${customerData.customer.totalSpent.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Avg Order:</span> ${customerData.insights.avgOrderValue.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Favorite:</span> {customerData.insights.favoriteCategories[0]?.category}
                </p>
              </div>

              <div className="border-t border-purple-200 pt-3">
                <p className="text-xs font-semibold text-purple-900 mb-2">
                  Top Recommendations ({customerData.recommendations.length})
                </p>
                <div className="space-y-1">
                  {customerData.recommendations.slice(0, 3).map((product: any) => (
                    <div key={product.id} className="text-xs text-gray-700 flex justify-between">
                      <span className="truncate flex-1">{product.name}</span>
                      <span className="font-semibold text-purple-600">${product.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendationsModal({
  customer,
  data,
  onClose,
}: {
  customer: Customer;
  data: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Recommendations for {customer.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Customer Insights */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-semibold">Avg Order Value</p>
            <p className="text-2xl font-bold text-blue-900">${data.insights.avgOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-semibold">Days Since Visit</p>
            <p className="text-2xl font-bold text-green-900">{data.insights.daysSinceLastVisit || 'Today'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-semibold">Favorite Category</p>
            <p className="text-lg font-bold text-purple-900">{data.insights.favoriteCategories[0]?.category || 'N/A'}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-semibold">Top Brand</p>
            <p className="text-lg font-bold text-orange-900">{data.insights.favoriteBrands[0]?.brand || 'N/A'}</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Frequently Purchased</h3>
          <div className="grid grid-cols-5 gap-4">
            {data.insights.topProducts.map((product: any) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                <p className="text-xs text-gray-600 mt-1">Bought {product.purchaseCount}x</p>
                <p className="text-sm font-bold text-blue-600 mt-1">${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            💡 Recommended Products 
            <span className="text-sm text-gray-600 font-normal ml-2">
              ({data.recommendationReasons.replenishment} replenishment, {data.recommendationReasons.newInFavorites} new favorites, {data.recommendationReasons.similarCustomers} trending)
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {data.recommendations.map((product: any) => (
              <div key={product.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 hover:border-purple-400 transition-all">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                )}
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</p>
                <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                <p className="text-lg font-bold text-purple-600">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
