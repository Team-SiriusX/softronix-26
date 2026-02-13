# Softronix Project

A modern, full-stack web application built with Next.js 15+, featuring authentication, file uploads, AI integration capabilities, and a complete API infrastructure.

## 🚀 Tech Stack

### Core Framework
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma 7.4.0** - ORM with custom output directory
- **@prisma/adapter-pg** - PostgreSQL adapter for Prisma

### Authentication
- **Better Auth 1.4.18** - Modern authentication solution
  - Email & Password authentication
  - Email verification
  - Password reset functionality
  - Social providers (Google, GitHub)
  - Session management
  - Role-based access (USER, ADMIN)

### API & Backend
- **Hono 4.11.9** - Fast web framework for API routes
- **Zod 4.3.6** - Schema validation
- **@hono/zod-validator** - Integration between Hono and Zod

### AI & Vector
- **@openrouter/sdk 0.8.0** - OpenRouter API integration for LLM access
- **@upstash/vector 1.2.2** - Vector database for embeddings

### File Uploads
- **UploadThing 7.7.4** - File upload solution
  - Avatar uploads (authenticated & public)
  - Resume uploads (PDF)
  - Message attachments (images, PDFs, videos)

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - UI component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icons
- **next-themes** - Dark mode support
- **class-variance-authority** - Variant management
- **tailwind-merge** - Class merging utility
- **tw-animate-css** - CSS animations

### State Management & Data Fetching
- **TanStack Query 5.90.21** - Server state management
- **React Hook Form 7.71.1** - Form management
- **@hookform/resolvers** - Form validation integration

### Additional Libraries
- **Nodemailer 8.0.1** - Email sending via Resend
- **date-fns 4.1.0** - Date utilities
- **Sonner** - Toast notifications
- **cmdk** - Command menu
- **Recharts 2.15.4** - Charts library
- **Embla Carousel** - Carousel component
- **Vaul** - Drawer component

## 📁 Project Structure

```
softronix-26/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
│       └── 20260126152734_init/
│
├── public/
│   └── logos/                  # Logo assets
│
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── layout.tsx
│   │   │   └── auth/
│   │   │       ├── sign-in/
│   │   │       ├── sign-up/
│   │   │       ├── sign-out/
│   │   │       ├── verify-email/
│   │   │       ├── forget-password/
│   │   │       ├── reset-password/
│   │   │       └── unauthorized/
│   │   │
│   │   ├── (root)/            # Main route group
│   │   │   └── page.tsx       # Landing page
│   │   │
│   │   ├── sample/            # Sample CRUD feature
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── _api/          # Client-side API hooks
│   │   │   │   ├── create-sample.ts
│   │   │   │   ├── get-sample.ts
│   │   │   │   └── delete-sample.ts
│   │   │   └── _components/   # Sample components
│   │   │       ├── create-sample.tsx
│   │   │       └── delete-sample.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── [[...route]]/  # Hono API routes
│   │   │   │   ├── route.ts
│   │   │   │   └── controllers/
│   │   │   │       ├── (base)/
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── sample.ts
│   │   │   │       └── (clerk)/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── [...all]/  # Better Auth handlers
│   │   │   │
│   │   │   └── uploadthing/
│   │   │       ├── core.ts    # Upload configurations
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (40+ components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (and many more)
│   │   │
│   │   └── providers/
│   │       ├── index.tsx
│   │       └── query-provider.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts            # Better Auth configuration
│   │   ├── auth-client.ts     # Client-side auth
│   │   ├── current-user.ts    # User session helper
│   │   ├── db.ts              # Prisma client
│   │   ├── email.ts           # Email service (Resend)
│   │   ├── hono.ts            # Hono client setup
│   │   ├── open-router.ts     # OpenRouter SDK setup
│   │   ├── uploadthing.ts     # UploadThing config
│   │   ├── vector.ts          # Upstash Vector setup
│   │   ├── utils.ts           # Utility functions
│   │   └── generated/
│   │       └── prisma/        # Generated Prisma client
│   │
│   ├── constants/
│   │   ├── query-keys.ts      # TanStack Query keys
│   │   └── store.ts
│   │
│   ├── hooks/
│   │   └── use-mobile.ts      # Mobile detection hook
│   │
│   └── routes.ts              # Route definitions
│
├── components.json            # shadcn/ui config
├── next.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── prisma.config.ts
```

## 🗄️ Database Schema

### User Model
- `id` - Unique identifier (cuid)
- `name` - User's full name
- `email` - Email address (unique)
- `emailVerified` - Email verification status
- `image` - Profile picture URL
- `role` - UserRole (USER | ADMIN)
- `createdAt`, `updatedAt` - Timestamps
- Relations: sessions[], accounts[]

### Session Model
- Session management with token-based authentication
- IP address and user agent tracking
- Expiration handling

### Account Model
- OAuth provider connections
- Access token management
- Refresh token handling
- Password storage (hashed)

### Verification Model
- Email verification tokens
- Password reset tokens

## 🔧 Prerequisites

- **Node.js** 20+ 
- **pnpm** (package manager)
- **PostgreSQL** database
- **Resend** account (for emails)
- **UploadThing** account (for file uploads)
- **Upstash** account (for vector database)
- **OpenRouter** API key (for AI features)
- **Google OAuth** credentials (optional)
- **GitHub OAuth** credentials (optional)

## 🛠️ Setup Instructions

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd softronix-26

# Install dependencies
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/softronix"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_EMAIL="noreply@yourdomain.com"

# UploadThing
UPLOADTHING_TOKEN="your-uploadthing-token"

# Upstash Vector
UPSTASH_VECTOR_REST_URL="https://xxxxx.upstash.io"
UPSTASH_VECTOR_REST_TOKEN="your-upstash-token"

# OpenRouter
OPEN_ROUTER_API_KEY="sk-or-v1-xxxxx"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed database
pnpm prisma db seed

# (Optional) Open Prisma Studio
pnpm prisma studio
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Available Routes

### Public Routes
- `/` - Landing page (new boilerplate version)
- `/api/auth/sign-in` - Sign in page
- `/api/auth/sign-up` - Sign up page

### Protected Routes
- `/sample` - Sample CRUD demo page
- `/api/auth/sign-out` - Sign out handler

### Auth Routes
- `/auth/verify-email` - Email verification
- `/auth/forget-password` - Request password reset
- `/auth/reset-password` - Reset password
- `/auth/unauthorized` - Access denied page

### API Routes

#### Hono API (`/api/`)
- `GET /api/sample?name=John` - Get sample data
- `POST /api/sample` - Create sample item
- `DELETE /api/sample/:id` - Delete sample item

#### Better Auth (`/api/auth/`)
All Better Auth endpoints are automatically handled

#### UploadThing (`/api/uploadthing`)
- `signUpAvatarUploader` - Public avatar upload (4MB max)
- `avatarUploader` - Authenticated avatar upload (4MB max)
- `resumeUploader` - PDF resume upload (8MB max)
- `messageAttachment` - Multi-type attachments (images, PDFs, videos)

## 🎨 UI Components

40+ pre-built shadcn/ui components available:
- Forms & Inputs (Button, Input, Textarea, Select, etc.)
- Data Display (Table, Card, Badge, Avatar, etc.)
- Overlays (Dialog, Sheet, Popover, Tooltip, etc.)
- Navigation (Tabs, Breadcrumb, Pagination, etc.)
- Feedback (Alert, Toast, Progress, Spinner, etc.)
- And many more...

## 🔐 Authentication Features

### Implemented
✅ Email & Password authentication  
✅ Email verification with custom templates  
✅ Password reset flow  
✅ Social login (Google, GitHub)  
✅ Session management  
✅ Role-based access control (USER, ADMIN)  
✅ Protected routes  
✅ Server-side session validation  

### Email Templates
- Professional verification emails
- Password reset emails
- Styled with inline CSS for email client compatibility

## 📤 File Upload Features

### Configured Uploaders
1. **Sign-Up Avatar** (Public)
   - No authentication required
   - 4MB max, images only

2. **Avatar Uploader** (Protected)
   - Requires authentication
   - 4MB max, images only

3. **Resume Uploader** (Protected)
   - PDF files only
   - 8MB max

4. **Message Attachments** (Protected)
   - Images: 8MB max
   - PDFs: 16MB max
   - Videos: 32MB max

## 🤖 AI Integration (Ready)

### OpenRouter SDK
- Pre-configured OpenRouter client
- Access to multiple LLM providers
- Ready for chat, completion, and other AI features

### Vector Database
- Upstash Vector configured
- Ready for embeddings storage
- Semantic search capabilities

## 🎯 What's Currently Working

1. ✅ **Authentication System** - Complete with email verification
2. ✅ **Database** - PostgreSQL with Prisma ORM
3. ✅ **API Infrastructure** - Hono + Zod validation
4. ✅ **File Uploads** - UploadThing with multiple uploaders
5. ✅ **Email Service** - Resend integration
6. ✅ **UI Library** - 40+ shadcn/ui components
7. ✅ **Sample CRUD** - Demo implementation
8. ✅ **State Management** - TanStack Query
9. ✅ **Form Handling** - React Hook Form
10. ✅ **Landing Page** - Clean boilerplate

## 🎯 Development Scripts

```bash
# Development
pnpm dev              # Start dev server

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate   # Run migrations
pnpm prisma studio    # Open database GUI
```

## 🗺️ Planning Your Next Steps

### Immediate Priorities
1. **Environment Setup** - Configure all required environment variables
2. **Database Migration** - Run initial migration and verify connection
3. **Email Testing** - Test verification and reset emails
4. **OAuth Setup** - Configure Google/GitHub if needed
5. **Upload Testing** - Test file upload functionality

### Feature Development Ideas

#### Short Term
- [ ] User profile page
- [ ] User settings/preferences
- [ ] Admin dashboard
- [ ] User management (admin)
- [ ] Email preferences
- [ ] 2FA authentication
- [ ] Activity logs

#### Medium Term
- [ ] Chat interface (using OpenRouter)
- [ ] Document upload & processing
- [ ] AI-powered features
- [ ] Vector search implementation
- [ ] Real-time notifications
- [ ] Team/workspace functionality
- [ ] Billing/subscription system

#### Long Term
- [ ] Multi-tenancy
- [ ] Advanced analytics
- [ ] API rate limiting
- [ ] Webhooks
- [ ] Mobile app
- [ ] Third-party integrations
- [ ] Marketplace/plugins

### Technical Improvements
- [ ] Error boundary implementation
- [ ] Comprehensive error handling
- [ ] Loading states optimization
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Unit & integration tests
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Deploy to production

## 🏗️ Architecture Patterns

### API Architecture
- **Hono** for fast, type-safe API routes
- **Zod** for runtime validation
- **Type-safe client** using Hono's RPC feature
- Centralized error handling

### Data Fetching
- **TanStack Query** for server state
- Custom hooks for API calls
- Optimistic updates
- Automatic refetching

### Form Handling
- **React Hook Form** for performance
- **Zod** for validation
- Type-safe form submissions
- Reusable form components

### Authentication Flow
1. User signs up → Email sent
2. User verifies email → Auto sign-in
3. Session created → Cookie-based
4. Protected routes check session
5. Token refresh handled automatically

## 🔒 Security Features

- ✅ CSRF protection (Better Auth)
- ✅ Session encryption
- ✅ Password hashing
- ✅ Email verification required
- ✅ Rate limiting ready (needs implementation)
- ✅ Type-safe API contracts
- ✅ Environment variable validation (recommended to add)

## 📊 Database Migration Strategy

All migrations are tracked in `prisma/migrations/`

```bash
# Create new migration
pnpm prisma migrate dev --name your_migration_name

# Deploy to production
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset
```

## 🤝 Contributing

When adding new features:

1. **API Routes**: Add to `src/app/api/[[...route]]/controllers/`
2. **Pages**: Add to appropriate route group in `src/app/`
3. **Components**: Add to `src/components/ui/` or feature-specific folder
4. **Hooks**: Add to `src/hooks/` or feature `_api/` folder
5. **Types**: Define in feature or shared types file
6. **Database**: Update `prisma/schema.prisma` and migrate

## 📝 Code Organization Best Practices

- **Route Groups**: Use `(name)` for logical grouping without URL impact
- **Private Folders**: Use `_folder` for non-routable code
- **API Hooks**: Place in feature's `_api/` folder
- **Components**: Place in feature's `_components/` folder
- **Colocation**: Keep related code close to where it's used

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check connection
pnpm prisma db pull

# Verify migrations
pnpm prisma migrate status
```

### Prisma Client Issues
```bash
# Regenerate client
pnpm prisma generate

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

## 📞 Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Better Auth Docs**: https://better-auth.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Hono Docs**: https://hono.dev
- **shadcn/ui**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query

## 📄 License

This project is private and proprietary.

---

**Last Updated**: February 13, 2026  
**Version**: 0.1.0  
**Status**: Development Phase - Infrastructure Complete, Ready for Feature Development
