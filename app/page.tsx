'use client';

import { Package, Users, ShoppingCart, BarChart3, Settings, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const quickActions = [
    { icon: ShoppingCart, label: 'New Sale', description: 'Process a transaction', href: '/sales', color: 'from-green-500 to-emerald-600' },
    { icon: Package, label: 'Inventory', description: 'Manage products', href: '/inventory', color: 'from-blue-500 to-cyan-600' },
    { icon: Users, label: 'Customers', description: 'View customer list', href: '/customers', color: 'from-purple-500 to-pink-600' },
    { icon: BarChart3, label: 'Reports', description: 'View analytics', href: '/reports', color: 'from-orange-500 to-red-600' },
  ];

  const stats = [
    { label: 'Total Products', value: '9,675', icon: Package, trend: '+12%' },
    { label: "Today's Sales", value: '$0', icon: TrendingUp, trend: '0%' },
    { label: 'Low Stock Items', value: '0', icon: AlertCircle, trend: '' },
    { label: 'Active Customers', value: '3', icon: Users, trend: '+3' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <header className="relative backdrop-blur-xl bg-black/30 border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-cyan-500/50 animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-50"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">POSX</h1>
                <p className="text-sm text-cyan-300/70">AI-Powered POS System</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-1">
              <NavButton icon={ShoppingCart} label="Sales" onClick={() => router.push('/sales')} />
              <NavButton icon={Package} label="Inventory" onClick={() => router.push('/inventory')} />
              <NavButton icon={Users} label="Customers" onClick={() => router.push('/customers')} />
              <NavButton icon={BarChart3} label="Reports" onClick={() => router.push('/reports')} />
              <NavButton icon={Settings} label="Settings" onClick={() => router.push('/settings')} />
            </nav>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-cyan-500/50 animate-pulse relative">
            <Sparkles className="w-10 h-10 text-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">Welcome to POSX</h2>
          <p className="text-lg text-cyan-200/80 mb-4">Your AI-powered point of sale system</p>
          <p className="text-sm text-cyan-300/60 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></span>
            AI Assistant is ready - Click the chat button to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="group relative backdrop-blur-xl bg-white/5 rounded-xl border border-cyan-500/30 p-6 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  {stat.trend && (
                    <span className={`text-sm font-semibold ${stat.trend.includes('+') ? 'text-cyan-400' : 'text-cyan-300/60'}`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-cyan-200/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="group relative overflow-hidden backdrop-blur-xl bg-white/5 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 p-6 text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 transition-colors">{action.label}</h4>
                  <p className="text-sm text-cyan-200/70 group-hover:text-cyan-100 transition-colors">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl p-8 text-white text-center border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 animate-pulse"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">Ask Me Anything!</h3>
            <p className="text-cyan-100/80 mb-6 max-w-2xl mx-auto">
              I'm your AI assistant, always available in the bottom right corner. 
              Ask me to check inventory, process sales, find customers, or generate reports!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-full text-sm backdrop-blur-sm hover:bg-white/20 hover:border-cyan-400/50 transition-all cursor-default">"Show me low stock items"</span>
              <span className="px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-full text-sm backdrop-blur-sm hover:bg-white/20 hover:border-cyan-400/50 transition-all cursor-default">"Find Samsung batteries"</span>
              <span className="px-4 py-2 bg-white/10 border border-cyan-400/30 rounded-full text-sm backdrop-blur-sm hover:bg-white/20 hover:border-cyan-400/50 transition-all cursor-default">"Generate sales report"</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-cyan-200 hover:bg-cyan-500/20 hover:text-cyan-100 border border-transparent hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
