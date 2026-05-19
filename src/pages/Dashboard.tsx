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