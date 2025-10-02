# 🚀 GitAid - AI-Powered Git Management Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Google-4285F4?style=for-the-badge&logo=google&logoColor=white)

**An intelligent GitHub repository manager with AI-powered commit analysis and semantic search capabilities**

[🌟 Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🧪 Testing](#-testing) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ Features

### 🤖 **AI-Powered Commit Analysis**
- **Smart Summarization**: Automatic commit message analysis using Google Gemini AI
- **Code Diff Analysis**: Understands actual code changes for better insights
- **Intelligent Fallbacks**: Pattern-based analysis when AI is unavailable
- **Multi-language Support**: Works with any programming language

### 🔍 **Advanced Search & Discovery**
- **Semantic Search**: Vector-based search using pgvector and embeddings
- **RAG Implementation**: Retrieval-Augmented Generation for intelligent queries
- **Repository Indexing**: Automatic code indexing for better searchability
- **Context-Aware Results**: Understands code context and relationships

### 🏗️ **Enterprise-Grade Architecture**
- **Next.js 15**: Latest React framework with App Router
- **Type Safety**: Full TypeScript implementation
- **Database**: PostgreSQL with Prisma ORM and pgvector extension
- **Authentication**: Secure user management with Clerk
- **Real-time Updates**: tRPC for type-safe API communication

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Radix UI components with shadcn/ui
- **Dark/Light Mode**: Theme switching support
- **Interactive Elements**: Rich data visualizations with Recharts

---

## 🏃‍♂️ Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ with pgvector extension
- **Git** for version control
- **Google Gemini API Key** (optional - fallbacks available)
- **GitHub Personal Access Token**

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/git-gud-manager.git
   cd git-gud-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with your actual values.

4. **Set up the database**
   ```bash
   # Install pgvector extension in PostgreSQL
   npm run db:setup-vector
   
   # Run migrations
   npm run db:migrate
   
   # Generate Prisma client
   npm run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` and start exploring!

---

## 📖 Documentation

### 🏗️ **Architecture Overview**

```
git-gud-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Core business logic
│   │   ├── ai.ts              # AI integration (Gemini)
│   │   ├── github.ts          # GitHub API integration
│   │   ├── embeddings.ts      # Vector embeddings
│   │   ├── rag-pipeline.ts    # RAG implementation
│   │   └── database.ts        # Database operations
│   ├── server/                # tRPC API routes
│   └── styles/                # Global styles
├── prisma/                    # Database schema & migrations
├── tests/                     # Comprehensive test suite
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── utilities/             # Database utilities
│   └── verification/          # System verification
└── public/                    # Static assets
```

### 🔑 **Core Technologies**

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | Full-stack React framework | 15.2.3 |
| **TypeScript** | Type-safe development | 5.8.2 |
| **Prisma** | Database ORM & migrations | 6.5.0 |
| **PostgreSQL** | Primary database | 14+ |
| **pgvector** | Vector similarity search | Latest |
| **Clerk** | Authentication & user management | 6.31.8 |
| **Gemini AI** | AI-powered analysis | 0.24.1 |
| **tRPC** | Type-safe API layer | 11.0.0 |
| **Tailwind CSS** | Utility-first styling | 4.0.15 |
| **Radix UI** | Accessible component primitives | Latest |

---

## 🧪 Testing

### **Test Structure**
```bash
tests/
├── unit/                  # 26 unit tests
├── integration/           # Integration tests
├── utilities/             # Database utilities
└── verification/          # System verification
```

### **Running Tests**

```bash
# Run all tests
npm run test:all

# Specific test categories
npm run test:ai          # AI functionality tests
npm run test:database    # Database connection tests

# Utility commands
npm run utility:check-summaries    # Check AI summary status
npm run utility:view-db           # View database contents
npm run utility:clear-summaries   # Clear AI summaries

# Development utilities
npm run db:studio        # Open Prisma Studio
npm run verify:implementation     # System verification
```

### **Test Coverage**
- ✅ **AI Integration**: Gemini API connection and fallbacks
- ✅ **Database Operations**: CRUD operations and migrations
- ✅ **GitHub Integration**: Repository loading and commit analysis
- ✅ **RAG Pipeline**: Vector search and embeddings
- ✅ **Authentication**: User management and permissions
- ✅ **API Endpoints**: All tRPC procedures

---

## 🚀 Deployment

### **Production Deployment**

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your platform**
   - **Vercel**: Connect your GitHub repository
   - **Railway**: Use the provided `railway.toml`
   - **Docker**: Dockerfile included for containerization

3. **Set up production database**
   - Configure PostgreSQL with pgvector extension
   - Run production migrations: `npm run db:migrate`

4. **Environment Configuration**
   Ensure all production environment variables are set securely.

### **Docker Deployment**

```bash
# Build the image
docker build -t git-gud-manager .

# Run with environment variables
docker run -p 3000:3000 --env-file .env git-gud-manager
```

---

## 🛠️ Development

### **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run typecheck` | Run TypeScript checks |
| `npm run format:check` | Check code formatting |
| `npm run format:write` | Format code with Prettier |

### **Development Workflow**

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow TypeScript best practices
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test:all
   npm run typecheck
   npm run lint
   ```

4. **Submit a pull request**
   - Provide clear description
   - Reference related issues
   - Ensure all tests pass

---

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ❌ |
| `GITHUB_TOKEN` | GitHub personal access token | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application URL | ✅ |

### **Database Setup**

1. **Install pgvector extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run setup script**
   ```bash
   psql -d your_database -f setup-pgvector.sql
   ```

3. **Verify installation**
   ```bash
   npm run verify:pgvector
   ```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### **Code of Conduct**
This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

### **Issues & Discussions**
- 🐛 **Bug Reports**: Use GitHub Issues
- 💡 **Feature Requests**: GitHub Discussions
- ❓ **Questions**: GitHub Discussions Q&A

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent commit analysis
- **Vercel** for Next.js framework and deployment platform
- **Clerk** for authentication infrastructure
- **Prisma** for database tooling
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling

---

## 📞 Support

- 📧 **Email**: support@git-gud-manager.com
- 💬 **Discord**: [Join our community](https://discord.gg/git-gud-manager)
- 📖 **Documentation**: [docs.git-gud-manager.com](https://docs.git-gud-manager.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/git-gud-manager/issues)

---

<div align="center">

**Made with ❤️ by developers, for developers**

⭐ **Star this repo if you find it helpful!** ⭐

</div>
