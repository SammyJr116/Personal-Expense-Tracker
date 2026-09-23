# Agent Tasks

Agent-executable work items for the **Tally — Personal Expense Tracker**
(`tally-expense-tracker`). Each task is small, focused, and independently
verifiable.

**PRD =** `Personal_Expense_Tracker_PRD.md` (PRD v1.0). Requirement IDs
(e.g. `BAK-04`) and section references (e.g. `§8.11`) both map to that file.
**Codebase =** `Codebase.md` (current structure, dependency inventory, known
tech debt).

## Conventions

- Complete tasks in the **Suggested order** (§ at the end); each task leaves
  the app runnable.
- Line numbers cited in tasks reflect the current source. If code has moved,
  locate the item by function/JSX name, not by line number.
- After every task: run `npm run lint`, then `npm run build`, and
  `npm run typecheck`; the dev view of any affected screen should still work
  at `http://localhost:5173`.
- Keep changes narrow. Do not refactor unrelated code, rename symbols outside
  the task's scope, or add comments unless they document PRD-required
  behavior. Do not change wording or behavior except where a task says so.
- Environment tip: `node`/`npm` are not on the default PATH on this machine.
  Prepend `C:\Program Files\nodejs` to `$env:Path` (or call `npm.cmd`
  directly); Git is at `C:\Program Files\Git\cmd\git.exe`.

---

# Phase: Refining Project

Closes the gaps between the current build and PRD v1.0: behavioral
divergences, storage robustness, correctness edges, verification, and
delivery. Core functionality already exists; these are small, incremental
subtasks.

---

## RP-01 — Remove the shipped demo-data seeder

- **PRD:** §3.2 (OOS-21), §8.13 (ONB-01), §11.1 (TST-05), §18.2 (DF-10)
- **Goal:** The shipped app must not include sample/test data or any way to
  generate it.
- **Context:** The PRD says "There is no tutorial and no sample data" and that
  "test data is used for testing only and is never shipped." Today the
  first-run dashboard exposes a **"Load example data"** button that calls
  `seedSampleData()` and fabricates ~14 report-ready transactions (including a
  "future" one). The rest of the onboarding copy is PRD-compliant and must be
  kept.
- **Files to touch:**
  - `src/lib/store.jsx` — `seedSampleData` callback (lines ≈205–254) and its
    entry in the provider `value` object (≈line 317).
  - `src/pages/Dashboard.jsx` — imports line 15 (`Sparkles`), destructure line
    18 (`seedSampleData`), and the first-run empty-state block lines ≈44–69
    (the "Load example data" button lines ≈61–63).
- **Implement:**
  1. In `store.jsx`, delete the `seedSampleData` `useCallback` and remove it
     from the `value` object.
  2. In `Dashboard.jsx`, remove `seedSampleData` from the `useApp()`
     destructure and delete the "Load example data" button. Keep the "Add
     transaction" button and the onboarding copy about data living on the
     device and being backed up.
  3. Confirm `Sparkles` is still referenced by the welcome card icon (line
     ≈49); if it is only used by the deleted button, remove the import too.
- **DoD:** The first-run dashboard offers only "Add transaction". `grep -rn
  "seedSampleData"` across `src/` returns nothing. Lint and build pass.
- **Verify:** `npm run lint`; `npm run build`; without any catalog click on
  the Dashboard at 5173.

---

## RP-02 — Make restore two-phase: preview first, apply only on confirm

- **PRD:** §8.11 (BAK-02, BAK-04; merge semantics BAK-03)
- **Goal:** Restore must validate and preview before changing any data, and
  must change nothing unless the user confirms.
- **Context:** `restoreBackup()` in `store.jsx` (lines ≈256–308) parses the
  file and immediately calls `setTransactions`/`setCategories` (lines
  ≈297–298). `Settings.jsx` then shows a "Restore this backup?" dialog whose
  Confirm/Cancel buttons only show a toast — canceling does **not** revert the
  already-applied merge. Currently a failed parse correctly changes nothing,
  but a *cancelled* success does not meet BAK-04 ("Before applying, the app
  shows a summary … and requires confirmation").
- **Files to touch:**
  - `src/lib/store.jsx` — `restoreBackup` and the context `value`.
  - `src/pages/Settings.jsx` — `onPickFile` (lines ≈40–53), `confirmRestore`
    (≈55–66), the restore dialog (≈172–191), and `fileRef` handling (≈122).
- **Implement:**
  1. In `store.jsx`, keep `restoreBackup(file)` as a **parse/preview** step:
     read + validate (format key, shape), compute the merged transactions and
     categories per BAK-03 (id-based merge, newer `updatedAt` wins) and BAK-05
     (category merge by lower-cased `type:name`), but **do not call any
     setState**. Resolve with `{ added, skipped, updated, currency,
     pendingTransactions, pendingCategories }` or `{ error }`.
  2. Add an `applyRestore()` callback that commits the staged lists (the one
     place that calls `setTransactions`/`setCategories` for restore).
  3. In `Settings.jsx`, store the staged result in `restoreSummary` on pick.
     Call `applyRestore()` **only inside `confirmRestore`** before toasting.
     Closing/canceling the dialog must simply discard `restoreSummary`.
- **DoD:** Picking a file shows added/skipped/updated with no data change;
  "Restore" commits; Cancel/close leaves current data untouched; corrupt files
  still error and change nothing.
- **Verify:** Manual flow in Settings; existing transactions unchanged before
  Confirm (inspect a row before/after cancel). Lint/build pass.

---

## RP-03 — Safe storage writes with user-facing failure feedback

- **PRD:** §8.14 (FBK-03)
- **Goal:** A storage write failure (quota full, storage blocked) must never
  throw an unhandled error or fail silently; the user must see a clear
  message.
- **Context:** `write()` in `storage.js` (lines ≈38–40) calls
  `localStorage.setItem` with no try/catch, and `setSession` (≈23–25) also
  throws on failure. `store.jsx`'s persistence effects (lines ≈53–61) call
  these on every change, so a quota error surfaces as an uncaught exception
  and the user is told nothing.
- **Files to touch:**
  - `src/lib/storage.js` — `write()`, `setSession()`.
  - `src/lib/store.jsx` — persistence effects (≈53–61) and
    `signIn`/`signOut` (≈84–93, since they use `setSession`).
- **Implement:**
  1. Wrap `write` and `setSession` bodies in try/catch; return `true` on
     success and `false` on failure instead of throwing. Keep the API surface
     otherwise unchanged.
  2. In `store.jsx`, when a persistence effect's save returns `false`, show a
     non-blocking toast: "Storage is full or unavailable — your latest change
     may not be saved." Use the app's existing toast (`useToast`) — it can be
     called inside the provider. Do not attempt to mask the failure from the
     UI or retry in a loop.
- **DoD:** Temporarily overriding `localStorage.setItem = () => { throw new
  Error("quota") }` in DevTools and then adding/editing a transaction shows
  the toast and produces no unhandled console error. Removing the override
  restores normal saving.
- **Verify:** Instrumented reproduction above; `npm run lint`; `npm run
  build`.

---

## RP-04 — Request persistent storage on startup

- **PRD:** §5 (ARC-07)
- **Goal:** Ask the browser to persist site storage where supported, reducing
  the chance of automatic eviction (PRD risk RISK-01/02).
- **Context:** The app never calls `navigator.storage.persist()`. This is a
  one-shot, progressively-enhanced call; it must not break on unsupported
  browsers (Safari lacking the API).
- **Files to touch:**
  - `src/lib/storage.js` — add `requestPersistentStorage()`.
  - `src/lib/store.jsx` — user-load effect (≈39–50).
- **Implement:**
  1. Add `export async function requestPersistentStorage()` that
     feature-detects `navigator.storage?.persist` and calls it inside
     try/catch, ignoring the result/errors (best effort).
  2. Call it once from the user-load effect when a user is present (after
     `loaded` is set), so it doesn't fire on the sign-in screen.
- **DoD:** On supported browsers a persist request fires (log it once in
  dev); on unsupported ones the app runs identically. No changes to behavior.
- **Verify:** `npm run lint`; `npm run build`; `navigator.storage.persist` is
  invoked in Chrome DevTools console output.

---

## RP-05 — Never overwrite unreadable stored data

- **PRD:** §5 (ARC-06), §10.2 (NFR-02) — "If stored data cannot be read, the
  app MUST NOT erase it. It shows an error and offers restore."
- **Goal:** Corrupted stored data must stay on disk untouched and surface an
  error/restore path instead of silently being replaced by defaults.
- **Context:** `read(key, fallback)` in `storage.js` (≈28–36) returns
  `fallback` when `JSON.parse` fails; `loadUserData` (≈42–47) then returns
  those fallbacks, and any later save effect writes over the corrupted value —
  the app erases unreadable data without telling anyone.
- **Files to touch:**
  - `src/lib/storage.js` — `read()`, `loadUserData()`.
  - `src/lib/store.jsx` — user-load effect (≈39–50) and persistence effects
    (≈53–61).
- **Implement:**
  1. Make `loadUserData` report corruption distinctly: return
     `{ transactions, categories, settings, corruptKeys: string[] }` where a
     key with unparseable JSON is listed in `corruptKeys` and excluded from
     the normal returns.
  2. In `store.jsx`, when `corruptKeys.length > 0`, set a new provider state
     `dataUnreadable: boolean`. While set, the persistence effects must skip
     saving those keys (so the raw corrupt value is preserved). Render a
     clear, dismissible banner (place it in `Layout.jsx` near
     `BackupReminder`, or the dashboard) reading "Your stored data could not
     be read" with a link to Settings → Restore. Use defaults in memory only.
  3. Re-check corruption on each user load (sign-in/refresh); clear the flag
     once a successful restore or reset replaces the data.
- **DoD:** Corrupt a stored key via DevTools → reload → banner shows, app
  still usable with empty data, and the raw corrupt localStorage value is
  unchanged (verify in DevTools). Restoring a valid backup clears the banner.
- **Verify:** Manual DevTools reproduction; `npm run lint`; `npm run build`.

---

## RP-06 — Re-evaluate "counted" when the date changes at runtime

- **PRD:** §8.8 (UPC-05) — "The app MUST re-evaluate when the date changes
  while it is open."
- **Goal:** An upcoming transaction flips to counted (and all totals/charts
  refresh) at midnight or on device-date change without a reload.
- **Context:** "Counted" is derived from `todayStr()` at render time
  (`calc.js` `isCounted`, line ≈6). If the app stays open across midnight,
  nothing re-renders, so totals stay stale until any interaction. The calc
  functions already accept an optional `today` parameter in `isCounted`/
  `isUpcoming`, but the aggregate functions don't thread it through.
- **Files to touch:**
  - `src/hooks/use-today.js` — **new** hook: returns today's `YYYY-MM-DD`,
    recomputes on `focus`/`visibilitychange` and via a timeout aligned to the
    next local midnight (re-arm in a `useEffect`).
  - `src/lib/calc.js` — add an optional trailing `today` param to
    `periodTotals`, `totalBalance`, `spendingByCategory`, `spendingTrend`,
    `recentTransactions`, `isUpcoming` (default `todayStr()`), and pass it to
    the internal `isCounted`/`isUpcoming` calls.
  - Call sites: `src/pages/Dashboard.jsx` (≈27–36), `src/pages/Reports.jsx`
    (≈18–23), `src/pages/Transactions.jsx` (`upcomingTotal` ≈line 60).
- **Implement:**
  1. Create `useToday()`. Make the midnight timeout compute ms-until-next-
     midnight and reset the state, then re-arm; also refresh on
     `visibilitychange`/`window.focus` so returning to the tab always
     re-checks.
  2. In each page, call `useToday()` once and pass `today` as the final
     argument to the calc functions (dashboard reads, reports reads, and the
     upcoming-total filter in Transactions).
- **DoD:** Setting a transaction to tomorrow, then (in DevTools) moving the
  system clock past midnight and refocusing the tab, causes it to appear in
  counted totals without a reload. Lint/build pass.
- **Verify:** DevTools clock + tab-focus reproduction per page; `npm run
  lint`; `npm run build`.

---

## RP-07 — Persist list filters across in-app navigation

- **PRD:** §8.7 (LST-13) — "Filters persist while the user navigates within
  the app but are not stored in the URL."
- **Goal:** Search + type/category filters + sort + "All time" survive
  navigating away from `/transactions` and back.
- **Context:** Those values are `useState` inside `Transactions.jsx` (lines
  ≈23–31) and reset when the route unmounts. The shared period already
  persists via `PeriodProvider` (`src/lib/period.jsx`).
- **Files to touch:**
  - `src/lib/filters.jsx` — **new**: `FiltersProvider` + `useFilters()`.
  - `src/App.jsx` — mount `FiltersProvider` in `Gate` next to
    `PeriodProvider` (line ≈29).
  - `src/pages/Transactions.jsx` — replace the six local `useState` calls
    (search, typeFilter, catFilter, allTime, sort, visible) with provider
    values.
- **Implement:**
  1. State: `search` (string), `typeFilter` (`"all"|"income"|"expense"`),
     `catFilter` (`"all"` or category id), `allTime` (bool), `sort`
     (`{ key: "date"|"amount", dir: "asc"|"desc" }`), `visible` (number,
     default 50). Provide setters mirroring the current names.
  2. Wire `Transactions.jsx` to `useFilters()` with **identical behavior**
     (same defaults, same `toggleSort`, `clearFilters`, `setVisible` logic).
     Do not add URL syncing.
- **DoD:** Set a search/filter, go to Dashboard, return to Transactions —
  filters and scroll-load state are intact. Reloading the page resets them
  (period still persists). Lint/build pass.
- **Verify:** Manual navigation cycle at 5173; `npm run lint`; `npm run
  build`.

---

## RP-08 — Centralize remaining user-facing copy

- **PRD:** §5 (ARC-11) — "All user-facing text MUST be kept in one central
  place."
- **Goal:** Move still-inline copy out of components/pages into one strings
  module, with no wording or behavior change.
- **Context:** `src/lib/constants.js` already holds names, nav, titles, and
  currencies, but most screen copy (headers, subtitles, toasts, form labels,
  empty states, delete-dialog text, footer, onboarding) is inlined in the
  JSX.
- **Files to touch:**
  - `src/lib/strings.js` — **new** central string module.
  - Consumers: `src/pages/*` (Dashboard, Add, Transactions, Reports,
    Categories, Settings, Help, SignIn) and `src/components/*` (Layout,
    Sidebar, TransactionForm, TransactionRow, EmptyState, ConfirmDialog,
    BackupReminder, StatCard).
- **Implement:**
  1. Export a flat object (e.g. `STRINGS`. `<domain>.<key>`) covering: page
     headers/subtitles, form labels + placeholders (TransactionForm),
     toast titles/descriptions (per page), empty-state title/description
     (EmptyState usages), dialog titles/confirm labels (ConfirmDialog pages),
     navigation/footer/onboarding copy, SignIn copy.
  2. Update each consumer to import from `strings.js`. Do **not** change any
     string value, casing, or punctuation. Do not move `src/components/ui/*`
     internal copy.
- **DoD:** `grep -rin "Add transaction\|Back up my data\|No transactions
  yet\|Reset all data" src/pages src/components` finds occurrences only in
  `strings.js` and as JSX placeholder/default props where unavoidable. Lint
  and build pass.
- **Verify:** `npm run lint`; `npm run build`; visual diff of affected
  screens.

---

## RP-09 — Add automated tests for calculation and data logic

- **PRD:** §11.1 (TST-02) — totals, net, Total balance, counted vs upcoming,
  validation, category deletion, merge restore.
- **Goal:** A runnable `npm test` suite covering the pure logic without a
  browser.
- **Context:** No test framework exists. Two pieces of logic currently live
  inside components/context and must be extracted to pure functions so they
  can be tested (this is an enabling refactor, not a behavior change).
- **Files to touch (create/extend):**
  - `package.json` — add `vitest` (devDependency) and
    `"test": "vitest run"`.
  - `src/lib/calc.js` — already pure: cover it directly.
  - `src/lib/transaction-validation.js` — **new**: extract the pure validator
    from `TransactionForm.jsx` `validate()` (lines ≈60–76: required fields,
    `\d+(\.\d{1,2})?`, >0, ≤ 999999999.99, note ≤100).
  - `src/components/TransactionForm.jsx` — call the extracted validator.
  - `src/lib/category-delete.js` (or add to `calc.js`) — **new** pure helper
    `applyCategoryDelete(categories, transactions, id)` returning the new
    category list plus transactions remapped to the built-in "Other" category
    (CAT-06 logic currently inlined in `store.jsx` `deleteCategory`, ≈158–166).
  - `src/lib/store.jsx` — use the helper for parity with RP-02's merge module.
  - `src/lib/restore-merge.js` — **new** pure merge functions (BAK-03/BAK-05)
    OR, if RP-02 already extracted them, test those.
  - `src/lib/__tests__/*.test.js` — one file per module above.
- **Implement:**
  1. Set up Vitest (works with the existing `jsconfig`/Vite setup; no DOM
     needed).
  2. Tests: `calc.js` (period totals across month/year/"all", total balance,
     counted vs upcoming edges incl. today, spendingByCategory share/sort,
     spendingTrend day vs month bucketing, recentTransactions order);
     `transaction-validation` (valid, missing fields, 0/negative/non-numeric/
     3-decimal/oversized amounts, 101-char note); `category-delete` (moves
     transactions to "Other", removes category); `restore-merge` (id skip vs
     newer-`updatedAt` win, category name merge + remap, case-insensitivity).
  3. Keep `seedSampleData`-style fixtures inside the test files only (TST-05).
- **DoD:** `npm test` passes with meaningful assertions per area above; lint
  and build still pass; app behavior unchanged (validator/merge/delete logic
  is now shared, not duplicated).
- **Verify:** `npm test`; `npm run lint`; `npm run build`.

---

## RP-10 — Wire real Google Workspace sign-in behind the simulated gate

- **PRD:** §6.4 (ACC-09), §11.2 (AC-11); access still UI-level per §6.4
  (ACC-08). Blocked on OI-05 client credentials.
- **Goal:** When a client ID is configured, sign-in is real Google Identity
  Services with the company-domain check; otherwise the app remains usable in
  simulated mode.
- **Context:** `SignIn.jsx` is a simulated Google picker (`DEMO_ACCOUNTS` in
  `constants.js` + manual `@COMPANY_DOMAIN` check). The final product needs
  real Google sign-in; the client must supply a client ID and confirm the
  domain (OI-05/ACC-09) — but the integration can be built behind a flag
  first.
- **Files to touch:**
  - `src/lib/google-signin.js` — **new**: loads the GIS script, wraps
    `google.accounts.id.initialize`/prompt or One Tap, and returns
    `{ name, email }` for an admitted account, given a client ID.
  - `src/lib/constants.js` — optionally expose `GOOGLE_CLIENT_ID` imported
    from `import.meta.env.VITE_GOOGLE_CLIENT_ID` (no `.env` committed).
  - `src/pages/SignIn.jsx` — branch: real flow when ID present; current
    picker otherwise; a "Google sign-in is not configured" state when ID is
    missing but real flow chosen.
  - `src/lib/store.jsx` — `signIn` already takes `{name, email}`; real flow
    passes the Google account and keeps `id = email` (ACC-07: only
    name/email/id).
- **Implement:**
  1. Gate everything behind the client ID: absent → today's UI unchanged.
  2. Present → load GIS, initialize with client ID, run the sign-in UX, then
     enforce the email domain against `COMPANY_DOMAIN` (reuse the exact check
     from `SignIn.jsx` `submitAnother`, ≈20–29) and call
     `signIn({ name, email })`. Refused non-domain accounts get the existing
     "Only @northwind.co accounts are allowed" error and stay signed out.
- **DoD:** With a client ID set, the Google flow appears and admitted accounts
  sign in; without it, simulated mode works unchanged and no GIS script loads.
  No financial data is involved (ACC-08). Lint/build pass.
- **Verify:** Toggle presence/absence of `VITE_GOOGLE_CLIENT_ID`; `npm run
  lint`; `npm run build`.

---

## RP-11 — Responsive and touch-target audit at 360/768/1280 px

- **PRD:** §9 (UXD-06), §10.6 (NFR-07)
- **Goal:** No horizontal scroll at 360 px; breakpoints behave at 768 and
  1280; interactive controls are ≥ ~44 px touch targets.
- **Context:** Layouts use responsive Tailwind (mobile drawer/top bar/bottom
  tab bar, `sm:`/`lg:` grids), but no verification pass has been recorded.
- **Files to touch:** any page/component whose concrete violations are found.
  Likely candidates: `src/pages/*`, `src/components/Layout.jsx`,
  `Sidebar.jsx`, `TransactionRow.jsx`.
- **Implement (verification, then minimal CSS fixes only):**
  1. Open DevTools device toolbar at **360 × ~740**, **768** (tablet), and
     **1280** and walk every screen: SignIn, Dashboard (both states), Add,
     Transactions, Reports, Categories, Settings, Help.
  2. At 360 confirm `document.scrollingElement.scrollWidth <= innerWidth` on
     each screen (no sideways scroll) and that each interactive element
     (buttons, selects, links, tab items) is ≥ 44 CSS px on its primary axis;
     the mobile bottom tab bar must remain ≥ 44 px (it already sets
     `minHeight: 44`, keep it).
  3. Fix only concrete failures found, via CSS class changes (no layout
     rearchitecture).
- **DoD:** A short audit note (in the commit message, or a `docs/`
  accessibility note if one exists) lists each screen with pass/fail at the
  three widths; all failures are fixed; lint/build pass.
- **Verify:** DevTools pass per screen; `npm run lint`; `npm run build`.

---

## RP-12 — Accessibility pass toward WCAG 2.1 AA

- **PRD:** §10.3 (NFR-04), §8.14 (FBK-01)
- **Goal:** Recorded pass/fix for the WCAG 2.1 AA items the app should meet:
  visible labels, keyboard navigation, dialog focus, screen-reader
  announcements, contrast, and no reliance on color alone.
- **Context:** Radix `Dialog` provides focus trapping and the toast system
  renders in a live region; charts already ship text/table alternatives
  (RPT-07). None of this has been audited end-to-end.
- **Files to touch:** only where findings require fixes:
  `src/components/ui/button.tsx`, `dialog.tsx`, `toast.tsx` (if aria-live
  missing), `src/pages/*`, `src/components/*`.
- **Implement (checklist pass):**
  1. **Keyboard-only:** complete add/edit and delete flows, filter/search in
     Transactions, category rename/delete, Settings dialogs — all
     reachable via Tab, focus visibly indicated, Enter/Escape behave
     (Escape closes dialogs, Enter submits where expected).
  2. **Forms:** every `Input`/`Textarea`/`select` has a visible `<Label>` or
     `aria-label`; errors are programmatically associated with their field
     (or at minimum adjacent + announced on submit).
  3. **Toasts:** confirm the toast viewport is announced (`aria-live`) — add
     `role="status"`/`aria-live="polite"` if missing.
  4. **Contrast:** spot-check body text on `background`/`card`/`sidebar`
     using the browser contrast checker; fix only confirmed failures in
     `src/index.css` tokens.
  5. **Color independence:** re-verify income/expense use icon + sign, not
     color alone (they do); no new color-only additions.
- **DoD:** A checklist (recorded in the completion note/commit) marks each
  item above pass with fixes listed; lint/build pass; no color-only signals
  added.
- **Verify:** Keyboard/Escape/tab runs in browser; contrast tool; `npm run
  lint`; `npm run build`.

---

## RP-13 — Performance check at 10,000 transactions

- **PRD:** §10.1 (NFR-01), §5 (ARC-05)
- **Goal:** Verify 10,000-transaction support and ~100 ms interactions; fix
  concrete regressions only.
- **Context:** The app has no performance evidence at scale. `Transactions.jsx`
  already paginates at 50 and memoizes filtering with `useMemo`
  (≈33–57); totals are computed per render.
- **Files to touch (targeted):**
  - `src/components/TransactionRow.jsx` — wrap export in `React.memo`.
  - `src/pages/Transactions.jsx`, `src/pages/Dashboard.jsx` — only if
    measurement shows hotspots.
- **Implement:**
  1. Seed ~10,000 transactions **without shipping the seeder** (aligns with
     OOS-21): a one-off DevTools snippet that loops `addTransaction` (or a
     temporary throwaway that is removed before commit).
  2. Measure, on the 10k dataset: typing in Search, toggling type/category
     filters and sort, Load more, and opening/editing the form. Target
     <100 ms perceived response. Record samples.
  3. Apply only the minimal optimization needed: `React.memo` on
     `TransactionRow` (stable `onEdit`/`onDelete` references) and confirm the
     `useMemo` dependency arrays in `Transactions.jsx` are stable.
- **DoD:** Recorded measurements at 10k rows pass the 100 ms interaction
  target and reasonable list scroll; no seeder code is left in the repo;
  lint/build pass.
- **Verify:** DevTools Performance/Long Tasks with 10k dataset; `npm run
  lint`; `npm run build`.

---

## RP-14 — Deploy the static build over HTTPS and document it

- **PRD:** §12.2 (DLV-01, DLV-02), §5 (ARC-02), §14 (SEC-06).
- **Goal:** A production build is reachable over HTTPS, and the README
  documents deployment.
- **Context:** The repo (`origin`, branch `main`) is not deployed. `vite
  build` already produces `dist/`. A sub-path host (e.g. GitHub Pages at
  `/<repo>/`) needs the Vite `base` set; a custom domain removes that need
  (domain/ownership is OI-11, outside this task).
- **Files to touch:**
  - `vite.config.js` — set `base` if deploying to a project sub-path (e.g.
    `'./'` relative or the Pages path), else leave as-is.
  - `package.json` — add a `predeploy` (`npm run build`) and `deploy` script
    for the chosen host (e.g. `gh-pages -d dist`).
  - `README.md` — add "Deployment" section: build command, host steps, live
    URL.
- **Implement:**
  1. Choose a host. If GitHub Pages on this repo: add `gh-pages` devDependency
     + scripts, ensure `base` matches the URL, run the deploy, verify the
     HTTPS URL loads and sign-in → dashboard works end-to-end.
  2. Document the exact commands and the live URL in `README.md`.
- **DoD:** A live HTTPS URL serves the build; navigation, add/delete,
  persistence (refresh), and backup download work there; README lists URL +
  steps; lint/build pass.
- **Verify:** Load the live URL; re-run the Settings backup flow; `npm run
  lint`.

---

## RP-15 — Housekeeping: remove dead code and vestigial dependencies

- **PRD:** §10.5 (NFR-06) — maintainability.
- **Goal:** Remove files and packages the app does not import, shrinking
  install/build without touching runtime code paths.
- **Context:** `Codebase.md` §10/§14 lists unused files
  (`src/utils/index.ts` `createPageUrl`, duplicate
  `src/hooks/use-toast.ts`) and packages referenced only by unused
  `src/components/ui/*` boilerplate.
- **Files to touch:**
  - Delete: `src/utils/index.ts`, `src/hooks/use-toast.ts`.
  - Delete unused UI files in `src/components/ui/` first (accordion, alert,
    alert-dialog, aspect-ratio, avatar, badge, breadcrumb, calendar, card,
    carousel, chart, checkbox, collapsible, command, context-menu, drawer,
    dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu,
    pagination, popover, progress, radio-group, resizable, scroll-area,
    select, separator, sheet, sidebar, skeleton, slider, sonner, switch,
    table, tabs, toggle, toggle-group, tooltip — **keep** button, dialog,
    input, label, textarea, toast, toaster, use-toast).
  - `package.json`: remove packages with zero remaining import references
    (e.g. `@hello-pangea/dnd`, `canvas-confetti`, `cmdk`, `date-fns`,
    `embla-carousel-react`, `framer-motion`, `html2canvas`, `input-otp`,
    `jspdf`, `lodash`, `moment`, `next-themes`, `react-day-picker`,
    `react-hook-form`, `@hookform/resolvers`, `react-hot-toast`,
    `react-leaflet`, `react-markdown`, `react-quill-new`,
    `react-resizable-panels`, `sonner`, `three`, `vaul`, `zod`, plus unused
    `@radix-ui/*`). Verify each with a repo grep before removal.
- **Implement:**
  1. Delete the two files; delete the unused UI component files.
  2. `grep -rn "<pkg>" src` for each candidate package; remove from
     `package.json` only those with zero matches.
  3. `npm install` (prunes `node_modules`/lockfile), re-run lint + build.
- **DoD:** No import anywhere references a removed file or package; lockfile
  no longer lists them; lint, typecheck, and build pass; build output bundle
  and module count shrink vs. before.
- **Verify:** Greps above; `npm install`; `npm run lint`; `npm run typecheck`;
  `npm run build` (compare `transformed` module count).

---

## Suggested order

1. **RP-01** (behavioral contradiction; small, isolated) → **RP-02**
   (restore ordering; extract the merge into a pure module that RP-09 later
   tests).
2. **RP-03 → RP-04 → RP-05** in sequence (all storage-layer; RP-05 reuses
   RP-03's failure-signaling and touches the same effects).
3. **RP-06 → RP-07** (runtime correctness: counted-boundary, then filter
   persistence).
4. **RP-08** (mechanical copy extraction; harmless to do anytime).
5. **RP-09** (tests; lock in RP-02/RP-05/RP-06 behavior and the extracted
   validators/mergers).
6. **RP-10** (can be built in parallel; only activates when the client ID
   exists — blocked on OI-05).
7. **RP-11 → RP-12 → RP-13** (verification passes; each may spawn small
   follow-up fixes).
8. **RP-14** (deploy last so it ships the refined build).
9. **RP-15** (housekeeping; defer so it doesn't add noise while behavioral
   tasks are in flight).

---

# Phase: Closing the remaining frontend gaps

Finishes the handful of UI-related items the PRD still lists as open. Each is
small, self-contained, and verified against the running app at
`http://localhost:5173`.

---

## FR-01 — Wire real Google sign-in behind a client ID, keeping simulated mode as the default

- **PRD:** §6.4 (ACC-09, OI-05), §11.2 (ACC-09 real-GIS gate), §10. repeated
  "Open Items" queue.
- **Goal:** When `VITE_GOOGLE_CLIENT_ID` is set at build/run time, use real
  Google Identity Services for sign-in; when it is unset, keep today's
  simulated picker + `@northwind.co` domain gate exactly as-is.
- **Context:** `src/lib/google-signin.js` already loads the GIS script and
  wraps `initialize`/`prompt` when a client ID is present (`SignIn.jsx`
  `goGoogle` routes through it, `constants.js` reads
  `VITE_GOOGLE_CLIENT_ID`). This task only **verifies and finishes** that
  path: confirm the real flow returns `{ name, email }`, applies the same
  `@northwind.co` domain check used by the simulated path, and refuses
  non-domain accounts with the existing "Only @northwind.co accounts are
  allowed." message. No client ID will be committed (`.env` local only;
  `VITE_GOOGLE_CLIENT_ID` already documented in `.env.example`).
- **Files to touch:** `src/lib/google-signin.js`, `src/lib/constants.js` (only
  if a default/fallback is missing), `src/pages/SignIn.jsx`, `.env.example`
  (verify the variable is documented).
- **Implement:**
  1. Confirm GIS load is cached (single script tag, not re-injected on every
     sign-in attempt).
  2. Confirm the resolved account is normalized to `{ name, email }` and that
     sign-in is admitted **only** when `email` ends with `@northwind.co`
     (reuse the same lowercase endsWith check as the simulated path).
  3. Keep simulated mode byte-for-byte when the ID is unset (no visual or
     behavioral change in that path).
- **DoD:** With an ID set in a local `.env`, a real Google account on the
  domain is admitted; a non-domain account is refused with the existing
  message; no creds appear in the repo. With no ID, the app is unchanged.
- **Verify:** Set/clear the env var and run both flows at 5173; `npm run
  lint`; `npm run build`.

---

## FR-02 — Make the currency selectable from a defined list with a stored default

- **PRD:** §10.9 (SET-05), OI-09 (currency list is client input — pending).
- **Goal:** Settings shows a currency picker fed by the same `CURRENCIES`
  constant already exported from `src/lib/constants.js`; the chosen value is
  persisted and used as the display label everywhere (no conversion — §10.9
  and PRD keep currency label-only, OOS).
- **Context:** `CURRENCIES` (a small array of `{ code, symbol, name }`) and
  `COMPANY_DOMAIN` live in `src/lib/constants.js`. Settings already renders a
  currency field but the *default* and the *list* are pending client sign-off
  (OI-09). This task is therefore blocked on the client picking the default;
  once chosen, wire the picker exactly to that list.
- **Files to touch:** `src/pages/Settings.jsx` (currency section), `src/lib/settings.js`
  (if the currency value is stored there), `src/lib/constants.js` (default).
- **Implement:**
  1. Render a select whose options come solely from `CURRENCIES`.
  2. Default to the client-confirmed currency; persist selection.
  3. Use the selected currency's symbol/label in Dashboard/Reports/Transactions
     headers exactly as today's label-only usage does (no math changes).
- **DoD:** Changing the currency in Settings updates the displayed label on
  all three pages and survives reload. List matches PRD; lint/build pass.
- **Verify:** Change currency → check Dashboard/Reports/Transactions → reload →
  refresh persists; `npm run lint`; `npm run build`.

---

## FR-03 — Activate the backup cadence reminder banner per the confirmed schedule

- **PRD:** §8.9 (BAK-06), §8.x (BAK-09 — reminder after 30 days without a
  backup).
- **Goal:** The dormant `BackupReminder` banner starts firing on the cadence
  the client confirms (default 30 days), without changing the backup
  mechanics themselves (BAK-01..05 unchanged).
- **Context:** `src/components/BackupReminder.jsx` already exists and computes
  eligibility from the last-backup date stored under `tally:<accountId>:…`
  metadata; it is currently dormant pending client confirmation of the cadence
  (BAK-09, OI-08). This task waits for that number, then wires it as the
  constant the banner compares against.
- **Files to touch:** `src/components/BackupReminder.jsx`, `src/lib/constants.js`
  (the cadence constant), `src/components/Layout.jsx` (mount point — verify
  the banner is already included).
- **Implement:**
  1. Replace the placeholder cadence with the client-confirmed constant.
  2. Confirm the banner only appears on Dashboard/App-level layout, is
     dismissible, and disappears after a backup is recorded.
- **DoD:** Fishing out today's date → last backup older than the cadence shows
  the banner; taking a backup (or tapping the banner's dismiss) removes it;
  lint/build pass.
- **Verify:** Set the cadence to a small value temporarily in DevTools to prove
  the banner appears, then restore; `npm run lint`; `npm run build`.

---

## FR-04 — Run the final browser QA pass and record sign-off evidence

- **PRD:** §11.1 (RP-11/12/13 — WCAG 2.1 AA, performance at 10k rows,
  responsive at 360/768/1280). *Client-side manual sign-off items.*
- **Goal:** Produce a recorded evidence file (screenshots + a checklist) that
  the app meets the PRD's UI/accessibility/performance acceptance before the
  deploy task runs.
- **Context:** The reusable browser harness lives at
  `C:\Users\Hp\AppData\Local\Temp\opencode\ui-review\review.js`
  (puppeteer-core + headless Edge) and already produced 43/43 passing checks,
  0 console/page errors, 0 failed requests, and no horizontal overflow at 360
  px on all routes. This task re-runs it against **this** build and adds the
  two manual items automated checks can't prove: WCAG 2.1 AA keyboard +
  contrast walk-through (only realistic fixes allowed) and a 10,000-row
  interaction timing sample.
- **Files to touch:** the temp harness only (re-run it); no `src/` changes
  unless a real, concrete WCAG failure is found — then fix only that.
- **Implement:**
  1. Re-run `review.js` against the dev server; record the summary line and
     screenshot set into a `docs/qa-*` note (or commit message) as evidence.
  2. Manual: full keyboard-only pass over each page (Tab order, visible focus,
     Escape closes dialogs) and a DevTools contrast check on body text; fix
     only concrete failures.
  3. Manual: seed 10k transactions via a **temporary** DevTools snippet
     (removed before commit, per OOS-21) and confirm search/filter/edit still
     feel instant; note the measured interaction times.
- **DoD:** Evidence (summary + screenshots) recorded; any WCAG/perf fix is
  isolated and small; lint/build pass.
- **Verify:** Re-run the harness `summary`; `npm run lint`; `npm run build`.

---

## FR-05 — Deploy the current build over HTTPS (choose host, document, ship)

- **PRD:** §12.2 (DLV-01, DLV-02), OI-06/OI-11 (host/domain/URL — client
  decision pending).
- **Goal:** The built app is served from a live HTTPS URL and the README
  documents the deploy steps and the URL.
- **Context:** There is no host decision yet (OI-11). Once the client picks
  one (GitHub Pages / Netlify / Vercel), configure the host: set the Vite
  `base` to the deployed path if needed, add a `deploy`/`predeploy` script,
  push the build, and record the URL in the README. Until then the task is
  blocked on OI-11 — prepare only the README "Deployment" placeholders.
- **Files to touch:** `vite.config.js` (base), `package.json` (scripts + a
  host CI config), `README.md` (Deployment section).
- **Implement:**
  1. Add `predeploy` (`npm run build`) and `deploy` scripts for the chosen
     host plus the host's publish config.
  2. Set `base` to match the hosted path (or `./` relative if root).
  3. Ship and verify trivially: load the URL, run the whole add/delete/settings
     cycle, confirm persistence after reload, record the URL in the README.
- **DoD:** Live HTTPS URL serves the app; end-to-end add/delete/persist works
  there; README documents commands + URL; build passes.
- **Verify:** Load the URL; repeat a Settings backup/restore cycle there;
  `npm run build`.

---

# Phase: Backend functionality that supports the frontend (V2-forward design)

V1 intentionally has **no backend** (PRD ARC-01..03, SEC-04, OOS-04): the app
is a static SPA over `localStorage`, keyed per account. These tasks therefore
**specify and scaffold** the backend the frontend is already shaped for
(ARC-04), without adding any network layer to V1. Deliverable is design +
isolated modules + tests, not a live server.

---

## BE-01 — Write the API contract document that the data model already maps to

- **PRD:** ARC-04, ARC-13 (choose and document the stack), DAT-01..DAT-03.
- **Goal:** A `docs/api-contract.md` describing the REST/JSON surface that a
  future backend would expose, derived 1:1 from the existing data model.
- **Context:** The frontend already stores relational-shaped records
  (`transactions`, `categories` with `id`/`createdAt`/`updatedAt`; per-account
  keys `tally:<accountId>:…`; session `tally:session`). The JSON shapes in
  `src/lib/restore-merge.js` and the backup format are the natural endpoint
  payloads.
- **Files to touch:** `docs/api-contract.md` (new, docs only).
- **Implement:**
  1. List endpoints: `GET/PUT /api/user/:id/transactions`,
     `…/categories`, `…/settings`, plus `POST /api/backup/export` and
     `POST /api/backup/import` (mirroring the current backup two-phase
     preview→apply).
  2. Define each payload using the existing field names and shapes (from the
     backup JSON: `format: "tally-backup"`, version, currency, categories,
     transactions) so the UI merge rules apply unchanged.
  3. Note auth (see BE-03) and the schema-versioning strategy (DAT-05).
- **DoD:** The contract references the real field names/types in the codebase
  (no invented shapes); each existing UI write maps to one endpoint; docs
  only — lint/build unaffected.
- **Verify:** Grep the doc's field names against `restore-merge.js` to confirm
  they match; `npm run lint`.

---

## BE-02 — Extract the merge/restore rules into a backend-testable pure module

- **PRD:** BAK-03 (merge by id, newer `updatedAt` wins), BAK-05 (category
  merge by lower-cased `type:name`), CAT-06 (delete category moves txns to
  "Other").
- **Goal:** The restore-merge logic (currently inside `store.jsx` and already
  partially in `restore-merge.js`) is fully pure and covered by tests, so a
  server can implement the exact same rules.
- **Context:** `src/lib/restore-merge.js` already holds pure merge functions
  and there is a test file (`src/lib/__tests__/restore-merge.test.js`)
  covering id-merge/updatedAt/category-name/case-insensitivity. Any parity
  gaps (e.g. the `applyRestore` commit step in `store.jsx`) should be
  extracted into the same module so UI and API share one implementation.
- **Files to touch:** `src/lib/restore-merge.js` (extract any remaining inline
  merge from `store.jsx`), `src/lib/store.jsx` (call the extracted function),
  `src/lib/__tests__/restore-merge.test.js` (extend).
- **Implement:**
  1. Move any inline apply/merge logic from `store.jsx` into `restore-merge.js`
     as pure functions (`importJson`, `applyRestore`, etc.).
  2. Extend tests to cover the newly moved functions.
- **DoD:** UI behavior is unchanged (same merge outcome); all logic that a
  backend would reuse lives in the pure module; `npm test`, lint, build pass.
- **Verify:** `npm test`; `npm run lint`; `npm run build`.

---

## BE-03 — Specify and (optionally stub) the auth service behind Google Workspace

- **PRD:** ACC-09, ACC-10 (real Google Workspace via GIS), SEC-02/SEC-03
  (OAuth), OI-05 (client ID pending).
- **Goal:** A documented server-side auth design: verify the Google ID token
  server-side (e.g. via the tokeninfo endpoint or the client library),
  extract the claimed email, and enforce the `@northwind.co` domain gate on
  the server (not just the UI).
- **Context:** The frontend already gates by domain in `SignIn.jsx`
  (`@northwind.co`) and reads a `VITE_GOOGLE_CLIENT_ID`. The backend would
  re-verify the same token and claim. This task is **design + optional stub
  only** (no live server in V1) and is blocked on OI-05 until a real client
  ID exists.
- **Files to touch:** `docs/api-contract.md` (§Auth — document token flow and
  the 401/403 mapping), optionally `src/lib/google-signin.js` (no change
  expected).
- **Implement:**
  1. Document: client sends `id_token`/credential; server verifies audience
     (the installed client ID) and `hd`/email domain; non-domain → 403 with
     the same message the UI shows.
  2. Note the flow is behind a feature flag so V1 simulated mode is untouched.
- **DoD:** The contract describes the exact 200/401/403 behavior and which
  claims are required; UI change is zero; lint/build pass.
- **Verify:** Read the Auth section with a reviewer; `npm run lint`.

---

## BE-04 — Persist data server-side (multi-device sync + backup) as an adapter

- **PRD:** BAK-01..BAK-07 (backup/restore), ARC-04 (storage seam), OI-10
  (multi-device sign-off pending).
- **Goal:** A reference adapter that swaps `localStorage` for a server
  endpoint, reusing the already-certified restore-merge rules for
  reconciliation, without changing the UI.
- **Context:** All persistence flows through `src/lib/storage.js` (the single
  seam) into `src/lib/store.jsx`. `Arc-04` says such a swap must be possible
  with no UI change. Because V1 ships localStorage-only (OOS-04), this task
  produces the **adapter stub + tests** that prove the seam works, behind a
  flag — no production server.
- **Files to touch:** `src/lib/storage.js` (add an optional
  `apiAdapter`/flag), `src/lib/restore-merge.js` (reuse for reconciliation),
  `src/lib/__tests__/` (tests using a fake adapter), `.env.example`
  (`VITE_BACKEND_URL` placeholder). No default behavior change.
- **Implement:**
  1. Introduce an interface `{ load(userId), save(userId, payload) }` with the
     localStorage implementation as the default.
  2. Add a test-only fake handling merge conflicts via `restore-merge` (newer
     `updatedAt` wins) to prove the seam is backend-ready.
- **DoD:** With the flag off, behavior is byte-identical to today; with the
  flag on (tests only), reads/writes round-trip through the adapter and merge
  rules; `npm test`, lint, build pass.
- **Verify:** `npm test`; code review that no UI file changed;
  `npm run lint`.

---

## BE-05 — Security hardening notes: keep data device-local and never leak backup content

- **PRD:** SEC-04 (local-only storage), SEC-06 (frontend "does not send any
  data"), ACC-09 (Google OAuth), OOS-20 (encryption not in V1).
- **Goal:** A short, reviewed checklist confirming the frontend still sends
  nothing anywhere unless a user opts in, plus explicitly documented
  caveats for the backup file (unencrypted by design, contains real data —
  OOS-20) and for any future backend.
- **Context:** `src/lib/storage.js` + `store.jsx` are the only I/O paths and
  both are localStorage-only today; there is no network layer in the bundle.
- **Files to touch:** `docs/security-notes.md` (new, docs only).
- **Implement:**
  1. Document: V1 sends no data (can be verified by `grep fetch/axios` absent
     in src); backups are plaintext JSON by design (OOS-20) — warn the user.
  2. Note the future backend must do server-side token verification (BE-03)
     and never trust the client's claimed email.
- **DoD:** The notes are accurate against the current code (verify the
  no-network claim with a grep); docs only; lint/build pass.
- **Verify:** `grep -rn "fetch\|axios\|XMLHttpRequest" src` is empty;
  `npm run lint`.

---

# Phase: Connecting the frontend to the backend

Bridges the gap between the SPA's storage seam and the documented backend,
still without shipping a server in V1. The output is a switchable storage
adapter + integration behavior that flips on only when a backend flag is set.

---

## CONN-01 — Storage-layer adapter with backend flag (swap localStorage ↔ API)

- **PRD:** ARC-04 (seam must allow swap), RP-14 (deploy), OI-06/11 (host).
- **Goal:** `src/lib/storage.js` becomes an adapter factory: the default
  remains localStorage; when `VITE_BACKEND_URL` is provided, it talks to the
  API contract from BE-01. Both expose the identical
  `{ load(userId), save(userId, payload) }` surface so `store.jsx` never
  changes.
- **Context:** Built on BE-04's stub interface. No UI change; this is the
  mechanical swap the PRD requires.
- **Files to touch:** `src/lib/storage.js`, `.env.example`, `src/lib/__tests__/`
  (adapter selection tests), no page/component changes.
- **Implement:**
  1. Read `VITE_BACKEND_URL`; if set, construct the API-backed adapter (fetch
     + JSON), else the existing localStorage adapter.
  2. Keep the JSON shape identical (backup format), so `restore-merge` rules
     apply on the client for offline/two-phase restore.
- **DoD:** No flag → identical behavior; flag set (tests, or a local stub
  server) → reads/writes hit the endpoint with the contract's paths and
  bodies; `npm test`, lint, build pass.
- **Verify:** Add a vitest case with a mocked `fetch`; `npm test`;
  `npm run lint`.

---

## CONN-02 — Sync reconciliation on load (merge server + local by updatedAt)

- **PRD:** BAK-03/BAK-05 rules, ARC-04, DAT-02 (updatedAt).
- **Goal:** On sign-in/load with a backend flag, the client merges its
  offline localStorage records with the server's using the exact
  restore-merge rules (id-match, newer `updatedAt` wins, categories by
  lower-cased `type:name`) instead of blindly overwriting.
- **Context:** The pure merge rules are already in `restore-merge.js` (BE-02);
  this wires them into the load path only when the backend adapter is active.
- **Files to touch:** `src/lib/store.jsx` (load path, behind the adapter
  flag), `src/lib/restore-merge.js` (reuse), `src/lib/__tests__/`.
- **Implement:**
  1. When the backend adapter is active, fetch server transactions/categories,
     merge with local via `restore-merge`, and persist the merged result both
     sides.
  2. Keep the offline-only path byte-identical.
- **DoD:** With the flag on and a stub server holding differing data, the app
  shows the merged set per the rules; offline path unchanged; tests pass.
- **Verify:** Unit test with crafted server vs local payloads; `npm test`;
  `npm run lint`.

---

## CONN-03 — Backup/restore round-trip against the backend (two-phase, undo-safe)

- **PRD:** BAK-02..BAK-04 (two-phase preview → apply), BAK-05 (merge),
  SET-06 (clear data).
- **Goal:** With the backend flag on, the two-phase "Restore" flow reads a
  backup from the server (or uploaded file) and applies it exactly as today —
  preview first, commit only on confirm — now merged server-side per
  restore-merge rules.
- **Context:** The Settings two-phase restore already exists for files (RP-02
  verified). This adds a server-fetch variant behind the same flag, reusing
  the identical confirm/cancel flow so no UI changes.
- **Files to touch:** `src/lib/store.jsx` (restore path branch), `src/lib/restore-merge.js`
  (reuse), `src/pages/Settings.jsx` (only if the backend variant needs a new
  trigger — prefer reuse).
- **Implement:**
  1. Behind the flag, "Restore" can fetch the server backup, parse, stage,
     and require the same confirmation before applying; cancel reverts nothing
     (same as today's file flow).
  2. Update the summary counts (added/skipped/updated) exactly as BAK-04.
- **DoD:** Preview shows counts; confirm applies; cancel changes nothing; no
  UI regression in the file path; tests pass.
- **Verify:** Stub-server + vitest for the branch; manual file-path recheck at
  5173; `npm test`; `npm run lint`.

---

## CONN-04 — Feature-flag guard: default is fully offline; enable switch documented

- **PRD:** ARC-03 (no external dependency), DLV-06 (change requests), OI-06/11.
- **Goal:** The backend behavior compiled above is **always off by default**;
  a single documented flag (`VITE_BACKEND_URL`) turns it on, and the README +
  `.env.example` explain the contract URL and what opting in means for the
  data (now sent off-device, SEC-04 caveat).
- **Context:** Every CONN/BE task is additive and flag-guarded; this task
  confirms the guard is airtight at runtime and that the docs tell the user
  exactly what turning the flag on does to their data.
- **Files to touch:** `src/lib/constants.js`/`storage.js` (flag read),
  `README.md` (Backend section), `.env.example`.
- **Implement:**
  1. Grep for `VITE_BACKEND_URL`; confirm every branch is replaced by the
     flag and the default localStorage path has zero new dependencies.
  2. Document the security note (SEC-04: enabling sends data off-device) and
     the expectation that V1 ships offline-only.
- **DoD:** Default build has no fetch/axios in `src` (grep empty); turning the
  flag on in a local .env enables the adapters and they pass the CONN tests;
  README updated; lint/build pass.
- **Verify:** `grep -rn "fetch\|axios" src` empty on default; flip the flag in
  a local .env and run the CONN vitest stubs; `npm run lint`; `npm run build`.

---

# Suggested order

1. **FR-01 → FR-02 → FR-03** (frontend gaps; quick and independent; run after
   RP-15 housekeeping so the tree is clean).
2. **FR-04** (QA evidence; run before FR-05 so deploy ships the verified
   build).
3. **FR-05** (deploy; last, after QA evidence exists — blocked on OI-11 host
   decision).
4. **BE-01 → BE-05** (docs/design; low risk any time).
5. **BE-02** (pure-module extraction; the enabling refactor for CONN-02/03).
6. **BE-03** (auth design; blocked on OI-05 client ID for any real testing).
7. **BE-04 → CONN-01 → CONN-02 → CONN-03** (adapter + load-merge + restore;
   build incrementally, each on the previous; all gated by the flag).
8. **CONN-04** (guard + docs; run last to confirm the flag is airtight).