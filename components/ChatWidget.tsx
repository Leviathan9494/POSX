'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageCircle, Minimize2, Sparkles } from 'lucide-react';
import { useAIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, addMessage, isProcessing, setProcessing } = useAIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setProcessing(true);

    try {
      console.log('Sending message:', userMessage);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      addMessage('assistant', data.explanation);

      // Execute actions
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          await executeAction(action);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      toast.error('Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const executeAction = async (action: any) => {
    switch (action.action) {
      case 'navigate':
        toast.success(`Navigating to ${action.params.page}`);
        setTimeout(() => {
          router.push(`/${action.params.page}`);
          setIsOpen(false);
        }, 1000);
        break;
      
      case 'show_low_stock':
        toast.success('Showing low stock items');
        router.push('/inventory?filter=low-stock');
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'generate_report':
        toast.success(`Generating ${action.params.type} report`);
        router.push(`/reports?type=${action.params.type}&period=${action.params.period}`);
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'search_product':
        toast.success(`Searching for: ${action.params.query}`);
        router.push(`/sales?search=${encodeURIComponent(action.params.query)}`);
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'search_customer':
        toast.success(`Searching for customer: ${action.params.query}`);
        router.push(`/customers?search=${encodeURIComponent(action.params.query)}`);
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'customer_history':
        toast.success('Opening customer history');
        if (action.params.customerQuery) {
          // Try to find exact customer match first
          try {
            const customerResponse = await fetch('/api/customers');
            const customers = await customerResponse.json();
            
            if (customers && customers.length > 0) {
              const query = action.params.customerQuery.toLowerCase().trim();
              
              // Find best matching customer
              const matchedCustomer = customers.find((c: any) => 
                c.name.toLowerCase().includes(query) || 
                query.includes(c.name.toLowerCase())
              );
              
              if (matchedCustomer) {
                toast.success(`Viewing ${matchedCustomer.name}'s purchase history`);
                router.push(`/customers/${matchedCustomer.id}`);
                setTimeout(() => setIsOpen(false), 1000);
                return;
              }
            }
          } catch (error) {
            console.error('Error finding customer:', error);
          }
          
          // Fallback to search if no exact match
          router.push(`/customers?search=${encodeURIComponent(action.params.customerQuery)}`);
        } else {
          router.push('/customers');
        }
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'recommend_products':
        toast.success('Generating product recommendations');
        if (action.params.customerQuery) {
          router.push(`/customers?search=${encodeURIComponent(action.params.customerQuery)}&view=recommendations`);
        } else {
          router.push('/customers');
        }
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'recommend_all':
        toast.success('Generating recommendations for all customers');
        router.push('/customers?view=all-recommendations');
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'create_sale':
        toast.success('Opening sales page');
        let saleUrl = '/sales';
        const urlParams = new URLSearchParams();
        
        // If product query exists, try to find exact product
        if (action.params.productQuery) {
          try {
            const productResponse = await fetch(`/api/products`);
            const allProducts = await productResponse.json();
            
            if (allProducts && allProducts.length > 0) {
              const query = action.params.productQuery.toLowerCase().trim();
              
              // Scoring function for product matching
              const scoreProduct = (product: any) => {
                const name = product.name.toLowerCase();
                const category = product.category.toLowerCase();
                let score = 0;
                
                // Exact match (highest priority)
                if (name === query) return 1000;
                
                // Starts with query
                if (name.startsWith(query)) score += 100;
                
                // Contains all words from query
                const queryWords = query.split(' ');
                const nameWords = name.split(' ');
                const matchedWords = queryWords.filter((qw: string) => 
                  nameWords.some((nw: string) => nw.includes(qw) || qw.includes(nw))
                );
                score += (matchedWords.length / queryWords.length) * 50;
                
                // Contains query as substring
                if (name.includes(query)) score += 30;
                
                // Category match
                if (category.includes(query)) score += 20;
                
                // Word overlap bonus
                const commonWords = nameWords.filter((nw: string) => queryWords.includes(nw));
                score += commonWords.length * 10;
                
                return score;
              };
              
              // Score all products and find best match
              const scoredProducts = allProducts
                .map((p: any) => ({ product: p, score: scoreProduct(p) }))
                .filter((sp: any) => sp.score > 0)
                .sort((a: any, b: any) => b.score - a.score);
              
              if (scoredProducts.length > 0) {
                const bestMatch = scoredProducts[0].product;
                urlParams.set('productId', bestMatch.id);
                toast.success(`Adding ${bestMatch.name} to cart`);
                console.log(`Matched "${query}" to "${bestMatch.name}" (score: ${scoredProducts[0].score})`);
              } else {
                urlParams.set('search', action.params.productQuery);
                toast.success(`Searching for: ${action.params.productQuery}`);
              }
            } else {
              urlParams.set('search', action.params.productQuery);
            }
          } catch (error) {
            console.error('Error fetching product:', error);
            urlParams.set('search', action.params.productQuery);
          }
        }
        
        if (action.params.customerQuery) {
          urlParams.set('customer', action.params.customerQuery);
        }
        
        if (urlParams.toString()) {
          saleUrl += `?${urlParams.toString()}`;
        }
        
        router.push(saleUrl);
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'add_product':
        toast.success('Opening product form');
        router.push('/inventory?action=add');
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      case 'add_customer':
        toast.success('Opening customer form');
        if (action.params.name) {
          router.push(`/customers?action=add&name=${encodeURIComponent(action.params.name)}`);
        } else {
          router.push('/customers?action=add');
        }
        setTimeout(() => setIsOpen(false), 1000);
        break;
      
      default:
        console.log('Executing action:', action);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 flex items-center justify-center z-50 group hover:scale-110 border border-cyan-400/50"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-lg opacity-50 -z-10 animate-pulse"></div>
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 animate-pulse">
              {messages.filter(m => m.role === 'assistant').length}
            </span>
          )}
        </button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 backdrop-blur-2xl bg-gray-900/95 shadow-2xl shadow-cyan-500/20 z-50 flex flex-col border-l-2 border-cyan-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-cyan-600/50 to-purple-600/50 backdrop-blur-xl p-4 rounded-t-2xl flex items-center justify-between border-b border-cyan-500/30">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-50 animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-cyan-200/70 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                  Always here to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-400/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mb-4 shadow-lg shadow-cyan-500/50 animate-pulse relative">
                  <Bot className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  How can I help?
                </h3>
                <p className="text-sm text-cyan-200/70 mb-4">
                  Ask me anything about your business
                </p>
                <div className="space-y-2">
                  {[
                    'Show me low stock items',
                    'Show purchase history for John',
                    'Recommend products for Sarah',
                    'Generate sales report',
                  ].map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(prompt)}
                      className="block w-full px-3 py-2 backdrop-blur-xl bg-white/5 border border-cyan-500/30 rounded-lg text-sm text-cyan-200 hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-100 transition-all text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-cyan-500/50'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/50 animate-pulse'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <span className="text-white text-xs font-bold">You</span>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg backdrop-blur-xl border ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600/80 to-purple-600/80 text-white border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/10 text-cyan-100 border-cyan-500/20 shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-3 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-cyan-500/20">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative p-4 border-t border-cyan-500/30 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 backdrop-blur-xl bg-white/5 border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-cyan-300/50 text-sm transition-all"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
