# AGENTS.md

## Project Context

This is a standalone React (Vite) app, fully client-side with no backend or
external service dependency. Keep changes focused on the user's request and
preserve existing project conventions.

Start with `README.md` for setup and scripts.

## Key Files

- `src/`: frontend application source.
- `src/lib/store.jsx`: React state layer (auth session, transactions, categories, settings).
- `src/lib/storage.js`: localStorage persistence layer, keyed per account.
- `src/lib/AuthContext.jsx`: no longer present — auth is handled locally by `src/lib/store.jsx` and `src/pages/SignIn.jsx`.
- `vite.config.js`: Vite config.

## Working Notes

- Use `npm run dev` for local development (frontend only, no backend needed).
- No environment variables are required. All data is stored in the browser's
  `localStorage`; there is no server, API, or hosted backend.
- Data is kept separate per sign-in account (`tally:<userId>:...` keys).
- Run the relevant checks from `package.json` before finishing code changes:
  `npm run lint` and `npm run typecheck`.