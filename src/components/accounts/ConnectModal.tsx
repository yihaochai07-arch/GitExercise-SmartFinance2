import { useState } from 'react'
import { X, Loader2, ChevronLeft } from 'lucide-react'
import { PROVIDERS, ProviderConfig } from '../../services/mockProviders'

type Tab = 'ID' | 'SG' | 'MY'

interface Props {
  open: boolean
  connectedProviderIds: Set<string>
  onClose: () => void
  onConnect: (providerId: string, cardDetails: { cardNumber: string; cardHolder: string; expiryDate: string }) => Promise<void>
}

const TABS: { key: Tab; label: string; flag: string }[] = [
  { key: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { key: 'MY', label: 'Malaysia', flag: '🇲🇾' },
  { key: 'ID', label: 'Indonesia', flag: '🇮🇩' },
]

export default function ConnectModal({ open, connectedProviderIds, onClose, onConnect }: Props) {
  const [tab, setTab] = useState<Tab>('SG')
  const [connecting, setConnecting] = useState<string | null>(null)
  
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null)
  

  const [form, setForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: ''
  })

  if (!open) return null

  const providers = PROVIDERS.filter(p => p.country === tab)

  
  function handleSelectProvider(provider: ProviderConfig) {
    if (connectedProviderIds.has(provider.id) || connecting) return
    setSelectedProvider(provider)
  }

 
  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
      const matches = v.match(/\d{4,16}/g)
      const match = (matches && matches[0]) || ''
      
      const parts: string[] = [] 
      
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4))
      }
      setForm(prev => ({ ...prev, cardNumber: parts.length > 0 ? parts.join('  ') : v }))
      return
    }
    
    if (field === 'expiryDate') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
      if (v.length >= 2) {
        setForm(prev => ({ ...prev, expiryDate: `${v.slice(0, 2)}/${v.slice(2, 4)}` }))
      } else {
        setForm(prev => ({ ...prev, expiryDate: v }))
      }
      return
    }

    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 表单提交连接
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProvider || !form.cardNumber || connecting) return

    setConnecting(selectedProvider.id)
    try {
      await onConnect(selectedProvider.id, {
        cardNumber: form.cardNumber,
        cardHolder: form.cardHolder || 'PREMIUM USER',
        expiryDate: form.expiryDate || '12/29'
      })
      setSelectedProvider(null)
      setForm({ cardNumber: '', cardHolder: '', expiryDate: '' })
      onClose()
    } catch (err) {
      console.error('Failed to connect account:', err)
    } finally {
      setConnecting(null)
    }
  }

  const getAccentGlow = () => {
    const currentBank = selectedProvider || (connecting ? PROVIDERS.find(p => p.id === connecting) : null)
    if (!currentBank) return 'border-white/[0.08]'
    
    const nameUpper = currentBank.name.toUpperCase()
    if (nameUpper.includes('DBS')) return 'border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)]'
    if (nameUpper.includes('OCBC')) return 'border-orange-500/30 shadow-[0_0_50px_rgba(234,88,12,0.15)]'
    if (nameUpper.includes('UOB')) return 'border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)]'
    if (nameUpper.includes('BCA')) return 'border-blue-500/40 shadow-[0_0_50px_rgba(37,99,235,0.2)]'
    
    return 'border-pink-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)]'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={() => {
          if (!connecting) {
            setSelectedProvider(null)
            onClose()
          }
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-md bg-[#0d0d0d] border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${getAccentGlow()}`}>
          
          
          {!selectedProvider ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-200">
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
                    type="button"
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
              <div className="px-6 pb-6 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {providers.map(provider => {
                  const isConnected = connectedProviderIds.has(provider.id)
                  const isLoading = connecting === provider.id
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleSelectProvider(provider)}
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
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{provider.name}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">
                          {isConnected ? 'Connected' : provider.usesBrankas ? 'Live · Brankas' : 'Demo data'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 animate-in fade-in slide-in-from-left-4 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!!connecting}
                    onClick={() => setSelectedProvider(null)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded uppercase">
                      Link
                    </span>
                    <h3 className="text-sm font-black text-white">{selectedProvider.name}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!!connecting}
                  onClick={() => {
                    setSelectedProvider(null)
                    onClose()
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <X size={12} className="text-white/40" />
                </button>
              </div>

              <div className="h-[1px] bg-white/[0.05]" />

              {/* 1. Card Number / Bank Number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Card Number / Bank Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={22}
                  disabled={!!connecting}
                  placeholder="••••  ••••  ••••  ••••"
                  value={form.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-sm font-mono tracking-wide text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all disabled:opacity-40"
                />
              </div>

              {/* 2. Holder Name & Expiry */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Card Holder
                  </label>
                  <input
                    type="text"
                    disabled={!!connecting}
                    placeholder="e.g. ALEX WONG"
                    value={form.cardHolder}
                    onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-white/20 focus:outline-none focus:border-white/20 transition-all disabled:opacity-40"
                  />
                </div>
                
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider text-center">
                    Expires
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    disabled={!!connecting}
                    placeholder="MM/YY"
                    value={form.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-center text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  disabled={!!connecting}
                  onClick={() => {
                    setSelectedProvider(null)
                    onClose()
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.05] transition-all disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!connecting}
                  className="min-w-[90px] flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/40 transition-all disabled:opacity-40"
                >
                  {connecting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Linking...</span>
                    </>
                  ) : (
                    <span>Link Card</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}