const BASE_URL = import.meta.env.VITE_BRANKAS_BASE_URL ?? 'https://direct.sandbox.bnk.to'
const API_KEY = import.meta.env.VITE_BRANKAS_API_KEY ?? ''

export type BrankasBalance = {
  account_id: string
  available_balance: number
  currency: string
}

function headers() {
  if (!API_KEY) throw new Error('Brankas API key not configured (VITE_BRANKAS_API_KEY)')
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  }
}

/**
 * Creates a Brankas link session for a given bank code.
 * In sandbox, use bankCode = 'DUMMY_BANK_PERSONAL'.
 *
 * NOTE (demo simplification): In production, you would wait for a webhook
 * callback before saving the link_id. Here we save immediately after the
 * user is redirected to the Brankas-hosted authorisation page.
 */
export async function createBrankasLink(bankCode: string): Promise<{ link_id: string; redirect_url: string }> {
  const res = await fetch(`${BASE_URL}/link`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ bank_code: bankCode }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Brankas createLink failed (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Fetches account balances using a stored link_id.
 */
export async function getBrankasBalances(linkId: string): Promise<BrankasBalance[]> {
  const res = await fetch(`${BASE_URL}/link/${linkId}/accounts`, {
    headers: headers(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Brankas getBalances failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  // Brankas returns { accounts: [...] }
  return (json.accounts ?? []).map((a: Record<string, unknown>) => ({
    account_id: a.account_id as string,
    available_balance: (a.balance as Record<string, unknown>)?.available as number ?? 0,
    currency: a.currency as string ?? 'IDR',
  }))
}
