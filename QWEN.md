# Project Context: Series Tracker (Sennit)

## Project Overview
This is a Next.js 15+ application called "Sennit" that serves as a TV series tracking platform. Users can discover trending shows, track their viewing progress, and maintain a watchlist. The application uses a modern tech stack with TypeScript, Prisma ORM, and PostgreSQL for data persistence.

## Key Technologies
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials and Google providers
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI primitives with custom components
- **Fonts**: Josefin Sans via next/font/google

## Project Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── (root)/          # Main application routes
│   │   ├── (private)/   # Authenticated routes (dashboard, watchlist)
│   │   └── shows/       # TV shows discovery pages
│   └── api/             # API routes
├── components/          # Shared UI components
├── lib/                 # Utility libraries (Prisma client)
├── data/                # Data fetching utilities
├── types/               # TypeScript type definitions
├── auth.ts              # NextAuth configuration
prisma/
├── schema.prisma        # Database schema
```

## Database Schema
The application uses Prisma with a PostgreSQL database containing:
- User model with authentication details
- Series model for TV shows
- WatchedEpisode model for tracking viewing progress
- Account and Session models for NextAuth

## Authentication
The app supports two authentication methods:
1. Credentials (email/password with bcrypt hashing)
2. Google OAuth provider
Authentication is handled by NextAuth.js with Prisma adapter.

## Key Features
1. **Public Pages**:
   - Home page with hero section and trending shows
   - TV shows discovery with filtering capabilities
   - Individual show pages with details

2. **Authenticated Features**:
   - Dashboard with personalized content
   - Watchlist management
   - Episode tracking
   - Viewing progress visualization

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build the application (includes Prisma client generation)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables
The application requires several environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `AUTH_SECRET` - NextAuth secret

## Development Notes
- The application follows Next.js App Router conventions
- Uses React Server Components where appropriate
- Implements Suspense for loading states
- Responsive design with Tailwind CSS
- TypeScript strict mode enabled