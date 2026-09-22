# Personal Expense Tracker — Product Requirements Document (PRD)

| | |
|---|---|
| **Document** | PRD v1.0 |
| **Status** | Draft for client sign-off |
| **Date** | 21 September 2026 |
| **Product** | Personal Expense Tracker — internal web app for company staff |
| **Basis** | Client SRS v1.0 and the requirements discussion (decisions D-01 to D-23, baseline defaults DF-01 to DF-27, see Section 18) |

---

## 1. Document Overview

### 1.1 Purpose
This PRD is the single source of truth for Version 1 of the Personal Expense Tracker, from design approval through delivery and ongoing maintenance. It states what the system includes, what it explicitly excludes, and the rules it must follow. Anything not stated here is not part of V1 unless added through the change process in Section 12.4.

### 1.2 Source documents and precedence
- **Client SRS v1.0** (Personal_Expense_Tracker_SRS.pdf). The copy available when this PRD was written began partway through SRS Section 1, so SRS Sections 1.1 to 1.3 (purpose, scope, audience) were only partially seen. See OI-12.
- **Requirements discussion**: 23 explicit decisions (D-01 to D-23) and 27 baseline defaults (DF-01 to DF-27) recorded in Section 18.
- **Precedence:** where this PRD and the SRS differ, this PRD prevails. Every difference is listed in Section 15.

### 1.3 Conventions
- **Keywords:** MUST = mandatory for V1. SHOULD = expected unless a documented reason exists. MAY = optional.
- **Requirement IDs** use the form PREFIX-nn and are stable and never reused. Prefixes: ARC (architecture), ACC (access), DAT (data), BR (business rules), DSH (dashboard), PER (period), TXN (transactions), LST (list, search, filter), UPC (upcoming), CAT (categories), RPT (reports), BAK (backup), SET (settings), ONB (first run and empty states), FBK (feedback), NAV (navigation), UXD (design), NFR (non-functional), TST (testing), AC (acceptance), DLV (delivery), SUP (support), SEC (security and privacy), OOS (out of scope), OI (open item), RISK (risk).
- **Status tags** at the end of a requirement:
  - `[A]` Agreed: an explicit decision from the requirements discussion (D-xx).
  - `[D]` Baseline default: proposed during the discussion or derived to close a gap, with no override given. It stands unless changed.
  - `[C]` Needs client confirmation before it is final. Each is listed in Section 16.
  - No tag: taken from the SRS or a direct consequence of a tagged decision.
- Section numbers and IDs are both valid references. Prefer IDs (for example, "see UPC-03").

### 1.4 Glossary
| Term | Meaning |
|---|---|
| User / staff member | A person at the company who signs in with their Google Workspace account. |
| Transaction | A recorded income or expense. |
| Income / Expense | Money received / money spent. |
| Category | A label on a transaction (for example Food, Salary). |
| Counted transaction | A transaction dated today or earlier. Only counted transactions affect totals, balance, and charts (UPC-02). |
| Upcoming transaction | A transaction dated after today. It appears in the list only (UPC-03). |
| Period | The month or year the user is viewing (PER-01). |
| Net for the period | Counted income minus counted expenses within the selected period (BR-01). |
| Total balance | Counted income minus counted expenses across all dates (BR-01). |
| Backup file | A JSON file the user downloads containing their data (BAK-01). |
| Design direction | The set of key-screen designs the client approves before the build (UXD-02). |
| Change request | A written, estimated, and approved request to alter agreed scope (DLV-06). |

---

## 2. Product Overview

### 2.1 Product summary
A responsive web app that lets each staff member record and review their own income and expenses privately. Access is through company Google sign-in. All financial data stays in the user's own browser. No server stores it and the company cannot see it. `[A]` D-01, D-02, D-03

### 2.2 Background and problem
The client asked for a simple, reliable, visually clear tool that makes everyday money management easy, prioritizing accurate recording, automatic calculations, useful summaries, and a responsive experience (SRS Section 14). It is provided as an internal tool for the company's staff. `[A]` D-01

### 2.3 Target users
- Company staff with basic web skills who want to track their own personal finances.
- Users access the app from desktop, tablet, and mobile browsers.
- Financial terminology must stay simple and familiar (SRS 2.3).

### 2.4 Goals
1. Accurate recording of income and expenses.
2. Automatic, correct totals and balances.
3. Clear summaries and charts.
4. Privacy: each user's data stays on their own device, separate from other users.
5. Low risk of data loss through built-in backup and restore.
6. A structure that allows a later backend, accounts, and more reports without redesigning the core (SRS Section 14).

### 2.5 Non-goals
V1 is not a company expense-reporting, reimbursement, accounting, banking, or budgeting product. The full list is in Section 3.2.

### 2.6 Success criteria
V1 is successful when every acceptance criterion in Section 11.2 passes and the client signs off at the final review. Adoption is not measured, because no analytics are collected by default (SEC-05, OI-01).

### 2.7 Assumptions
- All intended users have a Google Workspace account in the company domain.
- Users use a current browser (ARC-09) with a reasonably accurate device clock.
- A typical user holds up to 10,000 transactions (ARC-05).
- Users understand that data lives on their own device (ONB-01).

### 2.8 Constraints
- No backend, server, or database for transactions (ARC-01).
- English only (UXD-08).
- Data is per browser and per device, with no cross-device sync (OOS-04).

### 2.9 Dependencies
- The client creates the Google sign-in credentials and supplies the company domain (ACC-09).
- The developer provides hosting (ARC-02).
- A named client approver is available for the design direction and final review (DLV-03).

---

## 3. Scope

### 3.1 In scope (V1)
| Area | Summary | Section |
|---|---|---|
| Access | Google Workspace sign-in, company domain only, per-user data separation | 6 |
| Transactions | Add, edit, delete income and expenses with validation | 8.3–8.5 |
| List | View, sort, search, filter | 8.6–8.7 |
| Upcoming | Future-dated transactions, counted only once their date arrives | 8.8 |
| Categories | Predefined expense and income categories, custom expense categories | 8.9 |
| Dashboard | Period totals, net for the period, total balance, recent transactions, chart | 8.1 |
| Periods | Month picker and full-year view | 8.2 |
| Reports | Category breakdown, income vs expenses, spending trend | 8.10 |
| Backup | JSON backup, merge restore, last-backup date and reminder | 8.11 |
| Settings | Display currency, categories, backup, sign-out, reset | 8.12 |
| Experience | First-run guidance, empty states, feedback, help page | 8.13–8.15 |
| Design | Developer-designed clean, modern UI; design direction approval | 9 |
| Platform | All major browsers on desktop and mobile, English only | 5, 9 |
| Maintenance | Ongoing maintenance and support after launch | 13 |

### 3.2 Out of scope (V1)
These are explicitly excluded. Adding any of them requires a change request (DLV-06).

| ID | Excluded item | Note |
|---|---|---|
| OOS-01 | Company or business expense reports, reimbursements, approval workflows, accounting or ERP integration | Personal finance only `[A]` D-02 |
| OOS-02 | Any manager or admin view of staff data; team or shared budgets | Data is private per person `[A]` D-02 |
| OOS-03 | Login methods other than Google; guest or external users; roles and permissions; user-management screens | `[A]` D-04 |
| OOS-04 | Any server, database, or API for transactions; cross-device sync; cloud storage of financial data | `[A]` D-03, D-05 |
| OOS-05 | Server-side enforcement of company-only access | UI-level gate only `[A]` D-06 |
| OOS-06 | Multiple accounts or wallets, transfers between accounts, opening balances, reconciliation with bank balances | `[D]` |
| OOS-07 | Currency conversion, exchange rates, a different currency per transaction | Display label only `[A]` D-13 |
| OOS-08 | Custom income categories; category icons; subcategories; sharing categories between users | `[A]` D-09, D-11 |
| OOS-09 | Custom date ranges; weekly, quarterly, or fiscal-year views | `[A]` D-14 |
| OOS-10 | Comparison with previous period; forecasts; budgets and budget alerts | `[A]` D-15 |
| OOS-11 | Recurring transactions; reminders or notifications about upcoming items | `[D]` |
| OOS-12 | Attachments, receipt photos, tags, merchant autocomplete, amount-range filter | `[D]` |
| OOS-13 | Undo after delete; bulk delete | `[D]` |
| OOS-14 | CSV or PDF export; automatic or scheduled backup; cloud backup; email or push notifications | JSON backup only `[A]` D-07 |
| OOS-15 | Translations, language switcher, right-to-left layouts | English only `[A]` D-18 |
| OOS-16 | Dark mode; custom logo or illustration design; compliance with a brand guideline document; customizable dashboard | `[A]` D-19 |
| OOS-17 | Native iOS or Android apps; Internet Explorer and browsers older than the latest two versions; print layouts | `[A]` D-21 |
| OOS-18 | Offline use and installable-app (PWA) behavior | Sign-in needs a connection `[D]` |
| OOS-19 | Bank-account synchronization, online payments, investment tracking, tax filing, multi-user collaboration, financial advice, access to bank credentials | From SRS Section 10 |
| OOS-20 | Analytics, usage dashboards, error-reporting services, third-party tracking scripts | Default; see SEC-05 `[C]` OI-01 |
| OOS-21 | Sample or demo data shipped with the app; guided tutorials | `[D]` |
| OOS-22 | Recovery of user data lost from a device (only the user's own backup file can restore it) | See SUP-04 |

### 3.3 Boundary clarifications
- **JSON backup is not "export."** The user can back up and restore their data as JSON. CSV and PDF export remain out of scope (OOS-14).
- **Display currency is not multi-currency.** The user picks a label. Amounts are never converted (OOS-07).
- **Future-dated is not recurring.** A user can enter a future-dated transaction manually. The app never generates transactions or reminders (OOS-11).
- **Google sign-in is not an account system.** It only gates access. The app stores no financial data with Google or on any server (OOS-04).
- **Maintenance is not new features.** Maintenance covers defects and upkeep only (SUP-02, SUP-03).
- **Custom categories apply to expenses only.** Income uses a fixed list (CAT-02, OOS-08).

### 3.4 Status of the SRS "Future Enhancements"
| SRS item | V1 status |
|---|---|
| User accounts and secure cloud sync | Out of scope (OOS-04). Google sign-in gates access only. |
| Backend database (MySQL, PostgreSQL) | Out of scope. The storage layer is designed so one can be added later (ARC-04). |
| Export to CSV/PDF | Out of scope. JSON backup and restore are in scope (BAK). |
| Budget limits and alerts | Out of scope (OOS-10). |
| Recurring transactions | Out of scope (OOS-11). |
| Multiple currencies and exchange rates | Out of scope. Display-currency label only (SET-02). |
| More advanced monthly and yearly reports | Out of scope beyond RPT. |
| Dark mode and customizable dashboard | Out of scope (OOS-16). |
| Secure backup and restore | Partly in scope: JSON backup and restore. Encryption is not included (SEC-09). |

---

## 4. Stakeholders and Responsibilities

| Party | Responsibilities |
|---|---|
| **Client (the company)** | Supplies the company Google Workspace domain and creates the Google sign-in credentials (ACC-09). Names an approver and a contact (OI-10). Approves the design direction, performs the final review, answers open items (Section 16), signs off on the SRS changes (Section 15). |
| **Client approver** | One named person who gives the design-direction approval and final acceptance. Name to be confirmed (OI-10). |
| **Developer** | Designs the UI, builds, tests, hosts, deploys, documents, and maintains V1 (Sections 12 and 13). |
| **Staff users** | Use the app for their own private finances. Responsible for keeping their own backups. |

---

## 5. Architecture and Technical Constraints

- **ARC-01** The app MUST be a static front-end web application. It MUST NOT include a server, database, or API for transactions. `[A]` D-03, D-05
- **ARC-02** The Developer hosts the app on their own account or a static hosting service and serves it over HTTPS. Domain, URL, and hosting-account ownership terms are confirmed in OI-11 and OI-06. `[A]` D-05
- **ARC-03** All financial data MUST be stored in the browser on the user's device and MUST NOT be transmitted to any server. `[A]` D-03
- **ARC-04** All reading and writing of stored data MUST go through a storage layer, so a backend can replace it later without changing the UI. Stored records use unique IDs and timestamps (DAT-01). `[D]` DF-13
- **ARC-05** Storage MUST support at least 10,000 transactions per user with the performance in NFR-01. The storage mechanism is the Developer's choice and MUST be recorded in the README. `[D]` DF-04
- **ARC-06** Stored data MUST carry a schema version number and be upgraded by migrations. If stored data cannot be read, the app MUST NOT erase it. It shows an error and offers restore from a backup. `[D]` DF-15
- **ARC-07** The app MUST request persistent storage from the browser where supported, to reduce automatic clearing. `[D]`
- **ARC-08** Changes made in one open tab MUST appear in other open tabs of the same user. If two tabs change the same data, the last write wins. `[D]` DF-14
- **ARC-09** Supported browsers: the latest two versions of Chrome, Edge, Firefox, and Safari, on desktop and mobile. `[A]` D-21
- **ARC-10** The app MUST NOT load analytics or third-party tracking scripts. The only external service is Google Sign-In. `[C]` OI-01
- **ARC-11** All user-facing text MUST be kept in one central place to make later translation cheap. `[D]`
- **ARC-12** Colors, typography, and spacing MUST be defined as design tokens. `[D]`
- **ARC-13** The technology stack is not prescribed. The Developer chooses one that meets this PRD and records the choice and setup steps in the README.

---

## 6. Access and Authentication

### 6.1 Sign-in
- **ACC-01** A user who is not signed in MUST see only a sign-in screen with a "Sign in with Google" action. No app content or data is shown. `[A]` D-03, D-04
- **ACC-02** Only accounts in the company's Google Workspace domain are admitted. Any other account is refused with a clear message and stays signed out. `[A]` D-04
- **ACC-03** The allowed domain MUST be a single configuration value.

### 6.2 Session and sign-out
- **ACC-04** Settings MUST offer sign-out. Signing out ends the session but MUST NOT delete local data. `[D]` DF-16
- **ACC-05** If the sign-in session ends or cannot be verified, the user sees the sign-in screen. Stored data stays untouched and reappears after signing in again. `[D]`

### 6.3 Data separation
- **ACC-06** Stored data MUST be kept separately for each Google account, so two people using the same browser profile never see each other's data. `[D]` DF-13
- **ACC-07** The app uses only the account's display name, email, and account ID: name and email for display, account ID for data separation. No other profile data is read or stored. `[D]` DF-24

### 6.4 Enforcement level
- **ACC-08** Access restriction is a **UI-level gate**. It controls what the app shows but is not a server-enforced security boundary, because no financial data is on any server. `[A]` D-06
- **ACC-09** The Client MUST create the Google sign-in credentials as an "Internal" app in the company's own Google Cloud organization and provide the client ID and company domain to the Developer. `[C]` OI-05

### 6.5 Exclusions
Other login methods, guests, roles, permissions, and user management are out of scope (OOS-03). There is no admin or manager access to any user's data (OOS-02).

---

## 7. Data Model and Business Rules

### 7.1 Transaction
| Field | Type | Required | Rules |
|---|---|---|---|
| id | unique string (UUID) | Yes | Generated at creation. Never changes. |
| type | "income" or "expense" | Yes | |
| amount | integer in hundredths of the currency unit | Yes | Greater than zero, at most 999,999,999.99 (DAT-02). |
| categoryId | reference to a category | Yes | Must be valid for the type (BR-08). |
| date | calendar date YYYY-MM-DD | Yes | No time of day, no time zone (DAT-03). |
| note | text | No | At most 100 characters, trimmed. The SRS calls this "description". |
| createdAt | timestamp | Yes | Set by the system. Used to order same-day transactions. |
| updatedAt | timestamp | Yes | Set by the system on each edit. Used in restore (BAK-03). |

- **DAT-01** Records use unique IDs and timestamps so local data can later migrate to a backend. `[D]`
- **DAT-02** All amounts have exactly two decimal places regardless of currency, stored as integers to avoid rounding errors. `[D]` (see SET-03)
- **DAT-03** A transaction date is a calendar date. "Today" means the current date on the user's device. Same-day transactions are ordered by createdAt. `[D]` DF-01
- **DAT-04** Categories are linked to transactions by ID, so renaming a category updates all its transactions.

### 7.2 Category
Fields: id, name, type ("expense" or "income"), isPredefined, createdAt.

### 7.3 Predefined categories
- **Expense:** Food, Transport, Housing, Utilities, Shopping, Entertainment, Health, Education, Other. `[D]`
- **Income:** Salary, Freelance, Gift, Refund, Other. `[D]`
- Predefined categories cannot be renamed or deleted. The expense "Other" is the fallback for deleted custom categories (CAT-06).

### 7.4 User settings
Fields: display currency, last backup date, backup-reminder snooze date, schema version.

### 7.5 Business rules
- **BR-01** **Net for the period** = counted income − counted expenses within the selected period. **Total balance** = counted income − counted expenses across all dates. There is no opening balance, so Total balance starts at zero. `[A]` D-12
- **BR-02** An income increases total income and the balance. An expense increases total expenses and decreases the balance.
- **BR-03** Only counted transactions (date ≤ today) affect any total, balance, or chart. `[A]` D-17
- **BR-04** Reports and charts MUST use the same records as the transaction list, restricted to counted transactions. `[A]` D-17
- **BR-05** Editing or deleting a transaction MUST recalculate all affected totals, balances, and charts.
- **BR-06** No transaction may be duplicated by a page refresh or a repeated submit. `[D]` DF-09
- **BR-07** A refund is recorded as income with the category Refund, never as a negative expense. `[D]`
- **BR-08** Every transaction has a category valid for its type: expenses use expense categories, income uses income categories. `[A]` D-11
- **BR-09** A negative Total balance or Net is allowed and displayed clearly. `[D]`
- **BR-10** The amount is always positive. The type decides its effect. `[D]`
- **BR-11** The app never requests or stores bank credentials or payment-card information.

---

## 8. Functional Requirements

### 8.1 Dashboard
- **DSH-01** The dashboard MUST show, for the selected period (8.2): Total income, Total expenses, and Net for the period, counting only counted transactions.
- **DSH-02** The dashboard MUST also show Total balance (all dates) as a separate figure that does not change with the selected period. `[A]` D-12
- **DSH-03** The two figures MUST have distinct labels (for example "Net this period" and "Total balance"), and the selected period is named. `[D]`
- **DSH-04** Negative values MUST show a minus sign and a distinct style. Color is never the only signal. `[D]`
- **DSH-05** The dashboard MUST show a quick view of the most recent counted transactions with a link to the full list. The count is set in the design direction.
- **DSH-06** The dashboard MUST include at least one visual summary of expenses: spending by category for the selected period.
- **DSH-07** The dashboard MUST update automatically after any change to transactions, with no page reload.
- **DSH-08** For an empty period, or a period with only upcoming transactions, the dashboard shows the matching empty state (ONB-02).

### 8.2 Period selection
- **PER-01** Two period types: **Month** (chosen with a month picker) and **Year** (the full calendar year, January to December). `[A]` D-14
- **PER-02** The default period is the current month. `[D]`
- **PER-03** The selected period is shared across the Dashboard, Reports, and Transactions list. `[D]`
- **PER-04** The Transactions list additionally offers **All time**. `[D]`
- **PER-05** Users may select any month or year, including future ones. `[D]`
- **PER-06** Custom date ranges and weekly, quarterly, or fiscal-year views are out of scope (OOS-09).

### 8.3 Add transaction
- **TXN-01** The Add form MUST contain: Type (Income or Expense, default Expense), Amount, Category, Date (default today), and Note (optional). `[D]` DF-06
- **TXN-02** The Category choices depend on the type: expense categories (predefined and custom) or the fixed income list. `[A]` D-11
- **TXN-03** Validation: type, amount, category, and date are required. The amount must be a number greater than zero, with at most two decimal places and at most 999,999,999.99. The note is at most 100 characters and is trimmed. Zero, negative, and non-numeric amounts are rejected. `[D]`
- **TXN-04** Each invalid field MUST show its own clear message next to the field, and nothing is saved until all fields are valid.
- **TXN-05** Any valid calendar date is accepted, including future dates (8.8).
- **TXN-06** The form offers "Save" and "Save and add another". `[D]` DF-06
- **TXN-07** After saving, a success message appears and the dashboard, list, and reports update automatically.
- **TXN-08** Double-clicking Save, submitting twice, or refreshing MUST create at most one transaction. `[D]` DF-09

### 8.4 Edit transaction
- **TXN-10** Editing uses the same form, pre-filled, with the same validation. Saving replaces the previous values and recalculates all totals and charts.
- **TXN-11** If the user changes the type, they MUST choose a category valid for the new type before saving. `[D]` DF-07
- **TXN-12** Editing updates updatedAt and leaves createdAt and the ID unchanged.
- **TXN-13** Upcoming transactions can be edited like any other.

### 8.5 Delete transaction
- **TXN-20** Deleting MUST ask for confirmation, showing the date, category, and amount of the transaction. `[D]` DF-08
- **TXN-21** After confirmation the transaction is permanently removed and all totals and charts update.
- **TXN-22** Undo and bulk delete are out of scope (OOS-13).
- **TXN-23** A deleted transaction can only come back through merge restore from an older backup (BAK-03).

### 8.6 Transaction list
- **LST-01** Each transaction shows date, type, category, note, and amount.
- **LST-02** The default order is date, newest first, with ties ordered by creation time. Date and amount are sortable. `[D]` DF-01
- **LST-03** Desktop shows a table. Mobile shows cards. `[D]` DF-02
- **LST-04** The list loads 50 rows at a time with a "Load more" action and MUST stay responsive with 10,000 transactions. `[D]` DF-04
- **LST-05** Upcoming transactions carry an "Upcoming" badge (UPC-04).
- **LST-06** The list MAY show a separate "Upcoming" total for the current view. It is never added to the balance. `[D]`
- **LST-07** Each transaction offers Edit and Delete.

### 8.7 Search and filter
- **LST-10** Search matches part of the note or the category name, ignoring upper and lower case. `[D]` DF-03
- **LST-11** Filters: type, category, and period (month, year, or All time).
- **LST-12** Search and filters combine (all must match). `[D]` DF-03
- **LST-13** Filters persist while the user navigates within the app but are not stored in the URL. `[D]` DF-05
- **LST-14** If nothing matches, an empty state with a "Clear filters" action appears (ONB-02).
- **LST-15** The list updates immediately as filters change.
- **LST-16** An amount-range filter is out of scope (OOS-12).

### 8.8 Upcoming (future-dated) transactions
- **UPC-01** A transaction MAY be dated in the future. `[A]` D-16
- **UPC-02** A transaction is **counted** if its date is today or earlier, and **upcoming** if later. "Today" is the date on the user's device. `[A]` D-16
- **UPC-03** Upcoming transactions MUST be excluded from the balance, the period totals, and every chart. They appear only in the transaction list until their date arrives. `[A]` D-17
- **UPC-04** Upcoming transactions show an "Upcoming" badge. `[D]`
- **UPC-05** A transaction becomes counted automatically when its date arrives, with no user action. The app MUST re-evaluate when the date changes while it is open. `[D]`
- **UPC-06** Upcoming transactions are included in backups and restores.
- **UPC-07** A period that contains only upcoming transactions shows an empty state that explains why, for example "1 upcoming transaction isn't counted yet". `[D]`
- **UPC-08** Recurring transactions, reminders, and notifications about upcoming items are out of scope (OOS-11).

### 8.9 Categories
- **CAT-01** The predefined expense and income categories in 7.3 are always available and cannot be renamed or deleted. `[D]`
- **CAT-02** Income categories are the fixed predefined list. Users cannot add, rename, or delete them. `[A]` D-11
- **CAT-03** Users MAY add custom **expense** categories. `[A]` D-09
- **CAT-04** A category name is trimmed, not empty, at most 30 characters, and unique among the user's expense categories ignoring upper and lower case. `[D]`
- **CAT-05** Users MAY rename custom categories. Existing transactions follow the new name (DAT-04). `[D]`
- **CAT-06** Users MAY delete custom categories. Their transactions are moved automatically to the expense category "Other". `[A]` D-10
- **CAT-07** The delete confirmation MUST state how many transactions will be moved, for example "14 transactions will be moved to Other". `[D]`
- **CAT-08** A category management screen, reachable from Settings, supports add, rename, and delete. `[D]`
- **CAT-09** Custom categories belong to the individual user, are stored with their data, and are included in backups (BAK-05). `[D]`
- **CAT-10** Custom income categories, icons, subcategories, and sharing are out of scope (OOS-08).

### 8.10 Reports
- **RPT-01** Reports MUST show, for the selected period: total spending, spending by category, income vs expenses, and a spending trend over time. `[A]` D-15
- **RPT-02** Total spending is the sum of counted expenses in the period.
- **RPT-03** The category breakdown counts expenses only and shows each category's amount and share.
- **RPT-04** Income vs expenses compares counted income and counted expenses for the period.
- **RPT-05** The spending trend is shown **by day** in Month view and **by month** in Year view. `[A]` D-15
- **RPT-06** Every chart MUST match the transaction list (BR-04) and MUST update when transactions change (BR-05).
- **RPT-07** Every chart MUST have a text or table alternative that lists the same data. `[D]`
- **RPT-08** If the period has no counted transactions, a useful empty state appears (ONB-02).
- **RPT-09** Chart forms (for example bar, donut, line) are decided in the design direction (UXD-02).
- **RPT-10** Comparison with a previous period, forecasts, and budget-vs-actual are out of scope (OOS-10).

### 8.11 Backup and restore
- **BAK-01** Settings MUST offer "Back up my data", which downloads a JSON file containing all the user's transactions, custom categories, and display currency, plus a format version number and creation timestamp. `[A]` D-07
- **BAK-02** Restore lets the user choose a backup file. The app validates it and rejects corrupted or incompatible files with a clear message. A failed restore changes nothing. `[D]`
- **BAK-03** Restore MUST **merge** into existing data and MUST NOT replace it. Transactions whose ID already exists are skipped. If the same ID exists with different contents, the version with the newer updatedAt is kept. `[A]` D-08 / `[D]` conflict rule
- **BAK-04** Before applying, the app shows a summary (for example "12 added, 30 skipped"), notes that transactions deleted since the backup will come back, and requires confirmation. `[D]`
- **BAK-05** Custom categories in the backup are matched to existing ones by name, ignoring upper and lower case. Missing ones are added, and transactions are linked accordingly. `[D]`
- **BAK-06** If the backup's currency differs from the current setting, a notice is shown and the current setting is kept. `[D]`
- **BAK-07** The last-backup date is stored as a device setting, updated after each successful backup, and is not part of the backup file. Restore never changes it. `[D]`
- **BAK-08** Settings displays the last-backup date, or "Never".
- **BAK-09** A gentle in-app reminder banner appears when 30 days or more have passed since the last backup, or when the user has data and has never backed up. It can be dismissed and does not return for 7 days. `[A]` D-22 / `[D]` timing
- **BAK-10** Creating a backup shows a notice that the file is not encrypted (SEC-09). `[C]`
- **BAK-11** CSV/PDF export, automatic or scheduled backups, cloud backup, and email or push notifications are out of scope (OOS-14).

### 8.12 Settings
- **SET-01** Settings contains: display currency, Categories (CAT-08), backup and restore with last-backup date, the signed-in account with sign-out, Reset all data, and a link to Help. `[D]` DF-16
- **SET-02** The user picks a display currency. It is a label only, with no conversion. Changing it relabels all existing amounts after a warning that nothing is converted. `[A]` D-13 / `[D]` warning
- **SET-03** All amounts use two decimals regardless of the chosen currency. `[D]`
- **SET-04** "Reset all data" deletes the signed-in user's transactions and custom categories and returns settings to defaults. It requires a typed confirmation and is permanent. `[D]` DF-16
- **SET-05** The default or preselected currency and the list of selectable currencies are to be confirmed. `[C]` OI-09

### 8.13 First run and empty states
- **ONB-01** When the user has no transactions, the dashboard invites them to "Add your first transaction" and briefly explains that data lives on this device and should be backed up. There is no tutorial and no sample data. `[D]` DF-10
- **ONB-02** Useful empty states MUST exist for: an empty transaction list, a filter with no results (with "Clear filters"), a period with no counted transactions, and a period with only upcoming transactions. `[D]` DF-11

### 8.14 Feedback
- **FBK-01** Successful actions show a non-blocking message that is also announced to screen readers. `[D]` DF-12
- **FBK-02** Validation errors appear next to the affected field. `[D]` DF-12
- **FBK-03** If storage is unavailable, full, or unreadable, saving is blocked and a clear message explains it. The app never silently loses or overwrites data. `[D]` DF-12
- **FBK-04** Messages use plain language and say what happened and what the user can do.

### 8.15 Navigation and help
- **NAV-01** Main areas: Dashboard, Add Transaction, Transactions, Reports, and Settings, plus the sign-in screen, a Help page, and a not-found page for unknown addresses.
- **NAV-02** The Help page explains that data stays on the user's device and how to back up and restore. The privacy statement is published only once OI-01 is confirmed. `[D]` DF-25 / `[C]`
- **NAV-03** A footer states that the app does not provide financial advice. `[D]` DF-25
- **NAV-04** Each page has a descriptive title.

---

## 9. UI/UX and Design Requirements

- **UXD-01** The Developer designs the UI freely, clean and modern. The client provides no mockups or brand assets. `[A]` D-19
- **UXD-02** **Design direction approval.** Before the build starts, the client approves a design direction covering the key screens: sign-in, Dashboard, Add/Edit Transaction, Transactions, Reports, Categories, and Settings. `[A]` D-20
- **UXD-03** After approval, any change to the approved direction is a change request (DLV-06). The final review checks the build against the approved direction and the acceptance criteria. `[A]` D-20 / `[D]`
- **UXD-04** Design quality is judged on objective criteria: consistent typography, spacing, buttons, form controls, and terminology; accessible contrast; no layout breakage at the widths in UXD-06. `[D]`
- **UXD-05** The UI uses design tokens (ARC-12), a light theme only, an app name, and a favicon. `[D]`
- **UXD-06** Layouts are verified at 360, 768, and 1280 px wide. At 360 px there is no sideways scrolling. Touch targets are at least 44 px. `[D]` DF-19
- **UXD-07** Financial values are displayed consistently using the selected currency label.
- **UXD-08** The interface is English only. Dates display in an unambiguous format such as "21 Sep 2026", and numbers use thousands separators. `[A]` D-18 / `[D]`
- **UXD-09** Income and expense are never distinguished by color alone.
- **UXD-10** Out of scope: dark mode, custom logo or illustration design, brand-guideline compliance, print layouts (OOS-16, OOS-17).

---

## 10. Non-Functional Requirements

### 10.1 Performance
- **NFR-01** Common actions (adding a transaction, filtering) respond within 100 ms under normal use, and first load takes under 3 seconds on a typical office connection. This holds with 10,000 transactions. `[D]` DF-20

### 10.2 Reliability and data integrity
- **NFR-02** Invalid data is never saved. Data survives refresh and browser restarts. No duplicates arise from refresh (BR-06). Unreadable data is never erased (ARC-06).
- **NFR-03** Totals, balances, and charts are always consistent with the transaction list (BR-04).

### 10.3 Accessibility
- **NFR-04** The target is WCAG 2.1 AA: visible form labels, keyboard navigation, focus handling in dialogs, screen-reader announcements for messages, sufficient contrast, text alternatives for charts, and no reliance on color alone. `[D]` DF-18

### 10.4 Usability
- **NFR-05** The interface is usable without technical training and uses simple, familiar financial terms.

### 10.5 Maintainability
- **NFR-06** The project is organized so that new categories, reports, and a backend can be added later: storage layer (ARC-04), design tokens (ARC-12), central text (ARC-11), a README (DLV-02).

### 10.6 Compatibility
- **NFR-07** Browser support is defined in ARC-09 and layout support in UXD-06.

---

## 11. Testing and Acceptance

### 11.1 Approach
- **TST-01** Acceptance is based on SRS Section 12 plus every `[A]` decision and `[D]` default in this PRD. Every requirement ID has a pass/fail test. `[D]` DF-21
- **TST-02** Automated tests cover the calculation and data logic: totals, Net, Total balance, counted vs upcoming, validation, category deletion, and merge restore. `[D]` DF-22
- **TST-03** A manual test pass at each milestone on Chrome, Edge, Firefox, and Safari, including a real iPhone Safari check. `[D]` DF-22
- **TST-04** Responsive checks at the widths in UXD-06, a keyboard-only pass, contrast checks, and a screen-reader spot check.
- **TST-05** Test data is used for testing only and is never shipped (OOS-21). `[D]` DF-23

### 11.2 Acceptance criteria
V1 is accepted when all of the following pass:
- **AC-01** A user can add both income and expense transactions.
- **AC-02** Invalid or incomplete forms cannot be saved.
- **AC-03** Saved transactions remain after refreshing the browser.
- **AC-04** Users can view, edit, search, filter, and delete transactions.
- **AC-05** Income, expense, Net for the period, and Total balance are calculated correctly, counting only transactions dated today or earlier.
- **AC-06** Changing or deleting a transaction updates totals and charts.
- **AC-07** Category-based spending is displayed correctly.
- **AC-08** No layout-breaking issues at the widths in UXD-06.
- **AC-09** Success and failure feedback is clear.
- **AC-10** No sensitive banking or payment information is required or stored.
- **AC-11** Sign-in works with Google, is restricted to the company domain, and separates each user's data.
- **AC-12** Backup creates a valid JSON file, and merge restore works as specified in BAK-02 to BAK-06.
- **AC-13** Custom categories can be added, renamed, and deleted, with transactions moved to "Other" on delete.
- **AC-14** Upcoming transactions behave as specified in UPC-01 to UPC-07.
- **AC-15** The app works on Chrome, Edge, Firefox, and Safari, on desktop and mobile.
- **AC-16** Changing the display currency relabels amounts without converting them.
- **AC-17** The last-backup date and reminder behave as specified in BAK-07 to BAK-09.
- **AC-18** The design direction was approved and the final review passed (DLV-03).

---

## 12. Delivery, Milestones, and Change Control

### 12.1 Milestones
| # | Milestone | Deliverable |
|---|---|---|
| M0 | Design direction approval | Key-screen designs (UXD-02) approved by the named client approver. The build does not start before this. |
| M1 | UI foundation and sign-in | Responsive layout, navigation, dashboard structure, sign-in screen, transaction form UI. |
| M2 | Transaction logic and categories | Add, edit, delete, validation, list, search and filter, categories, upcoming rule. |
| M3 | Persistence, settings, and backup | Storage layer, per-user separation, settings, currency, backup and restore, reminder, multi-tab behavior. |
| M4 | Analytics | Period selection, totals, dashboard, reports, and charts. |
| M5 | Testing, polish, and handover | Cross-browser, responsive, and accessibility testing, error handling, final review, deployment, README. |

Mapping of work to milestones is `[D]`. Dates are to be set (DLV-04).

### 12.2 Deliverables
- **DLV-01** The deployed app on the Developer's hosting. `[D]` DF-26
- **DLV-02** The source repository and a short technical README covering the stack, setup, storage approach, and deployment. `[D]` DF-26

### 12.3 Reviews
- **DLV-03** Design direction approval (M0) and a final review (M5), each by the named client approver. `[A]` D-20

### 12.4 Timeline
- **DLV-04** No fixed deadline is set. The schedule is flexible and driven by milestone approvals. Milestone dates are left blank until the client provides them. `[C]` OI-03

### 12.5 Ownership
- **DLV-05** Ownership of the source code, hosting account, and domain, and any transfer terms, are to be agreed with the client. `[C]` OI-06

### 12.6 Change control
- **DLV-06** After design approval, any change to requirements or to the approved design MUST go through a written change request that is estimated and approved before work starts. This also applies after launch. `[D]` DF-27

---

## 13. Support and Maintenance

- **SUP-01** Ongoing maintenance and support after V1 launch are included. `[A]` D-23
- **SUP-02** **Included:** fixing defects against this PRD, security and dependency updates, keeping the hosting running, and keeping the app working as browsers update. `[D]`
- **SUP-03** **Not included:** new features, screens, or reports, and design changes. These go through the change process (DLV-06), even after launch. `[D]`
- **SUP-04** Maintenance cannot recover data lost from a user's device. Recovery is possible only from the user's own backup file. `[D]`
- **SUP-05** Support is provided during business hours, with a target of acknowledging a report within 2 business days. There is no guaranteed fix time, no 24/7 coverage, and no uptime guarantee. `[C]` OI-02
- **SUP-06** Each side names one contact, and issues are reported through one agreed channel. `[D]` OI-10
- **SUP-07** The duration and commercial terms of "ongoing" maintenance are not defined in this PRD. `[C]` OI-07

---

## 14. Security, Privacy, and Legal

- **SEC-01** The app never requests or stores bank credentials or payment-card information (BR-11).
- **SEC-02** Notes and all user text are rendered as plain text, never as HTML or script. `[D]` DF-24
- **SEC-03** Only the Google display name, email, and account ID are used (ACC-07).
- **SEC-04** Transaction data never leaves the user's device and is never stored on a server. The company has no access to it (ARC-03).
- **SEC-05** No analytics, tracking, or usage monitoring is collected. `[C]` OI-01
- **SEC-06** The app is served over HTTPS (ARC-02).
- **SEC-07** The Help page privacy statement ("your data stays on this device") is published only once SEC-05 is confirmed. `[C]`
- **SEC-08** The footer states that the app gives no financial advice (NAV-03).
- **SEC-09** Backup files are plain, unencrypted JSON. The user is warned when creating one (BAK-10). Encryption is out of scope for V1. `[C]` OI-08
- **SEC-10** Data in browser storage is not encrypted by the app. It is protected only by the device, the browser, and the sign-in gate. Access enforcement limits are stated in ACC-08.

---

## 15. Changes from the SRS

The client must sign off on these differences (OI-04).

| # | SRS reference | SRS position | PRD position | Where |
|---|---|---|---|---|
| CH-01 | 1.3 Audience, 2.1 | Individuals and students; no account system | Internal tool for company staff; Google sign-in gates access | 2.1, 6 |
| CH-02 | 3.4, 11 | Custom categories deferred | Custom expense categories in V1 | CAT-03 to CAT-09 |
| CH-03 | 11 | Export and secure backup deferred | JSON backup and merge restore in V1 | BAK |
| CH-04 | 9 | Category required for expenses only | Category required for every transaction | BR-08 |
| CH-05 | 3.4 | Only expense categories listed | Fixed income category list added | 7.3, CAT-02 |
| CH-06 | 8, 3.1 | One balance formula | Net for the period and Total balance, both shown | BR-01, DSH-01, DSH-02 |
| CH-07 | 7 | "Selected currency" with no way to select | Per-user display currency, label only | SET-02 |
| CH-08 | 3.2 | Date rules not defined | Future dates allowed, counted only once they arrive | UPC |
| CH-09 | 2.2, 3.5 | "Spending by period" undefined | Spending trend by day or month | RPT-05 |
| CH-10 | 3.5, FR-11 | "Reporting period" undefined | Month picker and full-year view | PER |
| CH-11 | FR-09, FR-11 (Should) | Search, filter, and period selection are "Should" | Treated as Must, because SRS Section 12 requires them | LST-10 to LST-15, PER |
| CH-12 | 3.2, 3.3, 9 | "Note" and "description" used interchangeably | One field, called "Note" in the UI | 7.1 |
| CH-13 | 3.2 | Invalid amounts "where inappropriate" | Amount must be greater than zero, with limits | TXN-03 |
| CH-14 | 6 | Performance and accessibility unquantified | 100 ms interactions, WCAG 2.1 AA, 10,000-transaction target | NFR-01, NFR-04 |
| CH-15 | — | Support after launch not stated | Ongoing maintenance included | 13 |
| CH-16 | 13 | Five milestones, no gates | Added M0 design approval, plus change control | 12 |

---

## 16. Open Items and Client Confirmations

| ID | Item | Current baseline | Needed from |
|---|---|---|---|
| OI-01 | Analytics and monitoring | None (SEC-05, ARC-10, OOS-20). Without them, bugs surface only when staff report them and adoption cannot be measured. | Client |
| OI-02 | Support response target | Business hours, acknowledge within 2 business days (SUP-05) | Client and Developer |
| OI-03 | Deadline and milestone dates | Flexible, milestone-driven (DLV-04) | Client |
| OI-04 | Sign-off on the SRS changes in Section 15 (SSO, custom categories, JSON backup, and others) | Proposed | Client |
| OI-05 | Google sign-in credentials: create an "Internal" app in the company's Google Cloud organization, and supply the client ID and domain (ACC-09) | Not yet done | Client |
| OI-06 | Ownership and transfer terms for source code, hosting account, and domain (DLV-05) | Not defined | Client and Developer |
| OI-07 | Duration and commercial terms of ongoing maintenance (SUP-07) | Not defined | Client and Developer |
| OI-08 | Backup files unencrypted in V1 (SEC-09) | Accepted with a warning shown | Client |
| OI-09 | Default or preselected currency and the list of selectable currencies (SET-05) | Not defined | Client |
| OI-10 | Named client approver and contacts for both sides (Sections 4, 13) | Not defined | Client and Developer |
| OI-11 | App name, hosting URL, and domain (ARC-02) | Not defined | Client and Developer |
| OI-12 | Review SRS Sections 1.1 to 1.3, which were only partially available when this PRD was written | Not reviewed | Developer |

---

## 17. Risks and Mitigations

| ID | Risk | Mitigation |
|---|---|---|
| RISK-01 | Data lives in one browser. Clearing site data or changing device loses everything. | JSON backup and restore, last-backup date and reminder, persistent-storage request, first-run guidance (BAK, ARC-07, ONB-01). |
| RISK-02 | Safari, especially on iPhone, may clear stored data after long inactivity. | Same mitigations. Real iPhone Safari testing (TST-03). |
| RISK-03 | The access gate is UI-level only and can be bypassed by loading the site's files. | Accepted `[A]` D-06. No financial data is on the server (ACC-08). |
| RISK-04 | "Clean and modern" is subjective and can cause open-ended redesign. | One design-direction approval, objective criteria, change requests (UXD-02 to UXD-04, DLV-06). |
| RISK-05 | Merge restore can bring back transactions the user deleted after the backup. | The restore summary warns about it (BAK-04). |
| RISK-06 | The SRS changes (SSO, custom categories, JSON backup) affect effort and scope. | Client sign-off required (OI-04). |
| RISK-07 | The client's Google credentials are a dependency the Developer does not control. | Requested early (OI-05, ACC-09). |
| RISK-08 | "Ongoing" maintenance without terms is an open-ended commitment. | Define term and response targets (OI-02, OI-07). |
| RISK-09 | Counted-vs-upcoming depends on the device date. A wrong device clock changes totals. | Documented in UPC-02. Re-evaluate on date change (UPC-05). |
| RISK-10 | Hosting on the Developer's account raises ownership and continuity questions. | Agree ownership and transfer terms (OI-06). |
| RISK-11 | Backup files and browser storage are unencrypted. | Warning at backup time (BAK-10). Confirmation requested (OI-08). |

---

## 18. Decision Log and Traceability

### 18.1 Agreed decisions
| ID | Decision | PRD reference |
|---|---|---|
| D-01 | Internal tool for the company's staff | 2.1, OOS-01 |
| D-02 | Staff track their own personal finances, private per person | 2.1, OOS-01, OOS-02 |
| D-03 | Company sign-in to reach the app; data stays in the browser | ARC-03, ACC-01 |
| D-04 | Google Workspace is the identity provider | ACC-01 to ACC-03 |
| D-05 | The Developer hosts the app on a static host | ARC-01, ARC-02 |
| D-06 | A UI-level sign-in gate is sufficient | ACC-08, RISK-03 |
| D-07 | JSON backup and restore in V1 | BAK-01 |
| D-08 | Restore merges into existing data, skipping existing transactions | BAK-03 |
| D-09 | Users can add custom categories | CAT-03 |
| D-10 | Deleting a custom category moves its transactions to "Other" | CAT-06 |
| D-11 | Fixed set of income categories; every transaction has a category | 7.3, CAT-02, BR-08 |
| D-12 | Dashboard shows both period net and all-time balance | BR-01, DSH-02 |
| D-13 | Per-user display currency, label only | SET-02 |
| D-14 | Month picker plus full-year view | PER-01 |
| D-15 | Reports: category, income vs expenses, trend by day or month | RPT-01, RPT-05 |
| D-16 | Future dates allowed; not counted until the date arrives | UPC-01, UPC-02 |
| D-17 | Upcoming excluded from balance, totals, and charts | UPC-03, BR-03, BR-04 |
| D-18 | English only | UXD-08, OOS-15 |
| D-19 | The Developer designs the UI; the client reviews | UXD-01 |
| D-20 | One design-direction approval, then a final review | UXD-02, DLV-03 |
| D-21 | All major browsers on desktop and mobile | ARC-09 |
| D-22 | Last-backup date and in-app reminder | BAK-08, BAK-09 |
| D-23 | Ongoing maintenance and support included | SUP-01 |

### 18.2 Baseline defaults
| ID | Default | PRD reference |
|---|---|---|
| DF-01 | Date newest first; date and amount sortable | LST-02, DAT-03 |
| DF-02 | Table on desktop, cards on mobile | LST-03 |
| DF-03 | Case-insensitive partial search combined with filters | LST-10, LST-12 |
| DF-04 | 50 rows at a time; 10,000 transactions | LST-04, ARC-05 |
| DF-05 | Filters persist in-app, not in the URL | LST-13 |
| DF-06 | Add form fields; Save and add another | TXN-01, TXN-06 |
| DF-07 | Edit uses the same form; type change needs a valid category | TXN-10, TXN-11 |
| DF-08 | Delete with confirmation only; no undo or bulk delete | TXN-20, OOS-13 |
| DF-09 | Unique IDs; no duplicates | BR-06, TXN-08 |
| DF-10 | First-run guidance; no tutorial or sample data | ONB-01 |
| DF-11 | Defined empty states | ONB-02 |
| DF-12 | Toasts, inline errors, blocking storage errors | FBK-01 to FBK-03 |
| DF-13 | Storage layer; data separated per Google account | ARC-04, ACC-06 |
| DF-14 | Multi-tab sync, last write wins | ARC-08 |
| DF-15 | Schema version and migrations; unreadable data never wiped | ARC-06 |
| DF-16 | Settings contents; sign-out keeps data; typed-confirmation reset | SET-01, SET-04, ACC-04 |
| DF-17 | No offline mode or installable app | OOS-18 |
| DF-18 | WCAG 2.1 AA | NFR-04 |
| DF-19 | Verified at 360, 768, 1280 px; 44 px targets | UXD-06 |
| DF-20 | 100 ms actions; under 3 s first load | NFR-01 |
| DF-21 | Acceptance from SRS 12 plus all decisions | TST-01 |
| DF-22 | Automated logic tests; manual pass on four browsers | TST-02, TST-03 |
| DF-23 | Test data never shipped | TST-05 |
| DF-24 | Notes as plain text; only name, email, account ID used | SEC-02, ACC-07 |
| DF-25 | Footer disclaimer and Help page | NAV-02, NAV-03 |
| DF-26 | Deliverables: app, repository, README | DLV-01, DLV-02 |
| DF-27 | Change requests after design approval | DLV-06 |

### 18.3 SRS functional requirement mapping
| SRS ID | Requirement | PRD reference |
|---|---|---|
| FR-01 | Add income | TXN-01 to TXN-08 |
| FR-02 | Add expense | TXN-01 to TXN-08 |
| FR-03 | Validate input | TXN-03, TXN-04 |
| FR-04 | Transaction list | LST-01 to LST-07 |
| FR-05 | Edit | TXN-10 to TXN-13 |
| FR-06 | Delete after confirmation | TXN-20 to TXN-23 |
| FR-07 | Automatic totals | BR-01 to BR-05, DSH-01, DSH-02 |
| FR-08 | Categories | 7.3, CAT |
| FR-09 | Search and filter | LST-10 to LST-16 |
| FR-10 | Spending analytics with charts | RPT, DSH-06 |
| FR-11 | Reporting period | PER |
| FR-12 | Data retained after refresh | ARC-03, ARC-06, NFR-02 |
| FR-13 | Responsive layouts | UXD-06, ARC-09 |
| FR-14 | Clear validation and error messages | TXN-04, FBK |

*End of document.*
