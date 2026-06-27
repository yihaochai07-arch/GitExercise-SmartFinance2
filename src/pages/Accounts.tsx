import { useState } from 'react'
import { Plus, Wallet2, TrendingUp, Banknote } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import CountryGroup from '../components/accounts/CountryGroup'
import ConnectModal from '../components/accounts/ConnectModal'
import WithdrawModal from '../components/accounts/WithdrawModal'

export default function Accounts() {
  const { groups, walletAccounts, totalBalanceMYR, loading, error, connectAccount, deleteAccount, withdrawCash } = useWallet()
  const [modalOpen, setModalOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const connectedProviderIds = new Set(walletAccounts.map(a => a.provider.id))

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-pink-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[200px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Wallet Overview</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Your connected banks and e-wallets</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] text-white/60 hover:text-white/80 text-sm font-medium transition-all duration-200"
            >
              <Banknote size={15} />
              Withdraw Cash
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 text-pink-400 text-sm font-medium transition-all duration-200"
            >
              <Plus size={15} />
              Connect Account
            </button>
          </div>
        </div>

        {/* Total balance banner */}
        {walletAccounts.length > 0 && (
          <div className="flex items-center justify-between p-6 mb-10 rounded-2xl bg-gradient-to-br from-pink-500/[0.08] to-purple-500/5 border border-pink-500/15 overflow-hidden relative">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Wallet2 size={14} className="text-pink-400/60" />
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Total Balance</p>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">
                RM{new Intl.NumberFormat('en-MS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalanceMYR)}
              </p>
              <p className="text-[11px] text-white/20 mt-1.5 font-light">
                Approximate MYR equivalent using fixed exchange rates
              </p>
            </div>
            <div className="relative z-10 hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-pink-400/50">
                <TrendingUp size={14} />
                <span className="text-xs font-medium">{walletAccounts.length} account{walletAccounts.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-[11px] text-white/20">{groups.length} region{groups.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[1.586/1] rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 mb-8">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Country groups */}
        {!loading && groups.map(group => (
          <CountryGroup key={group.country} group={group} onDelete={deleteAccount} />
        ))}

        {/* Empty state */}
        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <Wallet2 size={24} className="text-white/20" />
            </div>
            <h2 className="text-lg font-semibold text-white/60 mb-2">No accounts connected</h2>
            <p className="text-sm text-white/25 font-light mb-8 max-w-xs">
              Connect your bank accounts and e-wallets to see all your balances in one place.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 text-pink-400 text-sm font-medium transition-all duration-200"
            >
              <Plus size={15} />
              Connect your first account
            </button>
          </div>
        )}
      </div>

      <ConnectModal
        open={modalOpen}
        connectedProviderIds={connectedProviderIds}
        onClose={() => setModalOpen(false)}
        onConnect={connectAccount}
      />

      <WithdrawModal
        open={withdrawOpen}
        accounts={walletAccounts}
        onClose={() => setWithdrawOpen(false)}
        onWithdraw={withdrawCash}
      />
    </div>
  )
}