# Chi Boards - Mechanical Keyboard Product Catalog

A modern e-commerce product catalog for mechanical keyboards and accessories, built with Next.js 15, TypeScript, and Tailwind CSS. This application features real-time inventory management through Google Sheets API integration and dynamic product information from Contentful CMS.

## ✨ Features

- **🛍️ Product Catalog**: Browse mechanical keyboards, switches, keycaps, and accessories
- **📊 Real-time Inventory**: Live stock tracking and pricing via Google Sheets API
- **🎨 Modern UI**: Responsive design with smooth animations and hover effects
- **🔍 Advanced Filtering**: Filter by category, budget, brand, and availability
- **🛒 Order Modal**: Multi-step ordering process with payment options
- **💳 Payment Integration**: Support for GCash, BPI, and SeaBank with QR codes
- **📱 Mobile Optimized**: Fully responsive design for all devices
- **⚡ Performance**: Optimized images, lazy loading, and static generation
- **🔄 Dynamic Updates**: Real-time content updates via webhooks

## 🚀 Tech Stack

- **Frontend**: Next.js 15.3.4, React, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **CMS**: Contentful for product data and images
- **Database**: Google Sheets for inventory and pricing
- **Deployment**: Vercel with environment variable management
- **UI Components**: Custom components with shadcn/ui foundation

## 📦 Project Structure

```
chi-boards-catalog/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── products/             # Product data endpoints
│   │   ├── revalidate/           # Webhook revalidation
│   │   └── test-google-sheets/   # Google Sheets integration
│   ├── catalog/                  # Product catalog page
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── custom/                   # Project-specific components
│   │   ├── header.tsx           # Navigation and search
│   │   ├── product-card.tsx     # Product display cards
│   │   ├── filter-panel.tsx     # Filtering interface
│   │   └── footer.tsx           # Footer component
│   └── ui/                      # Reusable UI components
├── lib/                         # Utilities and configurations
│   ├── contentful/              # Contentful CMS client
│   ├── googlesheets/            # Google Sheets API client
│   ├── types.ts                 # TypeScript definitions
│   └── utils.ts                 # Helper functions
├── public/                      # Static assets
│   ├── qr_*.jpg                 # Payment QR codes
│   └── *.png                    # Brand images
└── vercel.json                  # Vercel deployment config
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Contentful account
- Google Cloud account with Sheets API enabled
- Google Sheets for inventory management

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yashiyoshi/chi-boards-catalog.git
cd chi-boards-catalog
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# Contentful CMS
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token
CONTENTFUL_PREVIEW_SECRET=your_preview_secret
CONTENTFUL_REVALIDATE_SECRET=your_revalidate_secret

# Google Sheets API
GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
GOOGLE_SHEETS_SHEET_ID=your_sheet_id
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📋 Configuration

### Contentful Setup

1. Create a Contentful space
2. Set up content models for:
   - **Product**: Product information, images, categories
   - **ProductCategory**: Category definitions
   - **Brand**: Brand information

3. Key fields for Product model:
   - `productName` (Text)
   - `productCategory` (Reference)
   - `budget` (Text)
   - `mainImage` (Media)
   - `isBestSeller` (Boolean)
   - `isOnSale` (Boolean)
   - `switchType` (Text, for switches)
   - `keyboardProfile` (Text, for keycaps)

### Google Sheets Setup

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download credentials
4. Share your Google Sheet with the service account email
5. Structure your sheet with columns:
   - Product Name
   - Stock
   - Price
   - In Stock (TRUE/FALSE)

## 🎨 Key Features

### Product Catalog
- Dynamic product grid with filtering
- Real-time stock and pricing from Google Sheets
- Category-based filtering (Keyboards, Switches, Keycaps, etc.)
- Budget range filtering
- Search functionality
- Best seller and sale tags

### Order Processing
- Multi-step modal interface
- Customer information collection
- Payment method selection
- QR code integration for Philippine payment systems
- Order summary and confirmation

### Performance Optimizations
- Image optimization with Next.js Image component
- Lazy loading for better initial load times
- Static generation for fast page loads
- Efficient caching strategies

### Mobile Experience
- Fully responsive design
- Touch-optimized interactions
- Mobile-specific UI adaptations
- Optimized images for different screen sizes

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy with Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Set up webhooks**
   - Configure Contentful webhooks for content updates
   - Set up revalidation endpoints for real-time updates

### Environment Variables for Production

Ensure all environment variables are configured in your Vercel dashboard:
- Contentful credentials
- Google Sheets API credentials  
- Webhook secrets

## 🔧 API Endpoints

- `/api/products` - Get all products with Google Sheets data
- `/api/products/basic` - Get basic product information
- `/api/products/stock` - Get stock information only
- `/api/revalidate` - Webhook endpoint for content updates
- `/api/test-google-sheets` - Test Google Sheets connection

## 🎯 Roadmap

- [ ] Shopping cart functionality
- [ ] Inventory management dashboard
- [ ] Product reviews system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Contentful for the headless CMS
- Tailwind CSS for the utility-first styling
- Vercel for seamless deployment
