# Tally — Personal Expense Tracker

A private, on-device personal expense tracker. Record income and expenses, see
totals and reports, and back up your data. Everything runs entirely in the
browser — data is stored in `localStorage` on your device and never leaves it.

## Prerequisites

- [Node.js](https://nodejs.org/) (18+)

## Setup

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

No backend, database, or external service is required. Sign in with any
`@{COMPANY_DOMAIN}` account (see `src/lib/constants.js`) to get started.

## Build & Preview

```bash
npm run build      # production build to ./dist
npm run preview    # serve the production build locally
```

## Checks

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript checks via jsconfig
```

## How Data Works

- All transactions, categories, and settings live in the browser's
  `localStorage`, keyed per account for isolation (`src/lib/storage.js`).
- The React state layer is in `src/lib/store.jsx`; it loads, persists, and
  syncs across tabs automatically.
- Back up regularly from Settings — backups are JSON files you can restore or
  print.