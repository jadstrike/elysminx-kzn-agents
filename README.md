# Elysminx Agent

A modern authentication and dashboard app powered by Supabase, Google OAuth, React, Vite, shadcn-ui, and Tailwind CSS.

## Features

- Google OAuth authentication via Supabase
- User dashboard with bento-style cards
- Gemini API key prompt and storage
- Responsive UI with shadcn-ui and Tailwind CSS
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js v18+
- npm, bun, or yarn

### Setup

1. **Clone the repo:**

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

   - Update Supabase credentials in `src/integrations/supabase/client.ts` if needed.
   - Set up Google OAuth in your [Supabase project](https://app.supabase.com/project/_/auth/providers) and [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Add your local and production URLs to both Google and Supabase Auth settings:
     - Local: `http://localhost:5173/`
     - Production: `https://your-production-domain.com/`
     - Supabase callback: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`

4. **Start the dev server:**
   ```sh
   npm run dev
   # or
   bun run dev
   # or
   yarn dev
   ```
   App runs at [http://localhost:5173](http://localhost:5173).

## Project Structure

- `src/pages/Index.tsx` – Landing page (sign-in, Gemini key prompt)
- `src/pages/Dashboard.tsx` – User dashboard (bento cards)
- `src/contexts/AuthContext.tsx` – Auth logic/context
- `src/integrations/supabase/` – Supabase client/types
- `src/components/` – UI components

## Gemini API Key Flow

- After Google sign-in, users are prompted for their Gemini API key.
- Key is validated and stored in the `profiles` table.
- Button/tooltip helps users get their key from Google AI Studio.

## Backend Proxy Setup (for Company API Keys)

To securely use company API keys and track usage, run a backend proxy server:

1. Create a `.env` file in your project root (never commit this file):
   ```env
   COMPANY_GEMINI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   COMPANY_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_URL=https://your-project.supabase.co
   ```
2. Install backend dependencies:
   ```sh
   npm install express cors node-fetch supabase-js dotenv
   ```
3. Create a file `server.js` at the project root and copy the provided proxy code (see below).
4. Start the backend server:
   ```sh
   node server.js
   ```
   The proxy will run at http://localhost:3001

**Never expose your company API keys to the frontend or commit them to git.**

## Deployment

Deploy to Vercel, Netlify, or any static host. Set correct environment variables and OAuth redirect URIs for production.

## License

MIT
