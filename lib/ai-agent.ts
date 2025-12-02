import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAction {
  action: string;
  params: Record<string, any>;
  navigation?: string;
  message: string;
}

export interface AIResponse {
  actions: AIAction[];
  explanation: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for a POS (Point of Sale) system. You help users navigate and perform tasks like:
- Making sales/processing transactions
- Managing inventory (view stock, add products, update quantities, low stock alerts)
- Managing customers (view history, add customers, search customers)
- Generating reports (sales reports, inventory reports, customer analytics)
- Configuring settings

When a user makes a request, analyze what they want to do and return structured actions in JSON format.

Available actions:
- navigate: { action: "navigate", params: { page: "sales" | "inventory" | "customers" | "reports" | "settings" } }
- create_sale: { action: "create_sale", params: { items: [{productId, quantity}], customerId?: string } }
- add_product: { action: "add_product", params: { name, price, stock, category, ... } }
- update_stock: { action: "update_stock", params: { productId, quantity, type: "in" | "out" | "adjustment" } }
- search_product: { action: "search_product", params: { query: string } }
- search_customer: { action: "search_customer", params: { query: string } }
- add_customer: { action: "add_customer", params: { name, email?, phone?, ... } }
- generate_report: { action: "generate_report", params: { type: "sales" | "inventory" | "customers", period: string } }
- show_low_stock: { action: "show_low_stock", params: {} }

Always respond with valid JSON in this format:
{
  "actions": [
    { "action": "action_name", "params": {...}, "message": "explanation for user" }
  ],
  "explanation": "Overall explanation of what you'll do"
}

Be conversational and helpful. If you need more information, ask clarifying questions.`;

export async function processAIRequest(userMessage: string, context?: any): Promise<AIResponse> {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return processLocalAI(userMessage);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return JSON.parse(response) as AIResponse;
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback to local processing
    return processLocalAI(userMessage);
  }
}

// Local AI processing without OpenAI API
async function processLocalAI(userMessage: string): Promise<AIResponse> {
  const message = userMessage.toLowerCase();
  
  // Low stock check - MUST be before product search to avoid conflicts
  if (message.includes('low stock') || message.includes('running low') || message.includes('out of stock') || message.includes('low inventory')) {
    return {
      actions: [{ action: 'show_low_stock', params: {}, message: 'Showing low stock items' }],
      explanation: "I'll show you all products that are running low on stock so you can reorder them."
    };
  }
  
  // Sales and product search patterns
  if (message.includes('sell') || message.includes('sale for') || message.includes('checkout')) {
    let customerQuery = null;
    let productQuery = null;
    
    // Pattern: "sell to [customer] [product]" or "sell [product] to [customer]"
    const sellToCustomerProduct = message.match(/sell(?:ing)?\s+(?:to|for)\s+([a-z\s]+?)\s+(?:a\s+|an\s+|some\s+)?(.+?)$/i);
    const sellProductToCustomer = message.match(/sell(?:ing)?\s+(?:a\s+|an\s+|some\s+)?(.+?)\s+(?:to|for)\s+([a-z\s]+?)$/i);
    
    if (sellToCustomerProduct) {
      // "sell to Sarah vape pen"
      customerQuery = sellToCustomerProduct[1].trim();
      productQuery = sellToCustomerProduct[2].trim();
    } else if (sellProductToCustomer) {
      // "sell vape pen to Sarah"
      productQuery = sellProductToCustomer[1].trim();
      customerQuery = sellProductToCustomer[2].trim();
    } else {
      // Fallback to original patterns for single entity
      const sellToMatch = message.match(/sell(?:ing)?\s+(?:to|for)\s+([a-z\s]+?)(?:\s+a\s|\s+some\s|$)/i);
      const forCustomerMatch = message.match(/(?:for|to)\s+customer\s+([a-z\s]+?)(?:\s+|$)/i);
      const productMatch = message.match(/sell(?:ing)?\s+(?:a\s+|some\s+)?(.+?)(?:\s+to|\s+for customer|$)/i);
      
      if (sellToMatch) {
        customerQuery = sellToMatch[1].trim();
      } else if (forCustomerMatch) {
        customerQuery = forCustomerMatch[1].trim();
      }
      
      if (productMatch && !sellToMatch) {
        productQuery = productMatch[1].trim();
      }
    }
    
    if (productQuery || customerQuery) {
      return {
        actions: [{ 
          action: 'create_sale', 
          params: { 
            productQuery: productQuery,
            customerQuery: customerQuery
          }, 
          message: 'Opening sales page' + (customerQuery ? ` for ${customerQuery}` : '') + (productQuery ? ` with ${productQuery}` : '')
        }],
        explanation: "I'll help you complete this sale." + (customerQuery ? ` Looking up ${customerQuery}'s profile and recommendations.` : '') + (productQuery ? ` Adding ${productQuery} to cart.` : '')
      };
    }
  }

  // Product search patterns
  if (message.includes('find') || message.includes('search') || message.includes('look for') || message.includes('show me')) {
    const productKeywords = ['battery', 'batteries', 'coil', 'mod', 'tank', 'juice', 'product', 'item'];
    const hasProduct = productKeywords.some(keyword => message.includes(keyword));
    
    if (hasProduct && !message.includes('customer')) {
      // Extract search term
      const searchMatch = message.match(/(?:find|search|look for|show me)\s+(.+?)(?:\s+in|\s+for|$)/i);
      const searchTerm = searchMatch ? searchMatch[1] : message.split(' ').slice(1).join(' ');
      
      return {
        actions: [{ 
          action: 'search_product', 
          params: { query: searchTerm }, 
          message: `Searching for: ${searchTerm}` 
        }],
        explanation: `I'll search for "${searchTerm}" in your inventory and show you the results on the sales page.`
      };
    }
    
    if (message.includes('customer')) {
      const customerMatch = message.match(/(?:find|search|look for|show me)\s+(?:customer\s+)?(.+?)$/i);
      const customerName = customerMatch ? customerMatch[1].replace(/^customer\s+/i, '') : '';
      
      return {
        actions: [{ 
          action: 'search_customer', 
          params: { query: customerName }, 
          message: `Searching for customer: ${customerName}` 
        }],
        explanation: `I'll search for customer "${customerName}" and show you their purchase history and details.`
      };
    }
  }

  // Customer history and purchase patterns
  if (message.includes('history') || message.includes('purchase history') || message.includes('previous purchases') || message.includes('bought before') || message.includes('transaction')) {
    const customerMatch = message.match(/(?:for|of|customer)\s+(.+?)(?:\s+history|\s+transaction|$)/i);
    const customerName = customerMatch ? customerMatch[1].trim() : '';
    
    return {
      actions: [{ 
        action: 'customer_history', 
        params: { customerQuery: customerName }, 
        message: customerName ? `Viewing purchase history for ${customerName}` : 'Opening customer histories'
      }],
      explanation: customerName 
        ? `I'll show you all transactions and purchase history for ${customerName}.`
        : "I'll open the customers page where you can view purchase histories and transaction details."
    };
  }

  // Product recommendations
  if (message.includes('recommend') || message.includes('suggest') || message.includes('what should')) {
    // Check if asking for all customers
    if (message.includes('all customer') || message.includes('every customer') || message.includes('all recommendation')) {
      return {
        actions: [{ 
          action: 'recommend_all', 
          params: {}, 
          message: 'Generating recommendations for all customers' 
        }],
        explanation: "I'll generate personalized product recommendations for all your customers based on their purchase history."
      };
    }
    
    if (message.includes('customer') || message.includes('for')) {
      const customerMatch = message.match(/(?:for|customer)\s+(.+?)$/i);
      const customerName = customerMatch ? customerMatch[1] : '';
      
      return {
        actions: [{ 
          action: 'recommend_products', 
          params: { customerQuery: customerName }, 
          message: 'Generating product recommendations' 
        }],
        explanation: customerName
          ? `I'll analyze ${customerName}'s purchase history and recommend products they might like.`
          : "I'll help you find product recommendations. Let me open the customers page to see purchase patterns."
      };
    }
  }

  // Reports generation
  if (message.includes('report') || message.includes('analytics') || message.includes('sales data')) {
    let reportType = 'sales';
    let period = 'today';
    
    if (message.includes('inventory') || message.includes('stock')) reportType = 'inventory';
    if (message.includes('customer')) reportType = 'customers';
    if (message.includes('product')) reportType = 'products';
    
    if (message.includes('today')) period = 'today';
    else if (message.includes('week') || message.includes('7 day')) period = 'week';
    else if (message.includes('month') || message.includes('30 day')) period = 'month';
    else if (message.includes('year')) period = 'year';
    
    return {
      actions: [{ 
        action: 'generate_report', 
        params: { type: reportType, period: period }, 
        message: `Generating ${reportType} report for ${period}` 
      }],
      explanation: `I'll generate a detailed ${reportType} report for ${period} with charts and insights.`
    };
  }
  
  // Navigation patterns - General inventory
  if (message.includes('inventor') || message.includes('product list') || message.includes('all products')) {
    return {
      actions: [{ action: 'navigate', params: { page: 'inventory' }, message: 'Opening inventory page' }],
      explanation: "I'll take you to the inventory page where you can manage your products and stock levels."
    };
  }
  
  if (message.includes('customer') || message.includes('client')) {
    return {
      actions: [{ action: 'navigate', params: { page: 'customers' }, message: 'Opening customers page' }],
      explanation: "I'll take you to the customers page where you can view purchase histories and manage customer information."
    };
  }
  
  if (message.includes('setting') || message.includes('configure')) {
    return {
      actions: [{ action: 'navigate', params: { page: 'settings' }, message: 'Opening settings page' }],
      explanation: "I'll take you to the settings page where you can configure your business details."
    };
  }

  // Add new product
  if (message.includes('add product') || message.includes('new product') || message.includes('create product')) {
    return {
      actions: [{ action: 'add_product', params: {}, message: 'Opening product creation form' }],
      explanation: "I'll open the inventory page where you can add a new product to your catalog."
    };
  }

  // Add new customer
  if (message.includes('add customer') || message.includes('new customer') || message.includes('create customer')) {
    const nameMatch = message.match(/(?:add|new|create)\s+customer\s+(?:named|called)?\s*(.+?)$/i);
    const customerName = nameMatch ? nameMatch[1] : '';
    
    return {
      actions: [{ 
        action: 'add_customer', 
        params: { name: customerName }, 
        message: 'Opening customer creation form' 
      }],
      explanation: customerName 
        ? `I'll help you add a new customer named "${customerName}".`
        : "I'll open the customers page where you can add a new customer."
    };
  }

  // Default response with helpful suggestions
  return {
    actions: [],
    explanation: `I can help you with:

**Sales & Products:**
• "Sell Battery 18650 to John Smith" - Complete a sale
• "Find Samsung batteries" - Search products
• "Recommend products for Sarah" - Get recommendations

**Inventory Management:**
• "Show me low stock items" - View products running low
• "Show inventory" - View all products
• "Add new product" - Create product entry

**Customer Management:**
• "Show purchase history for John Smith" - View transactions
• "Show me purchase history for customer Sarah" - View all purchases
• "Add new customer named Mike Wilson" - Create customer
• "Search customer Sarah" - Find customer details

**Reports & Analytics:**
• "Generate sales report for this week" - Create reports
• "Product analytics for this month" - View trends

**Navigation:**
• "Show inventory" - Manage products
• "Open customers" - View customer list
• "Go to reports" - See analytics

What would you like to do?`
  };
}

export async function generateChatResponse(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages as any
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Chat generation error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}
