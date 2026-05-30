# SmartFinance

A personal finance dashboard for tracking bank accounts, e-wallets, and transactions across Singapore, Malaysia, and Indonesia.

Built with React 18, TypeScript, Vite, Supabase, and Tailwind CSS.

## Features

- Connect bank accounts and e-wallets (DBS, Maybank, GoPay, TNG, and more)
- View balances grouped by country with approximate USD totals
- Transaction history with category breakdown
- Mock transaction seeding for connected accounts

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Setup

**1. Clone and install dependencies**

```bash
npm install
```

**2. Configure environment variables**

Copy the template and fill in your values:

```bash
cp .env.template .env
```

Open `.env` and set:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Project API keys → `anon public` |

**3. Set up the database**

In your Supabase project, open **SQL Editor** and run the contents of [`supabase-setup.sql`](./supabase-setup.sql).

This creates the tables (`accounts`, `transactions`, `transaction_categories`, etc.), seeds the default categories, and configures row-level security policies.

**4. Run the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Other scripts

```bash
npm run build       # Production build
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm run typecheck   # TypeScript type check (no emit)
```

## Project structure

```
src/
  components/accounts/   # AccountCard, CountryGroup, ConnectModal
  context/               # AuthContext (useAuth hook)
  hooks/                 # useAccounts, useWallet, useTransactions, useCategories
  lib/                   # Supabase client + Account type
  pages/                 # Accounts, Transactions, (Goals, Reports — stubs)
  services/              # mockProviders, mockTransactions
```

## Notes

- **Mock data**: When you connect an account, 3 months of realistic mock transactions are seeded into Supabase automatically. This only runs once per account.
- **Currency**: Balances are displayed in their native currency. The "Total Balance" banner converts to USD using fixed demo exchange rates.
