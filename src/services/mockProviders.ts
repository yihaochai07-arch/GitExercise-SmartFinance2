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
  { 
  id: 'cash', 
  name: 'Cash on Hand', 
  country: 'MY',           // default country — doesn't matter much
  currency: 'MYR',         // cash is always in local currency
  platform_type: 'cash', 
  usesBrankas: false, 
  logoUrl: '/logos/cash.png',  // we'll use an emoji fallback 
  mockBalanceRange: [0, 0],    // cash starts at 0, real balance from transactions
},
  // Indonesia — demo data (Brankas only offers payment APIs, not balance reads)
  { id: 'bca',     name: 'BCA',     country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/bca.png',     mockBalanceRange: [10_000, 500_000] },
  { id: 'mandiri', name: 'Mandiri', country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/mandiri.png', mockBalanceRange: [10_000, 500_000] },
  { id: 'bri',     name: 'BRI',     country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/bri.png',     mockBalanceRange: [10_000, 500_000] },
  { id: 'bni',     name: 'BNI',     country: 'ID', currency: 'IDR', platform_type: 'bank_id', usesBrankas: false, logoUrl: '/logos/bni.png',     mockBalanceRange: [10_000, 500_000] },
  // Indonesia e-wallets — mock (no public balance-read API available)
  { id: 'gopay',     name: 'GoPay',     country: 'ID', currency: 'IDR', platform_type: 'ewallet_gopay',     usesBrankas: false, logoUrl: '/logos/gopay.png',     mockBalanceRange: [5_000, 200_000] },
  { id: 'shopeepay', name: 'ShopeePay', country: 'ID', currency: 'IDR', platform_type: 'ewallet_shopeepay', usesBrankas: false, logoUrl: '/logos/shopeepay.png', mockBalanceRange: [5_000, 200_000] },
  // Singapore — mock (bank APIs require formal MAS/partnership registration)
  { id: 'dbs',  name: 'DBS',  country: 'SG', currency: 'SGD', platform_type: 'bank_sg', usesBrankas: false, logoUrl: '/logos/dbs.png',  mockBalanceRange: [1_000, 5_000] },
  { id: 'ocbc', name: 'OCBC', country: 'SG', currency: 'SGD', platform_type: 'bank_sg', usesBrankas: false, logoUrl: '/logos/ocbc.png', mockBalanceRange: [1_000, 5_000] },
  { id: 'uob',  name: 'UOB',  country: 'SG', currency: 'SGD', platform_type: 'bank_sg', usesBrankas: false, logoUrl: '/logos/uob.png',  mockBalanceRange: [1_000, 5_000] },
  // Malaysia — mock (no open banking standard / public API)
  { id: 'maybank', name: 'Maybank', country: 'MY', currency: 'MYR', platform_type: 'bank_my', usesBrankas: false, logoUrl: '/logos/maybank.png', mockBalanceRange: [500, 20_000] },
  { id: 'cimb',    name: 'CIMB',    country: 'MY', currency: 'MYR', platform_type: 'bank_my', usesBrankas: false, logoUrl: '/logos/cimb.png',    mockBalanceRange: [500, 20_000] },
  // Malaysia e-wallets
  { id: 'tng', name: "Touch 'n Go", country: 'MY', currency: 'MYR', platform_type: 'ewallet_tng', usesBrankas: false, logoUrl: '/logos/tng.png', mockBalanceRange: [50, 2_000] },
]

export const PROVIDER_MAP: Record<string, ProviderConfig> = Object.fromEntries(
  PROVIDERS.map(p => [p.id, p])
)

export const PROVIDER_BY_NAME: Record<string, ProviderConfig> = Object.fromEntries(
  PROVIDERS.map(p => [p.name.toLowerCase(), p])
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

// ── Premium card gradients per bank ──────────────────────────────
export const CARD_THEMES: Record<string, {
  gradient: string
  shadow: string
  chip: string
  network: 'visa' | 'mastercard' | 'cash'
}> = {
  // Singapore
  uob:  { gradient: 'from-[#0a1628] via-[#0d2147] to-[#091235]', shadow: 'rgba(30,80,180,0.35)',  chip: '#c8a84b', network: 'mastercard' },
  dbs:  { gradient: 'from-[#1a0608] via-[#3d0b10] to-[#1a0608]', shadow: 'rgba(180,20,30,0.35)',  chip: '#c8a84b', network: 'mastercard' },
  ocbc: { gradient: 'from-[#0d1a0d] via-[#1a3a1a] to-[#0d1a0d]', shadow: 'rgba(220,80,0,0.3)',   chip: '#d4af37', network: 'visa'       },
  // Malaysia
  maybank: { gradient: 'from-[#1a1400] via-[#3d3000] to-[#1a1400]', shadow: 'rgba(200,160,0,0.35)',  chip: '#d4af37', network: 'visa'       },
  cimb:    { gradient: 'from-[#1a0505] via-[#3d0a0a] to-[#1a0505]', shadow: 'rgba(180,0,0,0.35)',    chip: '#c8a84b', network: 'visa'       },
  // Indonesia
  bca:     { gradient: 'from-[#001433] via-[#002966] to-[#001433]', shadow: 'rgba(0,60,180,0.35)',   chip: '#c8a84b', network: 'mastercard' },
  bni:     { gradient: 'from-[#001a33] via-[#003366] to-[#001a33]', shadow: 'rgba(0,80,180,0.35)',   chip: '#c8a84b', network: 'visa'       },
  bri:     { gradient: 'from-[#001a00] via-[#003300] to-[#001a00]', shadow: 'rgba(0,120,0,0.35)',    chip: '#d4af37', network: 'visa'       },
  mandiri: { gradient: 'from-[#001433] via-[#002b66] to-[#001433]', shadow: 'rgba(0,80,200,0.35)',   chip: '#c8a84b', network: 'mastercard' },
  // E-wallets
  gopay:     { gradient: 'from-[#001a33] via-[#00264d] to-[#001a33]', shadow: 'rgba(0,100,200,0.3)',  chip: '#c8a84b', network: 'visa' },
  shopeepay: { gradient: 'from-[#1a0500] via-[#3d1000] to-[#1a0500]', shadow: 'rgba(200,50,0,0.3)',   chip: '#d4af37', network: 'visa' },
  tng:       { gradient: 'from-[#001a0d] via-[#00331a] to-[#001a0d]', shadow: 'rgba(0,150,80,0.3)',   chip: '#d4af37', network: 'visa' },
  // Cash on Hand
  cash:      { gradient: 'from-[#0d1a0d] via-[#1a2e1a] to-[#0d1a0d]', shadow: 'rgba(34,197,94,0.25)', chip: '#86efac', network: 'cash' },
  // Default fallback
  default:   { gradient: 'from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]', shadow: 'rgba(255,255,255,0.1)', chip: '#c8a84b', network: 'mastercard' },
}
