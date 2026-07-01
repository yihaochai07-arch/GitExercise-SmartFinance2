import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import{ useTheme } from '../context/ThemeContext';
import { Wallet, LayoutGrid , CreditCard, Flag, FileText, LogOut, Menu, X, HandCoins, Sun, Moon } from 'lucide-react';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme()

  const navItems = [
    { name: 'Home', path: '/app/dashboard', icon: LayoutGrid },
    { name: 'Accounts', path: '/app/accounts', icon: CreditCard },
    { name: 'Transactions', path: '/app/transactions', icon: Wallet },
    { name: 'Goals', path: '/app/goals', icon: Flag },
    { name: 'Reports', path: '/app/reports', icon: FileText },
    { name: 'Budgets', path: '/app/budgets', icon: HandCoins }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const isHub = location.pathname === '/app/dashboard';
  if (isHub) {
  return (
    <div className="min-h-screen bg-[#050505] dark:bg-[#050505]">
      {/* Mobile header still useful if user navigates to hub on mobile */}
      <header className="lg:hidden bg-[#0a0a0a] border-b border-white/[0.06] px-5 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-6 h-6 object-contain" />
          <span className="text-sm font-semibold text-white">SmartFinance</span>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

  return (
  <div className="flex h-screen bg-[#050505] dark:bg-[#050505] light:bg-[#f8f7f5] bg-[#f8f7f5] dark:bg-[#050505]">
    {sidebarOpen && (
      <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
    )}

    <aside className={`fixed lg:relative w-64 h-screen flex flex-col transition-transform z-50 lg:z-0
      border-r border-gray-200 dark:border-white/[0.06]
      bg-white dark:bg-[#0a0a0a]
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-8 h-8 object-contain" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">SmartFinance</span>
        </div>
        <button className="lg:hidden absolute top-6 right-5" onClick={() => setSidebarOpen(false)}>
          <X size={22} className="text-gray-400 dark:text-white/40" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon size={17} className={active ? 'text-pink-500' : ''} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-white/[0.06] space-y-2">

        {/* ── Theme Toggle Button ── */}
        <div className="px-1">
          <p className="text-[10px] font-medium text-gray-400 dark:text-white/25 uppercase tracking-widest mb-2 px-2.5">
            Appearance
          </p>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06]">
            {/* Light button */}
<button
  onClick={toggleTheme}
  disabled={!isDark}
  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
    !isDark
      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
      : 'text-white/30 hover:text-white/50'
  }`}
>
  <Sun size={13} />
  Light
</button>

{/* Dark button */}
<button
  onClick={toggleTheme}
  disabled={isDark}
  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
    isDark
      ? 'bg-white/[0.08] text-pink-400 border border-pink-500/20'
      : 'text-gray-500 hover:text-gray-700'
  }`}
>
  <Moon size={13} />
  Dark
</button>
          </div>
        </div>

        {/* Signed in as */}
        <div className="px-3.5 py-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05]">
          <p className="text-white/30 dark:text-white/30 text-gray-400 text-xs mb-0.5">Signed in as</p>
          <p className="text-gray-800 dark:text-white/70 text-sm font-medium truncate">{user?.email}</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.07] border border-transparent transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>

    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile header */}
      <header className="lg:hidden bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/[0.06] px-5 py-4 flex items-center gap-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={22} className="text-gray-400 dark:text-white/50" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-6 h-6 object-contain" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">SmartFinance</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[#f8f7f5] dark:bg-[#050505]">
        <Outlet />
      </main>
    </div>
  </div>
);
}