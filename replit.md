# Intellect WealthForce - Replit Configuration

## Overview

Intellect WealthForce is a sophisticated wealth management platform designed for Relationship Managers (RMs) at Ujjivan Small Finance Bank. The platform provides intelligent workflow tools, advanced client engagement capabilities, comprehensive portfolio management, and business intelligence features to help RMs effectively manage client relationships and drive business growth.

The application serves as a complete CRM and wealth management solution with features including client portfolio tracking, prospect pipeline management, appointment scheduling, task management, transaction history, and detailed analytics dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- Hash-based routing for navigation (custom implementation to avoid page reloads)
- TanStack Query v5 for server state management and caching
- Tailwind CSS for utility-first styling with custom design tokens
- shadcn/ui component library built on Radix UI primitives

**Key Design Patterns:**
- Context providers for cross-cutting concerns (Auth, Navigation, Accessibility, Theme)
- Custom hooks pattern for reusable logic (useMediaQuery, useIsMobile, useToast)
- Offline-first architecture with localStorage caching for critical data
- Mobile-responsive design with dedicated mobile components (BottomNavigation, SwipeableView)
- Privacy-aware UI with overlay when app loses focus
- Accessibility features including high-contrast mode and screen reader optimizations

**State Management Strategy:**
- Server state managed via TanStack Query with configurable cache times
- Client state managed through React hooks and context providers
- Session state persisted in cookies via express-session
- Offline data cached in localStorage with expiration timestamps

### Backend Architecture

**Technology Stack:**
- Express.js with TypeScript for type-safe API development
- Session-based authentication using Passport.js
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via Neon serverless)
- Custom storage abstraction layer for data access

**API Structure:**
- RESTful API design with resource-based endpoints
- Authentication middleware for protected routes
- Dedicated routers for complex features (communications, portfolio reports)
- Error handling middleware for consistent error responses
- Server-side rendering support for PDF generation (Puppeteer)

**Data Access Layer:**
- Storage abstraction (storage.ts) provides CRUD operations for all entities
- Drizzle ORM queries with type inference from schema
- Connection pooling for database reliability
- WebSocket configuration for Neon serverless compatibility

**Authentication & Authorization:**
- Session-based authentication with secure HTTP-only cookies
- User roles (relationship_manager, admin)
- Middleware-based route protection
- Session store using in-memory store (MemoryStore) for development

### Database Schema Design

**Core Entities:**
- **Users:** Authentication and profile information for RMs
- **Clients:** Comprehensive client profiles with personal, professional, KYC, and financial data
- **Prospects:** Sales pipeline tracking with stages and conversion probabilities
- **Transactions:** Financial transaction history with product categorization
- **Appointments:** Calendar and scheduling system
- **Tasks:** Action item tracking with client/prospect associations
- **Communications:** Interaction logging with sentiment analysis and follow-up tracking
- **Portfolio Alerts:** Risk and performance notifications
- **Performance Metrics:** RM performance tracking against targets
- **Products:** Product catalog with detailed specifications and compliance data

**Relationships:**
- One-to-many: Users to Clients, Users to Prospects, Clients to Transactions
- Foreign key constraints with cascade behavior for data integrity
- Indexed columns for query performance (assignedTo, clientId, etc.)

**Data Types:**
- Temporal data using PostgreSQL timestamp
- Numerical data using integer and doublePrecision for financial calculations
- JSON fields (jsonb) for flexible schema elements (tags, metadata)
- Text fields for content with appropriate length constraints

## External Dependencies

### Database & Infrastructure
- **Neon PostgreSQL:** Serverless PostgreSQL database with WebSocket support
- **Drizzle ORM:** Type-safe database toolkit and query builder
- **WebSocket (ws):** Required for Neon serverless connectivity

### UI Component Libraries
- **Radix UI:** Comprehensive collection of accessible primitives (@radix-ui/react-*)
- **shadcn/ui:** Pre-built components using Radix UI and Tailwind CSS
- **Recharts:** Declarative charting library for data visualization
- **Lucide React:** Icon library with consistent design

### State & Data Management
- **TanStack Query v5:** Powerful async state management for server data
- **React Hook Form:** Performant form handling with validation
- **Zod:** TypeScript-first schema validation
- **date-fns:** Modern date utility library

### Development Tools
- **Vite:** Next-generation frontend build tool
- **TypeScript:** Type-safe JavaScript development
- **ESBuild:** Fast JavaScript bundler for production builds
- **Drizzle Kit:** Database migration and schema management

### Authentication & Session Management
- **express-session:** Session middleware for Express
- **memorystore:** Memory-based session store (development)
- **Passport.js:** Authentication middleware (inferred from architecture)

### Utilities & Helpers
- **@faker-js/faker:** Generate realistic test data for development
- **class-variance-authority:** Utility for creating variant-based components
- **clsx & tailwind-merge:** Utility for conditional CSS class management
- **nanoid:** Secure unique ID generator

### Email & Communications
- **@sendgrid/mail:** Email delivery service integration

### PDF Generation
- **Puppeteer:** Headless browser for server-side PDF generation

### Build & Optimization
- **Autoprefixer & PostCSS:** CSS processing and vendor prefixing
- **@replit/vite-plugin-runtime-error-modal:** Development error handling
- **@replit/vite-plugin-cartographer:** Replit-specific development tools

### Mobile & Touch Interactions
- **@dnd-kit/core & @dnd-kit/sortable:** Drag-and-drop functionality for interactive UIs