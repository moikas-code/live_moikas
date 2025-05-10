# Live Moikas

A high-quality web application built with Next.js (App Router), Tailwind CSS, DaisyUI, and Twitch Embed.

## Features
- Main stream display for `moikapy` with live/offline detection
- Searchable, filterable grid of other Twitch creators
- Responsive, accessible UI using DaisyUI and Tailwind CSS
- Twitch Helix API integration with secure server-side calls
- Performance optimizations (dynamic imports, SSR/SSG, caching)
- ESLint and Prettier for code quality

## Setup Instructions

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd live_moikas
```

### 2. Install dependencies (using Bun)
```sh
bun install
```

### 3. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in your Twitch API credentials:
```sh
cp .env.local.example .env.local
```
Edit `.env.local`:
```
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
```

- Get your credentials from the [Twitch Developer Console](https://dev.twitch.tv/console/apps).

### 4. Run the development server
```sh
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure
- `src/app/` - App Router pages and API routes
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions (e.g., Twitch API helpers)
- `src/data/` - Static creator list

## Linting & Formatting
- Run ESLint: `bun run lint`
- Run Prettier: `bun run format`

## Notes
- The app uses the Twitch Embed JavaScript SDK for dynamic, responsive stream embeds.
- API calls are cached to minimize rate limits.
- All sensitive credentials are handled via environment variables.

## License
MIT
