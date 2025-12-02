# POSX - AI-Powered Point of Sale System

<div align="center">

![POSX Logo](https://img.shields.io/badge/POSX-AI%20Powered%20POS-blue?style=for-the-badge)

**An intelligent, conversational POS system that uses AI to guide users through sales, inventory management, customer tracking, and reporting.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai)](https://openai.com/)

</div>

---

## 🌟 Features

### 🤖 AI-Powered Navigation
- **Conversational Interface**: Simply type what you want to do in natural language
- **Intelligent Agent**: AI understands requests and navigates through the system automatically
- **Context-Aware**: The AI maintains context and provides relevant suggestions

### 💰 Sales Management
- Quick product search and selection
- Real-time inventory checking
- Multiple payment methods (Cash, Card, Digital Wallet)
- Customer association with transactions
- Automatic stock updates

### 📦 Inventory Management
- Real-time stock tracking
- Low stock alerts
- Product categorization
- SKU and barcode support
- Bulk product management

### 👥 Customer Management
- Customer profiles with contact information
- Purchase history tracking
- Total spent and visit count analytics
- Customer search and filtering

### 📊 Reports & Analytics
- Sales overview with charts
- Top-selling products analysis
- Revenue trends (daily, weekly, monthly)
- Low stock inventory alerts
- Customer analytics

### ⚙️ Customizable Settings
- **Business Types**: Retail, Restaurant, or Shop
- Configurable tax rates
- Currency selection
- Receipt customization
- AI assistant preferences

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (for AI features)

### Installation

1. **Clone or navigate to the project directory**:
   ```powershell
   cd "c:\Users\levia\Desktop\Programming Folder\POSX"
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Set up environment variables**:
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Edit the `.env` file** and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL="file:./dev.db"
   BUSINESS_TYPE=retail
   BUSINESS_NAME="My Store"
   ```

5. **Initialize the database**:
   ```powershell
   npx prisma db push
   ```

6. **Run the development server**:
   ```powershell
   npm run dev
   ```

7. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🎯 How to Use

### AI Assistant Examples

The AI assistant on the home page can understand natural language commands. Try asking:

- **Sales**: 
  - "Start a new sale"
  - "Process a transaction"
  - "Show me the sales page"

- **Inventory**:
  - "Show me products running low on stock"
  - "Display inventory"
  - "Add a new product called Laptop for $999"

- **Customers**:
  - "Show me customer list"
  - "Add a new customer named John Smith"
  - "Find customer Sarah"

- **Reports**:
  - "Generate sales report for today"
  - "Show me top selling products"
  - "What were the total sales yesterday?"

### Manual Navigation

You can also use the navigation buttons at the top:
- **Sales**: Process new transactions
- **Inventory**: Manage products and stock
- **Customers**: View and manage customer database
- **Reports**: View analytics and generate reports
- **Settings**: Configure business settings

---

## 🏗️ Project Structure

```
POSX/
├── app/
│   ├── api/              # API routes
│   │   ├── ai/           # AI agent endpoints
│   │   ├── products/     # Product CRUD operations
│   │   ├── customers/    # Customer management
│   │   └── sales/        # Sales transactions
│   ├── sales/            # Sales page
│   ├── inventory/        # Inventory management page
│   ├── customers/        # Customer management page
│   ├── reports/          # Analytics and reports page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # AI home page
│   └── globals.css       # Global styles
├── lib/
│   ├── ai-agent.ts       # AI processing logic
│   ├── prisma.ts         # Database client
│   └── store.ts          # State management
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🗄️ Database Schema

The system uses **SQLite** with **Prisma ORM** and includes:

- **Products**: SKU, pricing, stock levels, categories
- **Sales**: Transactions with line items
- **Customers**: Contact info, purchase history
- **Stock Movements**: Inventory tracking
- **Business Config**: System settings

---

## 🎨 Customization

### Business Types

The system can be configured for different business types:

1. **Retail Store**: Full inventory tracking, multiple categories
2. **Restaurant**: Table management features (extendable)
3. **Small Shop**: Simplified interface for boutiques

Configure in Settings or `.env` file:
```env
BUSINESS_TYPE=retail  # or restaurant, shop
```

### Styling

The UI uses **Tailwind CSS** with a modern gradient theme. Customize colors in:
- `tailwind.config.js`: Theme configuration
- `app/globals.css`: Global styles

---

## 🔒 Security Notes

- **Never commit** your `.env` file with real API keys
- Use `.env.example` as a template
- Store sensitive data in environment variables
- Consider implementing user authentication for production use

---

## 📝 API Endpoints

### AI Agent
- `POST /api/ai` - Process natural language requests

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer with purchase history

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create new sale (auto-updates inventory)

---

## 🚀 Deployment

### Production Build

```powershell
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note**: For production, consider using a more robust database like PostgreSQL instead of SQLite.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: Zustand
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 🤝 Contributing

This is a custom POS system. Feel free to extend it with:
- User authentication
- Multi-store support
- Advanced reporting
- Payment gateway integration
- Mobile app
- Receipt printing
- Barcode scanning

---

## 📄 License

This project is provided as-is for your use. Customize and extend as needed for your business.

---

## 🆘 Troubleshooting

### AI Not Working?
- Ensure your OpenAI API key is set correctly in `.env`
- Check that you have API credits available

### Database Issues?
```powershell
# Reset database
Remove-Item dev.db
npx prisma db push
```

### Port Already in Use?
```powershell
# Use a different port
$env:PORT=3001; npm run dev
```

---

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure dependencies are installed correctly

---

<div align="center">

**Built with ❤️ using Next.js and AI**

[Report Bug](https://github.com) · [Request Feature](https://github.com)

</div>
