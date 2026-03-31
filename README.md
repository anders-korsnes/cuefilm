# MoodFlix

A mood-based movie and TV series recommendation app. Tell MoodFlix how you feel and how you *want* to feel, and it finds the perfect movie for your emotional journey.

## Features

- **Mood-based search** — select your current mood and desired mood to get personalized recommendations
- **Smart scoring engine** — weighs emotional journey, concentration level, social context, ratings, and runtime
- **Hidden gems mode** — discover critically acclaimed films you haven't heard of
- **Random picks** — feeling lucky? Get time-of-day-aware random suggestions
- **AI explanations** — understand *why* a movie fits your mood (powered by OpenRouter)
- **Personal library** — save favorites and track what you've watched
- **i18n** — Norwegian and English
- **Light/dark/system theme**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Express 4, TypeScript, Mongoose |
| Database | MongoDB Atlas |
| Auth | Clerk |
| Movie data | TMDB API |
| AI | OpenRouter |

## Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free M0 tier works)
- A [Clerk](https://clerk.com) project (free tier)
- A [TMDB](https://www.themoviedb.org/settings/api) API token
- An [OpenRouter](https://openrouter.ai/) API key (optional, for AI explanations)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/MoodFlix.git
cd MoodFlix
npm install
cd server && npm install && cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Fill in the values in both `.env` files with your API keys.

### 3. Start development

```bash
npm run dev:all
```

This starts both the Vite frontend (port 5173) and Express backend (port 3001) concurrently. The frontend proxies `/api` requests to the backend in development.

Or run them separately:

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend
cd server && npm run dev
```

## Project Structure

```
MoodFlix/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # UI components by feature
│   ├── hooks/              # Custom React hooks
│   ├── services/           # TMDB API, scoring engine, AI
│   ├── context/            # Language context (i18n)
│   ├── data/               # Translations, mood mappings
│   └── types/              # TypeScript types
├── server/                 # Backend (Express)
│   └── src/
│       ├── routes/         # API routes (library, settings, ai)
│       └── models/         # Mongoose schemas
├── vercel.json             # Frontend deployment config
└── server/
    ├── Dockerfile          # Backend container config
    └── railway.json        # Railway deployment config
```

## Deployment

### Frontend (Vercel)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `/` (default)
3. Add environment variables:
   - `VITE_TMDB_TOKEN`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` = your Railway backend URL

### Backend (Railway)

1. Create a new project on [railway.app](https://railway.app)
2. Point to the `/server` directory
3. Add environment variables:
   - `MONGODB_URI`
   - `CLERK_SECRET_KEY`
   - `OPENROUTER_API_KEY`
   - `CLIENT_URL` = your Vercel frontend URL
   - `PORT` = `3001`
   - `NODE_ENV` = `production`

## License

MIT
