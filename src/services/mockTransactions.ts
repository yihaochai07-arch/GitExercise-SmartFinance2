/**
 * Generates realistic mock transaction history for a connected account.
 * Seeded by accountId so the same account always gets the same transactions.
 * Dynamically generates up to the current date.
 */

type TransactionInsert = {
  user_id: string
  account_id: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  date: string
}

// ─── Seeded LCG random number generator ──────────────────────────────────────
function makePrng(seed: number) {
  let s = Math.abs(seed) >>> 0
  return {
    next(): number {
      s = ((s * 1664525 + 1013904223) >>> 0)
      return s / 4294967296
    },
    nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)]
    },
  }
}

function accountSeed(accountId: string): number {
  return accountId.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
}

// ─── Amount ranges by currency ────────────────────────────────────────────────
type AmountRange = [number, number]

const EXPENSE_RANGES: Record<string, Record<string, AmountRange>> = {
  SGD: {
    'Food & Dining':  [5, 35],
    'Transport':      [2, 12],
    'Shopping':       [20, 250],
    'Entertainment':  [15, 80],
    'Health':         [20, 180],
    'Utilities':      [50, 220],
    'Other':          [5, 60],
  },
  MYR: {
    'Food & Dining':  [5, 30],
    'Transport':      [3, 25],
    'Shopping':       [20, 180],
    'Entertainment':  [10, 70],
    'Health':         [20, 120],
    'Utilities':      [50, 180],
    'Other':          [5, 50],
  },
  IDR: {
    'Food & Dining':  [1_000, 8_000],
    'Transport':      [1_000, 15_000],
    'Shopping':       [5_000, 6_000],
    'Entertainment':  [3_000, 20_000],
    'Health':         [5_000, 35_000],
    'Utilities':      [1_000, 50_000],
    'Other':          [1_000, 8_000],
  },
}

const INCOME_RANGES: Record<string, AmountRange> = {
  SGD: [3_500, 9_000],
  MYR: [2_500, 7_000],
  IDR: [60_000, 180_000],
}

// E-wallet income is top-ups (smaller)
const TOPUP_RANGES: Record<string, AmountRange> = {
  SGD: [20, 200],
  MYR: [20, 200],
  IDR: [10_000, 50_000],
}

const EXPENSE_CATEGORY_NAMES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Other',
]

type CategoryRow = { id: string; name: string }

export function generateMockTransactions(
  accountId: string,
  userId: string,
  currency: string,
  isEwallet: boolean,
  categories: CategoryRow[],
  monthsBack = 3,
): TransactionInsert[] {
  const rng = makePrng(accountSeed(accountId))
  const transactions: TransactionInsert[] = []

  const expenseRanges = EXPENSE_RANGES[currency] ?? EXPENSE_RANGES['SGD']
  const incomeRange = isEwallet
    ? (TOPUP_RANGES[currency] ?? TOPUP_RANGES['SGD'])
    : (INCOME_RANGES[currency] ?? INCOME_RANGES['SGD'])

  const salaryCategory = categories.find(c => c.name === 'Salary') ?? categories[0]
  const expenseCategories = categories.filter(c => EXPENSE_CATEGORY_NAMES.includes(c.name))

  // Build date range: from (monthsBack months ago) to today
  const today = new Date()
  const start = new Date(today)
  start.setMonth(start.getMonth() - monthsBack)
  start.setDate(1)

  const currentDate = new Date(start)

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfMonth = currentDate.getDate()

    // Income: salary on day 1 and 15 (or top-up for e-wallets with ~30% chance)
    if (isEwallet) {
      if (rng.next() < 0.12) {
        transactions.push({
          user_id: userId,
          account_id: accountId,
          amount: round(rng.nextInt(incomeRange[0], incomeRange[1]), currency),
          type: 'income',
          category_id: salaryCategory.id,
          date: dateStr,
        })
      }
    } else {
      if (dayOfMonth === 1 || dayOfMonth === 15) {
        transactions.push({
          user_id: userId,
          account_id: accountId,
          amount: round(rng.nextInt(incomeRange[0], incomeRange[1]), currency),
          type: 'income',
          category_id: salaryCategory.id,
          date: dateStr,
        })
      }
    }

    // Expenses: 0–3 per day with ~60% chance of any expense
    const expenseCount = rng.next() < 0.6 ? rng.nextInt(1, 3) : 0
    for (let i = 0; i < expenseCount; i++) {
      const cat = rng.pick(expenseCategories)
      if (!cat) continue
      const range = expenseRanges[cat.name] ?? expenseRanges['Other']
      transactions.push({
        user_id: userId,
        account_id: accountId,
        amount: round(rng.nextInt(range[0], range[1]), currency),
        type: 'expense',
        category_id: cat.id,
        date: dateStr,
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return transactions
}

function round(amount: number, currency: string): number {
  if (currency === 'IDR') return Math.round(amount / 1000) * 1000
  return Math.round(amount * 100) / 100
}
