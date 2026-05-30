import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { PROVIDERS, ProviderConfig } from '../../services/mockProviders'

type Tab = 'ID' | 'SG' | 'MY'

interface Props {
  open: boolean
  connectedProviderIds: Set<string>
  onClose: () => void
  onConnect: (providerId: string) => Promise<void>
}

const TABS: { key: Tab; label: string; flag: string }[] = [
  { key: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { key: 'MY', label: 'Malaysia', flag: '🇲🇾' },
  { key: 'ID', label: 'Indonesia', flag: '🇮🇩' },
]

export default function ConnectModal({ open, connectedProviderIds, onClose, onConnect }: Props) {
  const [tab, setTab] = useState<Tab>('SG')
  const [connecting, setConnecting] = useState<string | null>(null)

  if (!open) return null

  const providers = PROVIDERS.filter(p => p.country === tab)

  async function handleConnect(provider: ProviderConfig) {
    if (connectedProviderIds.has(provider.id) || connecting) return
    setConnecting(provider.id)
    try {
      await onConnect(provider.id)
      onClose()
    } catch (err) {
      console.error('Failed to connect account:', err)
    } finally {
      setConnecting(null)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Connect an Account</h2>
              <p className="text-xs text-white/30 mt-0.5">
                Indonesia: Brankas sandbox · SG/MY: demo data
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            >
              <X size={14} className="text-white/50" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mx-6 mb-5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  tab === t.key
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                <span>{t.flag}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Provider grid */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            {providers.map(provider => {
              const isConnected = connectedProviderIds.has(provider.id)
              const isLoading = connecting === provider.id
              return (
                <button
                  key={provider.id}
                  onClick={() => handleConnect(provider)}
                  disabled={isConnected || !!connecting}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    isConnected
                      ? 'border-white/[0.04] bg-white/[0.02] opacity-40 cursor-not-allowed'
                      : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.06] cursor-pointer'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                    {isLoading ? (
                      <Loader2 size={14} className="text-pink-400 animate-spin" />
                    ) : (
                      <img
                        src={provider.logoUrl}
                        alt={provider.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{provider.name}</p>
                    <p className="text-[10px] text-white/25">
                      {isConnected ? 'Connected' : provider.usesBrankas ? 'Live · Brankas' : 'Demo data'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
