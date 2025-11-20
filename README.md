# Polymarket Trends Widget

A modern dashboard displaying trends from Polymarket, News, and US Betting Odds.

## Features

- **Polymarket Widget**: Live prediction market trends with interactive charts
- **News Trends**: Latest news from multiple categories powered by GNews API
- **Betting Odds**: Real-time odds from FanDuel, DraftKings, and BetMGM
- **Dark Mode**: Automatic system detection with manual toggle
- **Mobile Responsive**: Optimized layouts for desktop and mobile

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables (Vercel)

For the News Widget to work in production, you need to set up a **GNews API key**:

1. Get a free API key from [GNews.io](https://gnews.io/) (100 requests/day free)
2. In Vercel dashboard, go to: **Project Settings → Environment Variables**
3. Add:
   - **Name**: `GNEWS_API_KEY`
   - **Value**: Your GNews API key
   - **Environment**: Production

### 3. Local Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

**Note**: News widget will use demo API key locally (very limited). For full functionality, create `.env` file:

```env
GNEWS_API_KEY=your_api_key_here
```

### 4. Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Widgets

### Polymarket Widget
- Shows top 10 trending prediction markets
- Categories: Trending, Politics, Crypto, Sports, etc.
- Auto-refreshes every 5 minutes
- Interactive charts showing price history

### News Trends Widget
- Displays latest news from GNews API
- Categories: Top Stories, World, Business, Technology, Crypto, etc.
- Responsive card layout with images

### Betting Odds Widget
- Real-time odds from top US sportsbooks
- Market types: Moneyline, Spread, Over/Under
- Data cached for 6 hours to conserve API quota
- Mock data used if no API key is set

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Vercel** for serverless functions and hosting
- **Axios** for API requests

## API Limits

- **GNews API**: 100 requests/day (free tier)
- **The Odds API**: Limited free tier (cached for 6 hours)
- **Polymarket API**: No limits (public API)

## License

MIT
