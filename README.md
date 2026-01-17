# Sentinel (PingPanel)

A cross-platform mobile application built with **React Native (Expo)** and powered by **Convex** to monitor the health, uptime, and performance of deployed web applications.

## Features

- 📊 **Real-Time Dashboard** - Live status feed with automatic updates
- 🟢 **Visual Status Indicators** - Green (UP), Red (DOWN), Yellow (Degraded)
- ➕ **Monitor Management** - Create, edit, and delete monitors
- 🔧 **Debug Console** - Built-in HTTP client (Postman-Lite)
- ⏰ **Automated Checks** - Server-side monitoring via Convex cron jobs

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Expo CLI
- Convex account (free tier available at [convex.dev](https://convex.dev))

### Installation

1. **Clone the repository**
   ```bash
   cd pingpanel
   pnpm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will prompt you to log in and create a new project. It will also generate the required type files.

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Update `EXPO_PUBLIC_CONVEX_URL` with your Convex deployment URL from the dashboard.

4. **Start the app**
   ```bash
   pnpm start
   ```
   Press `w` for web, `i` for iOS simulator, or `a` for Android emulator.

## Project Structure

```
pingpanel/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── add.tsx        # Add Monitor form
│   │   └── debug.tsx      # HTTP client
│   ├── monitor/[id].tsx   # Monitor detail modal
│   └── _layout.tsx        # Root layout with Convex
├── components/            # Reusable components
│   ├── monitor-card.tsx
│   ├── summary-cards.tsx
│   ├── status-badge.tsx
│   └── response-viewer.tsx
├── constants/             # Theme & design tokens
├── convex/               # Backend functions
│   ├── schema.ts         # Database schema
│   ├── monitors.ts       # CRUD operations
│   ├── actions.ts        # Health check action
│   ├── scheduler.ts      # Check scheduling
│   └── crons.ts          # Cron job config
└── hooks/                # Custom React hooks
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   Convex Cloud  │
│  (React Native) │◀────│   (Backend)     │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Target URLs    │
                        │  (Your APIs)    │
                        └─────────────────┘
```

- **Real-time sync**: Convex subscriptions automatically update the UI
- **Server-side checks**: Cron jobs run every minute to check monitors
- **Offline support**: Cached data displayed when offline

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Convex (serverless functions + real-time database)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## License

MIT
