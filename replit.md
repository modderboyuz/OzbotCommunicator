# replit.md

## Overview

This is a full-stack web application for a construction materials marketplace called "MetalBaza". It's built with React/TypeScript for the frontend, Express.js for the backend, and uses PostgreSQL with Drizzle ORM for data persistence. The application features a Telegram bot integration for user registration and authentication, with a mobile-first design approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system (Untitled UI components)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Build Tool**: Vite with ESBuild for production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Telegram-based authentication via bot integration
- **API Design**: RESTful API with role-based access control
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
The application uses a PostgreSQL database with the following key tables:
- `users` - User profiles with phone, names, telegram info, and roles
- `categories` - Product categories with multi-language support (Uzbek/Russian)
- `products` - Product catalog with pricing, descriptions, and availability
- `orders` - Order management with status tracking
- `order_items` - Order line items linking products to orders
- `ads` - Advertisement banners for promotional content

## Key Components

### Authentication System
- Telegram bot integration for user registration and login
- Role-based access control (client, worker, admin)
- Session-based authentication with middleware protection
- Login modal component for unauthenticated access attempts

### User Interface
- **Mobile-first design** with bottom navigation on mobile devices
- **Responsive layouts** that work across desktop and mobile
- **Category navigation** with icon-based filtering
- **Product grid** with search and filtering capabilities
- **Admin dashboard** for content management (admin users only)

### Telegram Bot Integration
- Built with Grammy framework and conversations plugin
- Handles user registration workflow (phone, name collection)
- Stores user data in PostgreSQL database
- Links Telegram accounts to web application authentication

### Product Management
- Category-based product organization
- Multi-language support (Uzbek/Russian)
- Image handling with fallback placeholders
- Rental vs purchase product types
- Inventory availability tracking

## Data Flow

### User Registration Flow
1. User interacts with Telegram bot via `/register` command
2. Bot collects phone number, first name, last name
3. User data stored in PostgreSQL `users` table
4. Role assignment based on phone number lookup
5. Telegram ID linked to user record

### Authentication Flow
1. User attempts to access protected route
2. System checks for stored `telegram_id` in localStorage
3. Backend validates user exists and returns user data
4. Client-side auth context updates with user information
5. Route access granted based on user role

### Product Browsing Flow
1. Categories loaded from `/api/categories` endpoint
2. User selects category or searches products
3. Products filtered by category/search via `/api/products`
4. Product cards rendered with pricing and availability
5. Add to cart functionality (requires authentication)

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL (@neondatabase/serverless)
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Telegram**: Grammy bot framework with conversations
- **UI**: Radix UI primitives, Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **State**: React Query for server state management

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **ESBuild**: Production bundling for backend
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Development
- Uses Vite dev server for frontend hot reloading
- Express server with TypeScript compilation via tsx
- Database migrations managed through Drizzle Kit
- Environment variables for database and Telegram bot tokens

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with ESBuild as single Node.js file
- Database schema pushed via `drizzle-kit push`
- Serves static files from Express in production

### Configuration
- Environment variables required: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`
- Database migrations stored in `/migrations` directory
- Shared schema definitions in `/shared/schema.ts`
- TypeScript path mapping for clean imports

The application is designed to be deployed on platforms like Replit, Railway, or similar Node.js hosting services with PostgreSQL database support.
