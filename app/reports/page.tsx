'use client';

import { useState, useEffect, Suspense } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ReportsContent() {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('sales');
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
    
    // Handle URL parameters from AI
    const typeParam = searchParams.get('type');
    const periodParam = searchParams.get('period');
    
    if (typeParam) {
      setReportType(typeParam);
      toast.success(`Showing ${typeParam} report`);
    }
    
    if (periodParam) {
      setDateRange(periodParam);
      toast.success(`Period: ${periodParam}`);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/products'),
      ]);
      const salesData = await salesRes.json();
      const productsData = await productsRes.json();
      setSales(salesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Calculate statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = sales.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalItemsSold = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s: number, item: any) => s + item.quantity, 0),
    0
  );

  // Sales by day (last 7 days)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString();
    const daySales = sales.filter(
      (sale) => new Date(sale.createdAt).toLocaleDateString() === dateStr
    );
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: daySales.reduce((sum, sale) => sum + sale.total, 0),
      orders: daySales.length,
    };
  });

  // Top selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  sales.forEach((sale) => {
    sale.items.forEach((item: any) => {
      const existing = productSales.get(item.productId) || {
        name: item.product.name,
        quantity: 0,
        revenue: 0,
      };
      productSales.set(item.productId, {
        name: item.product.name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.total,
      });
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
                ← Back
              </button>
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last period</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                <p className="text-sm text-blue-600 mt-1">+8.2% from last period</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-purple-600 mt-1">+3.8% from last period</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">{totalItemsSold}</p>
                <p className="text-sm text-orange-600 mt-1">+15.3% from last period</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Overview (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Revenue ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Performance</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Alerts</h2>
          <div className="space-y-3">
            {products
              .filter((p) => p.stock <= p.minStock)
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      Current stock: {product.stock} {product.unit}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                    Low Stock
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
