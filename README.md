# Scent Discovery Vault 🌸

A modern, luxury e-commerce platform for discovering and purchasing premium perfumes and fragrance discovery sets. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations and micro-interactions
- **Discovery Sets**: Interactive fragrance discovery set builder with customizable options
- **Brand Showcase**: Animated brand logos marquee featuring luxury perfume houses
- **Product Catalog**: Comprehensive product browsing with filtering and search capabilities
- **Optimized Performance**: WebP image optimization and lazy loading
- **Mobile-First**: Fully responsive design optimized for all devices
- **Admin Panel**: Product and inventory management system
- **Database Integration**: Supabase backend with real-time updates

## 🚀 Quick Start

### System Prerequisites

Before installing the application, ensure you have the following installed on your system:

#### Required Software
- **Node.js**: Version 18.x or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm**: Comes with Node.js (or use yarn/pnpm)
  - Verify installation: `npm --version`
- **Git**: For cloning the repository
  - Download from [git-scm.com](https://git-scm.com/)

#### External Services
- **Supabase Account**: For database and backend services
  - Sign up at [supabase.com](https://supabase.com/)
  - Create a new project
  - Note your project URL and anon key

#### Development Tools (Optional but recommended)
- **VS Code**: With recommended extensions
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/startduck/scent-discovery-vault.git
   cd scent-discovery-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_NAME=Scent Discovery Vault
   VITE_API_URL=https://your-app-domain.com
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm run preview
   ```

## 🌐 Deployment

### Replit Deployment

1. **Import to Replit**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" > "Import from GitHub"
   - Enter repository URL: `https://github.com/startduck/scent-discovery-vault`

2. **Environment Variables**
   - In your Repl, go to "Secrets" tab
   - Add the following secrets:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_APP_NAME=Scent Discovery Vault
     VITE_API_URL=https://your-repl-url.repl.co
     ```

3. **Run the Application**
   - Click "Run" button
   - The app will build and start automatically
   - Your app will be available at `https://your-repl-name.your-username.repl.co`

### Other Deployment Options

- **Vercel**: `vercel --prod`
- **Netlify**: Connect GitHub repo and deploy
- **Railway**: `railway login && railway deploy`

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI Components
- **Animations**: Framer Motion, Custom CSS animations
- **State Management**: React Query, Zustand
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router Dom
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **Image Optimization**: WebP format with fallbacks

## 📦 Dependencies Overview

### Core Dependencies
- **React 18.3.1**: Main UI library
- **TypeScript 5.5.3**: Type safety and development experience
- **Vite 5.4.10**: Fast build tool and dev server
- **Tailwind CSS 3.4.11**: Utility-first CSS framework

### UI Component Libraries
- **Radix UI**: Headless, accessible UI components
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog
  - Dropdown Menu, Hover Card, Navigation Menu, Popover
  - Progress, Radio Group, Select, Slider, Switch, Tabs
  - Toast, Toggle, Tooltip components
- **Lucide React 0.462.0**: Beautiful, customizable icons
- **Sonner 1.5.0**: Toast notifications

### State Management & Data
- **TanStack React Query 5.56.2**: Server state management
- **Supabase JS 2.49.9**: Database client and authentication
- **React Hook Form 7.53.0**: Form handling and validation
- **Zod 3.23.8**: Schema validation

### Routing & Navigation
- **React Router Dom 7.6.2**: Client-side routing

### Styling & Animation
- **Class Variance Authority 0.7.1**: Component variant management
- **clsx 2.1.1**: Conditional className utility
- **Tailwind Merge 2.5.2**: Tailwind class merging
- **Tailwindcss Animate 1.0.7**: Animation utilities

### Additional Features
- **Embla Carousel React 8.3.0**: Carousel/slider component
- **React Helmet Async 2.0.5**: Document head management
- **Date-fns 3.6.0**: Date utility library
- **Recharts 2.12.7**: Charts and data visualization
- **Input OTP 1.2.4**: OTP input component
- **Vaul 0.9.3**: Drawer/modal component

### Development Dependencies
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Autoprefixer**: CSS vendor prefixing
- **PostCSS**: CSS processing
- **ts-node**: TypeScript execution for scripts
- **Dotenv**: Environment variable management

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin panel components
│   ├── discovery/       # Discovery set builder
│   └── ui/              # Base UI components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── data/                # Static data and configurations
├── integrations/        # External service integrations
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up the database schema (tables for products, categories, etc.)
3. Configure authentication (optional)
4. Get your project URL and anon key
5. Update environment variables

### Image Optimization

The app uses WebP format for optimal performance:
- Brand logos: 200x100px WebP
- Product images: 400x400px WebP
- Hero images: 1200x600px WebP

## 🚀 Performance Features

- **Code Splitting**: Lazy-loaded routes and components
- **Image Optimization**: WebP format with lazy loading
- **Bundle Optimization**: Tree-shaking and minification
- **Caching**: Browser caching strategies
- **Responsive Images**: Multiple breakpoints supported

## 🎨 Design System

- **Colors**: Modern gradient palette with luxury feel
- **Typography**: Inter font family with custom weights
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions and micro-interactions
- **Components**: Reusable design system components

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Installation Troubleshooting

### Common Issues and Solutions

#### Node.js Version Issues
```bash
# Check your Node.js version
node --version

# If using nvm (recommended for version management)
nvm install 18
nvm use 18
```

#### Package Installation Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Alternative: Use yarn if npm fails
npm install -g yarn
yarn install
```

#### Port Already in Use
If port 8080/8081/8082 is in use:
```bash
# Kill processes using the port (macOS/Linux)
lsof -ti:8080 | xargs kill -9

# Or let Vite find an available port automatically (default behavior)
npm run dev
```

#### TypeScript Compilation Errors
```bash
# Verify TypeScript installation
npx tsc --version

# Clean build cache
rm -rf dist/
npm run build
```

#### Supabase Connection Issues
- Verify your environment variables in `.env`
- Check your Supabase project is active
- Ensure your API keys are correct
- Check network connectivity to Supabase

#### ESLint/Prettier Conflicts
```bash
# Fix linting issues automatically
npm run lint

# If using VS Code, install recommended extensions
# Check .vscode/settings.json for proper configuration
```

### Environment Variables Required
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Scent Discovery Vault
VITE_API_URL=http://localhost:8082
```

### Memory Issues (Development)
If you encounter memory issues during development:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Your deployed app URL]
- **GitHub**: [Repository URL]
- **Issues**: [Report bugs and request features]

---

Built with ❤️ for luxury fragrance enthusiasts
