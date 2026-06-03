import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet2, Wallet, Flag, FileText,
  ArrowRight, TrendingUp, Target, PieChart, CreditCard,
  Coins, DollarSign
} from 'lucide-react';

// Feature cards data
const features = [
  {
    to: '/app/accounts',
    icon: Wallet2,
    accentIcon: CreditCard,
    label: 'Accounts',
    description: 'Manage your cash, bank accounts, and e-wallets in one place.',
    Image:'https://img.feebee.tw/i/UOXTm8kCqIL0pAVOK4nkYih6PI82A411_ouillPXOO8/372/aHR0cHM6Ly9jZi5zaG9wZWUudHcvZmlsZS90dy0xMTEzNDIwMS03cjk4ci1seHc1MnRucWV3ajQ5MA.webp',
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
    Image: 'data:image/jpeg;base64,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', 
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
    Image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvL2eC1YMMBBXYlF3ia_XqiKRPlF9J9sBRGg&s',
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
    Image: 'https://doctorprojects.com/wp-content/uploads/2024/07/Report-Writing-Skills.webp', 
    gradient: 'from-teal-500/10 to-blue-500/5',
    border: 'border-teal-500/20',
    hoverBorder: 'hover:border-teal-500/50',
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    glow: 'hover:shadow-[0_0_40px_rgba(20,184,166,0.12)]',
    tag: 'CSV & PDF export',
  },
  {
    to: '/app/budgets',
    icon: Coins,
    accentIcon: DollarSign,
    label: 'Budgets',
    description: 'Set monthly limits by category and keep your spending under control.',
    Image:'data:image/jpeg;base64,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',
    gradient: 'from-orange-500/10 to-yellow-500/5',
    border: 'border-orange-500/20',
    hoverBorder: 'hover:border-orange-500/50',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    glow: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.12)]',
    tag: 'Smart limits',
  }
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
          iconColor, iconBg, glow, tag, Image,
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
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 5, 0.73), rgba(5, 5, 5, 0.93)), url("${Image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
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