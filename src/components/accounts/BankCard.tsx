interface BankCardProps {
  card?: any 
  bankName: string
}

export default function BankCard({ card, bankName }: BankCardProps) {
  const nameUpper = bankName.toUpperCase()

  if (nameUpper.includes('CASH')) {
    return (
      <div className="relative w-[85.60mm] h-[53.98mm] rounded-2xl bg-gradient-to-br from-[#022c22] via-[#042f1a] to-black border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.25)] p-5 flex flex-col justify-between overflow-hidden shrink-0 transition-all duration-500 hover:border-pink-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.35)]">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-400/[0.1] rounded-full blur-xl" />
        <div>
          <span className="text-xs font-black text-emerald-300 tracking-wider uppercase">Physical Cash</span>
          <p className="text-[10px] text-emerald-200/50 mt-1 font-light">Assets held locally in wallet or vault</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-widest uppercase">Liquid Fiat</span>
        </div>
      </div>
    )
  }

  const isEWallet = nameUpper.includes('TOUCH') || nameUpper.includes('GOPAY') || nameUpper.includes('SHOPEEPAY')
  if (isEWallet) {
    let walletGlow = 'from-[#1e3a8a] via-[#172554] to-black border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.25)]'
    let textBadge = 'text-blue-300'
    if (nameUpper.includes('SHOPEE')) {
      walletGlow = 'from-[#7c2d12] via-[#431407] to-black border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.25)]'
      textBadge = 'text-orange-400'
    }

    return (
      <div className={`relative w-[85.60mm] h-[53.98mm] rounded-2xl bg-gradient-to-br ${walletGlow} border-2 p-5 flex flex-col justify-between overflow-hidden shrink-0 transition-all duration-500 hover:border-pink-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.35)]`}>
        <div>
          <span className={`text-sm font-black ${textBadge} tracking-wide`}>{bankName}</span>
          <span className="text-[9px] text-white/40 ml-2 font-mono tracking-wider font-bold bg-white/10 px-1.5 py-0.5 rounded">E-WALLET</span>
          <p className="text-[10px] text-white/50 mt-1 font-light">Digital balance linked via phone number</p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Mobile Account</span>
          <span className="text-xs font-black italic text-white/60 tracking-wider">NFC READY</span>
        </div>
      </div>
    )
  }

  const fallbackLast4 = ((bankName.length * 7) % 10000).toString().padStart(4, '8')
  
  const getCardTheme = () => {
    if (nameUpper.includes('DBS')) return 'from-[#4c0519] via-[#1c0005] to-black border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
    if (nameUpper.includes('OCBC')) return 'from-[#7c2d12] via-[#2d0f05] to-black border-2 border-orange-500 shadow-[0_0_25px_rgba(234,88,12,0.3)]'
    if (nameUpper.includes('UOB')) return 'from-[#1e3a8a] via-[#1e1b4b] to-black border-2 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)]'
    if (nameUpper.includes('MAYBANK')) return 'from-[#78350f] via-[#2d1a05] to-black border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
    if (nameUpper.includes('CIMB')) return 'from-[#991b1b] via-[#3f0712] to-black border-2 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
    if (nameUpper.includes('BCA')) return 'from-[#1d4ed8] via-[#172554] to-black border-2 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.3)]'
    if (nameUpper.includes('MANDIRI')) return 'from-[#312e81] via-[#1e1b4b] to-black border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.3)]'
    if (nameUpper.includes('BRI')) return 'from-[#0369a1] via-[#0c4a6e] to-black border-2 border-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.3)]'
    if (nameUpper.includes('BNI')) return 'from-[#65a30d] via-[#223c08] to-black border-2 border-lime-500 shadow-[0_0_25px_rgba(132,204,22,0.3)]'
    return 'from-[#2e1065] via-black to-black border-2 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
  }

  return (
    <div className={`relative w-[85.60mm] h-[53.98mm] rounded-2xl bg-gradient-to-br ${getCardTheme()} p-5 flex flex-col justify-between overflow-hidden shrink-0 transition-all duration-500 hover:border-pink-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.4),_0_0_60px_rgba(147,51,234,0.15)]`}>
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />

      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-sm font-black text-white tracking-wide drop-shadow-md">{bankName}</span>
          <span className="text-[9px] text-white/50 ml-2 font-mono font-bold tracking-widest bg-white/10 px-1 py-0.2 rounded">DEBIT</span>
        </div>
        
        <div className="w-9 h-7 rounded-lg bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border border-amber-200/60 shadow-[0_0_12px_rgba(245,158,11,0.5)] relative shrink-0">
          <div className="absolute inset-x-2 top-2 bottom-0 border-t border-x border-amber-800/30" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber-800/20 -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-800/20 -translate-y-1/2" />
        </div>
      </div>

      <div className="z-10 my-auto">
        <p className="text-base font-mono font-bold text-white tracking-[0.22em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          ••••  ••••  ••••  <span className="text-white text-lg font-black">{card?.cardNumberLast4 || fallbackLast4}</span>
        </p>
      </div>

      <div className="flex justify-between items-end z-10">
        <div className="flex gap-6">
          <div>
            <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">Card Holder</p>
            <p className="text-[10px] font-mono font-bold text-white/90 tracking-wide uppercase mt-0.5">{card?.cardHolder || 'PREMIUM USER'}</p>
          </div>
          <div>
            <p className="text-[8px] text-white/40 uppercase tracking-wider font-bold">Expires</p>
            <p className="text-[10px] font-mono font-bold text-white/90 mt-0.5">{card?.expiryDate || '12/29'}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black italic tracking-tighter bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent drop-shadow-md">
            {card?.cardType || (nameUpper.includes('UOB') || nameUpper.includes('BCA') || nameUpper.includes('DBS') ? 'MASTERCARD' : 'VISA')}
          </span>
        </div>
      </div>
    </div>
  )
}