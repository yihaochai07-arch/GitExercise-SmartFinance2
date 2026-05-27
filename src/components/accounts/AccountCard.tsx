import { WalletAccount } from '../../hooks/useWallet'

interface Props {
  account: WalletAccount
}

export default function AccountCard({ account }: Props) {
  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] overflow-hidden">
      {/* Top row: logo + Live/Mock badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden">
            <img
              src={account.provider.logoUrl}
              alt={account.provider.name}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                // Fallback to initials if logo fails to load
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent && !parent.querySelector('span')) {
                  const span = document.createElement('span')
                  span.className = 'text-xs font-bold text-white/60'
                  span.textContent = account.provider.name.slice(0, 2).toUpperCase()
                  parent.appendChild(span)
                }
              }}
            />
          </div>
          <span className="text-sm font-medium text-white/80">{account.provider.name}</span>
        </div>

        {/* Live / Mock badge */}
        {account.isLive ? (
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Live
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
            Demo
          </span>
        )}
      </div>

      {/* Balance */}
      {account.isLoading ? (
        <div className="h-7 w-32 bg-white/[0.06] rounded-lg animate-pulse" />
      ) : account.error ? (
        <p className="text-xs text-red-400/70">{account.error}</p>
      ) : (
        <p className="text-2xl font-semibold text-white tracking-tight">
          {account.displayBalance}
        </p>
      )}

      {/* Country */}
      <p className="text-xs text-white/30 font-light">
        {account.provider.country === 'ID' ? 'Indonesia' : account.provider.country === 'SG' ? 'Singapore' : 'Malaysia'}
        {' · '}
        {account.currency}
      </p>
    </div>
  )
}
