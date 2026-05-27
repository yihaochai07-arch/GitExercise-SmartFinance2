-- ─────────────────────────────────────────────────────────────────────────────
-- SmartFinance — Full Database Setup
-- Paste this into Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACCOUNTS ────────────────────────────────────────────────────────────────
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform_type TEXT NOT NULL CHECK (platform_type IN (
    'cash', 'bank_id', 'bank_sg', 'bank_my',
    'ewallet_gopay', 'ewallet_shopeepay', 'ewallet_tng'
  )),
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SGD',
  brankas_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRANSACTION CATEGORIES ──────────────────────────────────────────────────
CREATE TABLE transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO transaction_categories (name, icon, color) VALUES
  ('Food & Dining',    '🍔', '#F59E0B'),
  ('Transport',        '🚗', '#3B82F6'),
  ('Shopping',         '🛍️', '#EC4899'),
  ('Entertainment',    '🎬', '#8B5CF6'),
  ('Health',           '💊', '#10B981'),
  ('Utilities',        '💡', '#6B7280'),
  ('Salary',           '💰', '#22C55E'),
  ('Investments',      '📈', '#0EA5E9'),
  ('Other',            '📦', '#9CA3AF');

-- ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES transaction_categories(id),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BUDGETS ──────────────────────────────────────────────────────────────────
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES transaction_categories(id),
  "limit" NUMERIC NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GOALS ────────────────────────────────────────────────────────────────────
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;

-- Each user can only see/modify their own rows
CREATE POLICY "own profiles"     ON profiles     FOR ALL USING (auth.uid() = id);
CREATE POLICY "own accounts"     ON accounts     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own budgets"      ON budgets      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own goals"        ON goals        FOR ALL USING (auth.uid() = user_id);

-- Categories are shared/read-only for all authenticated users
CREATE POLICY "read categories"  ON transaction_categories
  FOR SELECT USING (auth.role() = 'authenticated');
