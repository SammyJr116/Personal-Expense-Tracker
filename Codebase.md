# Codebase.md

Comprehensive map of the **Tally — Personal Expense Tracker** codebase. This
project is a **pure frontend React (Vite) application** with no backend, no API,
and no external service dependency. All data persists in the browser's
`localStorage`.

---

## 1. Overview

- **Product:** Tally — a private, on-device personal expense tracker.
- **Architecture:** 100% client-side. Vite builds static assets into `dist/`;
  there is no server, database, or network calls (the single external request is
  the Google Fonts CSS import in `src/index.css:1`, which degrades gracefully).
- **Persistence:** `localStorage`, keyed per sign-in account
  (`tally:<userId>:transactions|categories|settings`). See `src/lib/storage.js`.
- **Auth:** simulated Google Workspace sign-in (`@northwind.co` domain gate). A
  UI-level gate only — no server enforcement. See `src/lib/constants.js` and
  `src/pages/SignIn.jsx`.
- **Source of requirements:** `Personal_Expense_Tracker_PRD.md` in the project
  root (PRD v1.0). Code is annotated with requirement IDs (e.g. `ACC-01`,
  `TXN-03`, `BAK-03`) that map to that document.

---

## 2. Technologies & Toolchain

| Concern | Technology |
| --- | --- |
| Framework | React 18 (`react@^18.2.0`) |
| Build tool | Vite 8 (`vite@^8.2.0`, Rolldown-based), `@vitejs/plugin-react` |
| Language | JavaScript (`.jsx`/`.js`); a few `.ts` files remain from the scaffold |
| Routing | `react-router-dom@^6.26.0` (`BrowserRouter`, nested routes) |
| Styling | Tailwind CSS 3 (`tailwindcss@^3.4.17`) + `tailwindcss-animate` + `autoprefixer` via PostCSS |
| UI primitives | Radix UI (`@radix-ui/react-*`) via **shadcn/ui** style components (`src/components/ui/`) |
| Icons | `lucide-react` (plus inline SVG icon maps in `Sidebar.jsx`/`Layout.jsx`) |
| Charts | `recharts@^2.15.4` (donut, bar, area) |
| State | React Context (`src/lib/store.jsx`, `src/lib/period.jsx`) — no external state lib |
| Theming | CSS custom properties (HSL) defined in `src/index.css` `:root` |
| Linting | ESLint 9 flat config (`eslint.config.js`) with `react-hooks` + `unused-imports` plugins |
| Type checking | TypeScript CLI against `jsconfig.json` (`npm run typecheck`) |

### Key config files

| File | Purpose |
| --- | --- |
| `vite.config.js` | Vite config; `@` alias → `./src`, React plugin |
| `jsconfig.json` | Path alias `@/*` → `./src/*`; includes `src/components/**/*.js`, `src/pages/**/*.jsx`, `src/Layout.jsx`; excludes `node_modules`, `dist`, `src/components/ui`, `src/lib` |
| `eslint.config.js` | ESLint 9 flat config; ignores `src/lib` and `src/components/ui` |
| `tailwind.config.js` | Theme extension: chart colors, `sidebar` palette, `income`/`expense` colors, custom fonts, animations |
| `postcss.config.js` | `tailwindcss` + `autoprefixer` |
| `components.json` | shadcn/ui config (`new-york` style) |
| `index.html` | HTML shell; inline SVG favicon; title/meta for Tally |

---

## 3. Project Structure

```
Personal Expense Tracker/
├── index.html                     # Vite entry HTML
├── package.json                   # name: tally-expense-tracker; scripts below
├── package-lock.json
├── vite.config.js                 # Vite + @ alias
├── jsconfig.json                  # TS-style path + inclusion config
├── eslint.config.js               # ESLint flat config
├── tailwind.config.js             # Tailwind theme
├── postcss.config.js              # PostCSS plugins
├── components.json                # shadcn/ui settings
├── .gitignore
├── README.md                      # setup / run / data-model doc
├── AGENTS.md                      # working notes for AI agents
├── CLAUDE.md                      # "See AGENTS.md"
├── Codebase.md                    # this document
├── Personal_Expense_Tracker_PRD.md# PRD v1.0 (requirements source)
├── dist/                          # production build output (gitignored)
└── src/
    ├── main.jsx                   # React root mount
    ├── App.jsx                    # Router + AppProvider + auth Gate + Toaster
    ├── index.css                  # Tailwind + design tokens
    ├── lib/                       # domain logic & state (see §5)
    ├── pages/                     # route-level views (see §6)
    ├── components/                # app-specific components (see §7)
    │   ├── charts/                # recharts wrappers
    │   └── ui/                    # shadcn/ui primitives (see §8)
    ├── hooks/                     # use-toast.ts (dup), use-size, use-mobile
    └── utils/                     # index.ts: createPageUrl (unused)
```

---

## 4. Application Flow (how it fits together)

```
src/main.jsx
  └─ <App />  (src/App.jsx)
       ├─ <BrowserRouter> + <ScrollToTop> + <Toaster />
       └─ <AppProvider> (src/lib/store.jsx)        ← global state + localStorage
              └─ <Gate>                            ← auth gate
                   ├─ !user  → <SignIn />          (src/pages/SignIn.jsx)
                   └─  user  → <PeriodProvider>    (src/lib/period.jsx)
                                └─ <Routes> inside <Layout> (sidebar + mobile UI)
                                     ├─ /            Dashboard
                                     ├─ /add         Add
                                     ├─ /transactions Transactions
                                     ├─ /reports     Reports
                                     ├─ /categories  Categories
                                     ├─ /settings    Settings
                                     ├─ /help        Help
                                     └─ *            PageNotFound
```

**Runtime flow:**

1. `AppProvider` reads the session from `localStorage` (`tally:session`) and
   loads that user's transactions/categories/settings (or seeds default
   categories) asynchronously via a `loaded` flag.
2. Every state change is persisted back to `localStorage` by effect watchers,
   and a `window` `storage` listener syncs other tabs (multi-tab sync, ARC-08).
3. Sign-in/sign-out calls `setSession` and re-runs the load effect.
4. `Gate` shows `<SignIn />` before any authenticated view. After sign-in, all
   routed pages run inside `Layout`, which renders the `Sidebar` (desktop) or a
   drawer + bottom tab bar (mobile) and the page `<Outlet />`.
5. Pages and derived components read state through `useApp()` /
   `usePeriod()`, compute numbers with pure helpers in `src/lib/calc.js`, and
   format everything via `src/lib/format.js`.

---

## 5. Core Library — `src/lib/`

| File | Responsibility |
| --- | --- |
| `store.jsx` | **`AppProvider`** context + `useApp()` hook. Owns `user`, `transactions`, `categories`, `settings`, `loaded`. All mutations: `signIn`, `signOut`, `addTransaction`, `updateTransaction`, `deleteTransaction`, `addCategory`, `renameCategory`, `deleteCategory`, `updateSettings`, `resetAllData`, `createBackup`, `restoreBackup`, `seedSampleData`. |
| `storage.js` | localStorage CRUD layer. Keys: `tally:session`, `tally:<userId>:transactions|categories|settings`. `getSession`, `setSession`, `loadUserData`, `saveTransactions`, `saveCategories`, `saveSettings`, `clearUserData`. |
| `constants.js` | `APP_NAME`, `APP_TAGLINE`, `COMPANY_DOMAIN` (`northwind.co`), `SCHEMA_VERSION` (1), predefined categories (`PREDEFINED_EXPENSE`, `PREDEFINED_INCOME`), `CURRENCIES` (7 display-only), `DEFAULT_CURRENCY`, `NAV_ITEMS`, `PAGE_TITLES`, `DEMO_ACCOUNTS`. |
| `calc.js` | Pure, side-effect-free aggregation: `isCounted`, `isUpcoming`, `inMonth`, `inYear`, `inPeriod`, `periodTotals`, `totalBalance`, `spendingByCategory`, `spendingTrend` (by day or by month), `recentTransactions`, `countForCategory`. Only **counted** transactions (date ≤ today) affect totals/charts. |
| `format.js` | `currencyMeta`, `formatAmount` (`"1,234.56 USD"`), `formatMoney` (`"$1,234.56"`), `formatDate` (`"21 Sep 2026"`), `formatMonthLabel`, `todayStr`, `daysAgoStr`, `relativeDate`, `uid`. Amounts stored as **integer hundredths** (DAT-02). |
| `period.jsx` | `PeriodProvider` + `usePeriod()`. Shared Month/Year filter across Dashboard, Reports, Transactions (defaults to current month). |
| `PageNotFound.jsx` | 404 page shown for unmatched routes (inline SVG home button). |
| `utils.js` | `cn(...)` class-merge helper (`clsx` + `tailwind-merge`); `isIframe` flag. |

### Data model (localStorage)

**Transaction:** `{ id (uuid), type: "expense"|"income", amount (int, hundredths),
categoryId, date ("YYYY-MM-DD"), note (≤100 chars), createdAt, updatedAt }`

**Category:** `{ id (uuid), name (≤30 chars), type, isPredefined (bool), createdAt }`
- Predefined (built-in, locked): 9 expenses (Food, Transport, Housing,
  Utilities, Shopping, Entertainment, Health, Education, Other) + 5 incomes
  (Salary, Freelance, Gift, Refund, Other).
- Custom categories are **expense only** and can be renamed/deleted. Deleting
  one moves its transactions to the built-in "Other" category (CAT-06).

**Settings:** `{ currency, lastBackupDate, backupSnooze, schemaVersion }`

**Backup file format** (`createBackup`/`restoreBackup` in `store.jsx`):
`{ format: "tally-backup", version, createdAt, currency, categories,
transactions }`. Restore **merges** by id (newer `updatedAt` wins) and merges
categories by name, remapping `categoryId`s (BAK-03/BAK-05). Demo sample data
(`seedSampleData`) is only used to preview the UI (OOS-21).

---

## 6. Pages — `src/pages/`

| Page | Route | Purpose & key features |
| --- | --- | --- |
| `SignIn.jsx` | (gate, when `!user`) | Simulated Google account picker. Steps: intro → picker → manual. Only `@northwind.co` emails admitted (ACC-01..03, ACC-08). Two demo accounts (`DEMO_ACCOUNTS`). No server involved. |
| `Dashboard.jsx` | `/` | Period totals (income/expense/net), all-time balance, spending-by-category donut, recent 5 transactions, first-run onboarding (empty state + "Load example data"), upcoming-not-counted notice, add/edit/delete via `TransactionForm`/`ConfirmDialog`. |
| `Add.jsx` | `/add` | Opens `TransactionForm` immediately; navigates back to `/` on close. |
| `Transactions.jsx` | `/transactions` | Paged list (50/page). Filters: period (with "All time"), type, category; search on note/category; sort by date/amount; upcoming-total banner; delete & edit. |
| `Reports.jsx` | `/reports` | Period summary strip, category donut (RPT-01), income-vs-expense bar (RPT-04), spending trend area chart by day/month (RPT-05). Empty state when no counted transactions. |
| `Categories.jsx` | `/categories` | Add/rename/delete custom expense categories (duplicate & length validation), built-in lock badges, transaction counts, delete→"Other" with count confirmation. Income list is read-only. |
| `Settings.jsx` | `/settings` | Display currency (label-only, no conversion), backup download, restore-from-file (merge preview), account + sign out, typed-confirmation reset ("RESET"), help link. |
| `Help.jsx` | `/help` | Privacy/copy explaining on-device storage, backup/restore, no-financial-advice disclaimer; quick links. |

---

## 7. App Components — `src/components/`

| Component | Purpose |
| --- | --- |
| `Layout.jsx` | Shell for authenticated pages. Desktop sidebar + mobile drawer/top bar/bottom tab bar; sets `document.title` via `PAGE_TITLES`; renders `BackupReminder` and footer disclaimer above `<Outlet />`. |
| `Sidebar.jsx` | Brand header, `NAV_ITEMS` links (icon map), "New transaction" CTA, user chip + sign-out. |
| `TransactionForm.jsx` | Add/edit dialog (`Dialog`). Type toggle, amount (2-dp validation, max `999999999.99`), category pills filtered by type, date input, note (≤100). "Save & add another" for new records; guards double-submit (TXN-08). |
| `TransactionRow.jsx` | Row: income/expense icon + color, category, relative date, note, signed amount, upcoming badge, hover edit/delete actions. |
| `StatCard.jsx` | KPI card with accent blob, negative-value styling (destructive when value starts with `-`). |
| `PeriodPicker.jsx` | Month/Year toggle, prev/next arrows, optional "All time" button (used by Transactions). Reads/writes `usePeriod()`. |
| `EmptyState.jsx` | Reusable empty state (title/description/optional action/compact). |
| `ConfirmDialog.jsx` | Reusable destructive/confirm dialog. |
| `BackupReminder.jsx` | Bats a dismissible banner when ≥30 days since last backup (7-day snooze persisted in settings). |
| `ScrollToTop.jsx` | Scrolls to top / hash target on route change (no-op for POP nav). |
| `charts/CategoryDonut.jsx` | Recharts donut of expense distribution with center total + text legend. |
| `charts/IncomeExpenseBar.jsx` | Recharts bar of income vs expenses with text alternative. |
| `charts/SpendingTrend.jsx` | Recharts area chart (income + expense) by day or month, with expandable table view (RPT-07). |

---

## 8. UI Primitives — `src/components/ui/`

shadcn/ui-style components generated from `components.json`. There are ~48
files (Button, Dialog, Input, Textarea, Label, Toast/Toaster/use-toast, plus
Accordion, Alert, AlertDialog, Avatar, Badge, Breadcrumb, Calendar, Card,
Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Drawer,
DropdownMenu, Form, HoverCard, InputOTP, Menubar, NavigationMenu, Pagination,
Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet,
Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Toggle, ToggleGroup,
Tooltip, etc.).

> **Used by the app right now:** `button`, `dialog`, `input`, `label`,
> `textarea`, `toast`, `toaster`, `use-toast` (the toast system uses Radix
> `@radix-ui/react-toast`). Everything else in this folder is **unused
> boilerplate** inherited from the scaffold and is safe to delete if a leaner
> tree is desired.

Note: there are **two** `use-toast` files — `src/components/ui/use-toast.ts`
(the one the app imports via `@/components/ui/use-toast`) and a duplicate at
`src/hooks/use-toast.ts`.

---

## 9. Hooks & Utils

- `src/hooks/use-size.jsx` — measures an element with `ResizeObserver` +
  `useLayoutEffect` (returns `{width, height}`).
- `src/hooks/use-mobile.jsx` — `useIsMobile()` via `matchMedia` (breakpoint 768px).
- `src/hooks/use-toast.ts` — duplicate of the shadcn toast hook (unused by app).
- `src/utils/index.ts` — `createPageUrl()` (currently unused).

---

## 10. Dependencies

### In use (runtime-critical)
`react`, `react-dom`, `react-router-dom`, `recharts`, `lucide-react`, `clsx`,
`tailwind-merge`, `class-variance-authority`, `@radix-ui/react-dialog`,
`@radix-ui/react-slot`, `@radix-ui/react-label`, `@radix-ui/react-toast`,
`tailwindcss-animate`.

### Present but only used by unused UI boilerplate
`@radix-ui/react-*` (accordion, alert-dialog, aspect-ratio, avatar, checkbox,
collapsible, context-menu, dropdown-menu, hover-card, menubar,
navigation-menu, popover, progress, radio-group, scroll-area, select,
separator, slider, switch, tabs, toggle, toggle-group, tooltip, …), `cmdk`,
`embla-carousel-react`, `react-day-picker`, `input-otp`,
`react-resizable-panels`, `vaul`, `next-themes`, `sonner`,
`react-hook-form`, `@hookform/resolvers`, `zod`.

### Unused everywhere (vestigial scaffold libs — cleanup candidates)
`@hello-pangea/dnd`, `canvas-confetti`, `date-fns`, `framer-motion`,
`html2canvas`, `jspdf`, `lodash`, `moment`, `react-hot-toast`,
`react-leaflet`, `react-markdown`, `react-quill-new`, `three`.

### Dev dependencies
`vite`, `@vitejs/plugin-react`, `eslint` + plugins (`react`, `react-hooks`,
`react-refresh`, `unused-imports`), `@eslint/js`, `globals`, `typescript`,
`@types/*`, `tailwindcss`, `postcss`, `autoprefixer`.

> Removed as of recent cleanup: `@stripe/*`, `@tanstack/react-query`, and all
> Base44/Nitro packages. The project is now fully standalone frontend.

---

## 11. Scripts (`package.json`)

| Script | Command | Notes |
| --- | --- | --- |
| `dev` | `vite` | Local dev server (default `http://localhost:5173`). |
| `build` | `vite build` | Production build → `dist/`. |
| `preview` | `vite preview` | Serve the built `dist/`. |
| `lint` | `eslint . --quiet` | Static lint of components/pages (ignores `src/lib`, `src/components/ui`). |
| `lint:fix` | `eslint . --fix` | Auto-fix lint issues. |
| `typecheck` | `tsc -p ./jsconfig.json` | Type-check pages/components via jsconfig. ~30 pre-existing errors exist in untouched files. |

No test runner is configured.

---

## 12. Styling & Theming

- Design tokens are CSS custom properties in `src/index.css` (`:root`): color
  scales for `background`/`foreground`/`primary`/`secondary`/`muted`/`accent`/
  `destructive`/`border` plus semantic `income`, `expense`, `sidebar`, and
  `chart-1..5` palettes (dark navy sidebar, `--radius: 0.75rem`, Inter font).
- Tailwind maps these in `tailwind.config.js`; utility classes `card-soft`,
  `card-hover`, `num-tabular` (tabulated figures), and `scrollbar-thin` are
  defined in `index.css`.
- Accessibility touches: income/expense are distinguished by icon + sign, never
  color alone (UXD-09); charts ship text alternatives (RPT-07).

---

## 13. Conventions & Notes for Contributors

- Amounts are **always integer hundredths**; convert with `formatMoney`/
  `formatAmount` for display (never `toFixed` ad hoc).
- Dates are `YYYY-MM-DD` strings; compare lexicographically. "Counted" =
  `date <= today`; future-dated transactions are "upcoming" and excluded from
  totals until their date arrives (UPC-02).
- All persistence goes through `src/lib/storage.js` — the intended swap point if
  a real backend is ever introduced.
- Prefer pure helpers in `src/lib/calc.js` over inline arithmetic in components.
- Keep `npm run lint` and `npm run build` green (and `npm run typecheck` for
  new files) before finishing changes.

---

## 14. Known Issues / Tech Debt

- **Unused dependencies** (see §10) and ~40 unused shadcn `ui/` files inflate
  `node_modules` and the bundle (currently ~750 kB JS / 2256 modules built).
- **`npm run typecheck`** reports ~30 pre-existing errors in files like
  `TransactionForm.jsx`, `format.js`, `period.jsx`, `store.jsx`, `Settings.jsx`
  (unrelated to the Base44 removal).
- Duplicate `use-toast.ts` (hooks vs components/ui) — only the latter is used.
- `src/utils/index.ts` (`createPageUrl`) is dead code.
- The dist build emits a chunk-size warning (>500 kB, informational).