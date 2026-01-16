# SmartEnergy

## Overview

SmartEnergy is a web application that predicts total power consumption (Watts/kW) based on appliance toggles and optional weather inputs. It features a Gemini-powered AI chatbot for energy-saving advice, an analytics dashboard for visualizing consumption trends, and a futuristic dark-themed UI with 3D animations.

The app allows users to toggle household appliances on/off, input environmental factors (temperature, humidity, occupancy, etc.), and receive real-time energy consumption predictions with breakdowns by appliance category.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for client-side routing with lazy-loaded pages
- **State Management**: Zustand with persistence middleware for local UI state; React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark modes)
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: GSAP for UI transitions, Three.js for 3D hero animations (EnergyOrb component)
- **Charts**: Recharts for dashboard visualizations

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints under `/api/*`
- **Build System**: Custom build script using esbuild for server bundling and Vite for client
- **Development**: Vite dev server with HMR proxied through Express

### Key API Endpoints
- `GET /api/features` - Returns appliance configuration
- `POST /api/predict` - Calculates energy prediction based on appliance states and weather inputs
- `POST /api/chat` - Streams AI responses via Gemini API

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM (schema in `shared/schema.ts`)
- **Client Persistence**: Zustand persist middleware stores prediction history, chat messages, and preferences in localStorage
- **In-Memory Storage**: MemStorage class for user session data (can be swapped for database storage)

### Authentication
- User schema defined but authentication not fully implemented
- Session management prepared with connect-pg-simple

## External Dependencies

### AI/ML Integration
- **Google Gemini AI** (`@google/genai`): Powers the chatbot with streaming responses for energy-related questions and advice

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management
- **drizzle-kit**: Database migrations and schema push

### Frontend Libraries
- **Three.js**: 3D graphics for the animated energy orb on the home page
- **GSAP**: Animation library for smooth UI transitions
- **Recharts**: Charting library for dashboard analytics
- **Framer Motion**: Additional animation support for header/navigation

### Static Configuration Files
- `features.json`: Appliance definitions with keys, display names, icons, default wattages, and categories
- `wattageConfig.json`: Baseline watts, appliance wattages, and weather factor multipliers for prediction calculations
