# Finix AI Agent

A modern authentication and dashboard application powered by Supabase, Google OAuth, React, Vite, shadcn-ui, and Tailwind CSS.

## Features

- **Google OAuth Authentication** via Supabase
- **User Dashboard** with profile and session info
- **Responsive UI** with shadcn-ui and Tailwind CSS
- **Beautiful gradients and glassmorphism effects**
- **TypeScript** for type safety

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/) or [yarn](https://yarnpkg.com/)

### Setup

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   bun install
   # or
   yarn install
   ```
3. **Configure Supabase:**
   - Update your Supabase credentials in `src/integrations/supabase/client.ts` if needed.
   - Set up Google OAuth in your [Supabase project](https://app.supabase.com/project/_/auth/providers) and [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Make sure your redirect URIs are correct (see below).

4. **Start the development server:**
   ```sh
   npm run dev
   # or
   bun run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

### Google OAuth Redirect URIs
- For local development: `http://localhost:5173/`
- For production: `https://your-production-domain.com/`
- Also add: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`

Add these in your Google Cloud Console OAuth credentials.

## Project Structure

- `src/pages/Index.tsx` – Home page
- `src/pages/Auth.tsx` – Authentication page
- `src/pages/Dashboard.tsx` – User dashboard (protected)
- `src/contexts/AuthContext.tsx` – Auth logic and context
- `src/components/SignInForm.tsx` – Google sign-in button and form
- `src/integrations/supabase/` – Supabase client and types

## Tech Stack
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Deployment

You can deploy this app to any static hosting provider (Vercel, Netlify, etc.). Make sure to set the correct environment variables and redirect URIs for OAuth in production.

## License

MIT
