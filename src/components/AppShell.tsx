import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, BarChart3, Wallet2, Flag, FileText, LogOut, Menu, X } from 'lucide-react';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: BarChart3 },
    { name: 'Accounts', path: '/app/accounts', icon: Wallet2 },
    { name: 'Transactions', path: '/app/transactions', icon: Wallet },
    { name: 'Goals', path: '/app/goals', icon: Flag },
    { name: 'Reports', path: '/app/reports', icon: FileText },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const isHub = location.pathname === '/app/dashboard';
  if (isHub) {
  return (
    <div className="min-h-screen bg-[#050505]">
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
    <div className="flex h-screen bg-[#050505]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:relative w-64 h-screen flex flex-col transition-transform z-50 lg:z-0 border-r border-white/[0.06] bg-[#0a0a0a] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app/dashboard')}>
            <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-8 h-8 object-contain" />
            <span className="text-lg font-semibold text-white tracking-tight">SmartFinance</span>
          </div>
          <button className="lg:hidden absolute top-6 right-5" onClick={() => setSidebarOpen(false)}>
            <X size={22} className="text-white/40" />
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
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon size={17} className={active ? 'text-pink-400' : ''} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <div className="px-3.5 py-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <p className="text-white/30 text-xs mb-0.5">Signed in as</p>
            <p className="text-white/70 text-sm font-medium truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.07] border border-transparent transition-all"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-[#0a0a0a] border-b border-white/[0.06] px-5 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-white/50" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-white">SmartFinance</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#050505]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}