import { WalletGroup } from '../../hooks/useWallet'
import AccountCard from './AccountCard'
import BankCard from './BankCard'

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
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{FLAG[group.country]}</span>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            {group.label}
          </h2>
        </div>
        <span className="text-sm font-medium text-white/40">{group.subtotal}</span>
      </div>

      <div className="flex flex-col gap-4">
        {group.accounts.map(account => (
          <div 
            key={account.id} 
            className="flex flex-col md:flex-row gap-4 items-center justify-start"
          >
            <AccountCard 
              account={account} 
              onDelete={onDelete} 
            />
            <BankCard 
              bankName={account.provider.name} 
            />
          </div>
        ))}
      </div>
    </div>
  )
}