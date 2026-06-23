import { WalletGroup } from '../../hooks/useWallet'
import AccountCard from './AccountCard'

interface Props {
  group: WalletGroup
  onDelete: (accountId: string) => Promise<boolean>
}

const FLAG: Record<string, string> = {
  ID: '🇮🇩',
  SG: '🇸🇬',
  MY: '🇲🇾',
}

export default function CountryGroup({ group, onDelete }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">{FLAG[group.country]}</span>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            {group.label}
          </h2>
        </div>
        <span className="text-sm font-medium text-white/40">{group.subtotal}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.accounts.map(account => (
          <AccountCard 
            key={account.id}
            account={account} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    </div>
  )
}