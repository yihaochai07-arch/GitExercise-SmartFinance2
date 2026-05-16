import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet2, Wallet, Flag, FileText,
  ArrowRight, TrendingUp, Target, PieChart, CreditCard,
} from 'lucide-react';

// Feature cards data
const features = [
  {
    to: '/app/accounts',
    icon: Wallet2,
    accentIcon: CreditCard,
    label: 'Accounts',
    description: 'Manage your cash, bank accounts, and e-wallets in one place.',
    gradient: 'from-pink-500/10 to-rose-500/5',
    border: 'border-pink-500/20',
    hoverBorder: 'hover:border-pink-500/50',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    glow: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.12)]',
    tag: 'Multi-wallet',
  },
  {
    to: '/app/transactions',
    icon: Wallet,
    accentIcon: TrendingUp,
    label: 'Transactions',
    description: 'Track every income and expense across all your accounts.',
    bgImage:'/public/dashboard image/trancaction',
    gradient: 'from-purple-500/10 to-pink-500/5',
    border: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    glow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]',
    tag: 'Auto-categorized',
  },
  {
    to: '/app/goals',
    icon: Flag,
    accentIcon: Target,
    label: 'Goals',
    description: 'Set savings targets and watch your progress grow in real time.',
    gradient: 'from-blue-500/10 to-purple-500/5',
    border: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    glow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]',
    tag: 'Goal tracker',
  },
  {
    to: '/app/reports',
    icon: FileText,
    accentIcon: PieChart,
    label: 'Reports',
    description: 'Visualize spending patterns and export your financial data.',
    gradient: 'from-teal-500/10 to-blue-500/5',
    border: 'border-teal-500/20',
    hoverBorder: 'hover:border-teal-500/50',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    glow: 'hover:shadow-[0_0_40px_rgba(20,184,166,0.12)]',
    tag: 'CSV & PDF export',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  // Extract first name from email for greeting
  const firstName = user?.email?.split('@')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-14 max-w-2xl">
        {/* Logo + brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img
            src="/SmartFinance_LOGO_1.png"
            alt="SmartFinance"
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-semibold text-white tracking-tight">SmartFinance</span>
        </div>

        {/* Greeting */}
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
          {greeting},{' '}
          <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            {firstName}
          </span>{' '}
          👋
        </h1>
        <p className="text-white/40 text-lg font-light">
          What would you like to manage today?
        </p>
      </div>

      {/* Feature cards grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {features.map(({
          to, icon: Icon, accentIcon: AccentIcon,
          label, description, gradient, border, hoverBorder,
          iconColor, iconBg, glow, tag,
        }) => (
          <Link
            key={to}
            to={to}
            className={`
              group relative flex flex-col gap-5 p-6 rounded-2xl
              bg-gradient-to-br ${gradient}
              border ${border} ${hoverBorder}
              ${glow}
              transition-all duration-300 hover:scale-[1.02]
              overflow-hidden
            `}
          >
            {/* Dot grid background */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Accent icon — decorative, top right */}
            <AccentIcon
              size={64}
              className={`absolute -top-3 -right-3 ${iconColor} opacity-[0.07] transition-all duration-500 group-hover:opacity-[0.14] group-hover:scale-110`}
            />

            {/* Top row: icon + tag */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Main icon */}
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center border ${border}`}>
                <Icon size={20} className={iconColor} />
              </div>
              {/* Tag pill */}
              <span className={`text-[11px] font-medium ${iconColor} px-2.5 py-1 rounded-full ${iconBg} border ${border} opacity-70`}>
                {tag}
              </span>
            </div>

            {/* Text */}
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white mb-1.5 tracking-tight">
                {label}
              </h2>
              <p className="text-sm text-white/40 leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* Arrow — appears on hover */}
            <div className="relative z-10 flex items-center gap-1.5 mt-auto">
              <span className={`text-xs font-medium ${iconColor} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0`}>
                Open {label}
              </span>
              <ArrowRight
                size={14}
                className={`${iconColor} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0`}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Sign out link at bottom */}
      <div className="relative z-10 mt-12">
        <p className="text-white/20 text-sm text-center">
          Signed in as{' '}
          <span className="text-white/40 font-medium">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}