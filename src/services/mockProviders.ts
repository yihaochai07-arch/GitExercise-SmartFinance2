import { Account } from '../lib/supabase'

export type ProviderConfig = {
  id: string
  name: string
  country: 'ID' | 'SG' | 'MY'
  currency: 'IDR' | 'SGD' | 'MYR'
  platform_type: Account['platform_type']
  logoUrl: string
  usesBrankas: boolean
  brankasBankCode?: string
  mockBalanceRange: [number, number]
}

export const PROVIDERS: ProviderConfig[] = [
  // Indonesia — demo data (Brankas only offers payment APIs, not balance reads)
  { id: 'bca',     name: 'BCA',     country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/bca.svg',     mockBalanceRange: [1_000_000, 50_000_000] },
  { id: 'mandiri', name: 'Mandiri', country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/mandiri.svg', mockBalanceRange: [1_000_000, 50_000_000] },
  { id: 'bri',     name: 'BRI',     country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/bri.svg',     mockBalanceRange: [1_000_000, 50_000_000] },
  { id: 'bni',     name: 'BNI',     country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/bni.svg',     mockBalanceRange: [1_000_000, 50_000_000] },
  // Indonesia e-wallets — mock (no public balance-read API available)
  { id: 'gopay',     name: 'GoPay',     country: 'ID', currency: 'IDR', platform_type: 'ewallet_gopay',     usesBrankas: false, logoUrl: '/logos/gopay.svg',     mockBalanceRange: [50_000, 2_000_000] },
  { id: 'shopeepay', name: 'ShopeePay', country: 'ID', currency: 'IDR', platform_type: 'ewallet_shopeepay', usesBrankas: false, logoUrl: '/logos/shopeepay.svg', mockBalanceRange: [50_000, 2_000_000] },
  // Singapore — mock (bank APIs require formal MAS/partnership registration)
  { id: 'dbs',  name: 'DBS',  country: 'SG', currency: 'SGD', platform_type: 'bank_sg', usesBrankas: false, logoUrl: '/logos/dbs.svg',  mockBalanceRange: [1_000, 50_000] },
  { id: 'ocbc', name: 'OCBC', country: 'SG', currency: 'SGD', platform_type: 'bank_sg', usesBrankas: false, logoUrl: '/logos/ocbc.svg', mockBalanceRange: [1_000, 50_000] },
  { id: 'uob',  name: 'UOB',  country: 'SG', currency: 'SGD', platform_type: 'bank_sg', usesBrankas: false, logoUrl: '/logos/uob.svg',  mockBalanceRange: [1_000, 50_000] },
  // Malaysia — mock (no open banking standard / public API)
  { id: 'maybank', name: 'Maybank', country: 'MY', currency: 'MYR', platform_type: 'bank_my', usesBrankas: false, logoUrl: '/logos/maybank.svg', mockBalanceRange: [500, 20_000] },
  { id: 'cimb',    name: 'CIMB',    country: 'MY', currency: 'MYR', platform_type: 'bank_my', usesBrankas: false, logoUrl: '/logos/cimb.svg',    mockBalanceRange: [500, 20_000] },
  // Malaysia e-wallets
  { id: 'tng', name: "Touch 'n Go", country: 'MY', currency: 'MYR', platform_type: 'ewallet_tng', usesBrankas: false, logoUrl: '/logos/tng.svg', mockBalanceRange: [50, 2_000] },
]

export const PROVIDER_MAP: Record<string, ProviderConfig> = Object.fromEntries(
  PROVIDERS.map(p => [p.id, p])
)

/**
 * Returns a stable, deterministic mock balance seeded by accountId.
 * Uses accountId instead of Math.random() so the value doesn't change on re-render.
 */
export function getMockBalance(accountId: string, range: [number, number]): number {
  const seed = accountId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const [min, max] = range
  return min + (seed % (max - min))
}

export const COUNTRY_LABELS: Record<'ID' | 'SG' | 'MY', string> = {
  ID: 'Indonesia',
  SG: 'Singapore',
  MY: 'Malaysia',
}
