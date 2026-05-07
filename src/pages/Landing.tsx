import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Briefcase, Plane, Tv, Coffee, TrendingUp, PieChart,
  LayoutDashboard, PlayCircle, Wallet, Users, ArrowRight, Download,
  PlusSquare, Link2, ChevronDown, ChevronRight, LogOut
} from 'lucide-react';
import LandingBackground from '../components/LandingBackground';

export default function Landing() {
  useEffect(() => {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationPlayState = 'running';
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-item').forEach(el => scrollObserver.observe(el));

    const container = document.getElementById('dashboard-grid');
    let counterInterval: ReturnType<typeof setInterval> | undefined;

    const runCounterAnimation = () => {
      const counters = document.querySelectorAll<HTMLElement>('[data-counter-target]');
      counters.forEach(counter => {
        const target = +(counter.getAttribute('data-counter-target') ?? '0');
        const prefix = counter.getAttribute('data-counter-prefix') ?? '';
        const suffix = counter.getAttribute('data-counter-suffix') ?? '';
        let count = 0;
        const duration = 1500;
        const increment = target / (duration / 20);
        counter.innerText = prefix + '0' + suffix;
        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            count = target;
            clearInterval(timer);
          }
          counter.innerText = prefix + Math.ceil(count) + suffix;
        }, 20);
      });
    };

    const dashboardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!container) return;
        if (entry.isIntersecting) {
          container.classList.add('in-view');
          runCounterAnimation();
          if (!counterInterval) {
            counterInterval = setInterval(() => {
              if (container.classList.contains('in-view')) runCounterAnimation();
            }, 6000);
          }
        } else {
          container.classList.remove('in-view');
        }
      });
    }, { threshold: 0.2 });

    if (container) dashboardObserver.observe(container);

    return () => {
      scrollObserver.disconnect();
      dashboardObserver.disconnect();
      if (counterInterval) clearInterval(counterInterval);
    };
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen overflow-x-hidden">
      <LandingBackground />
      {/* Navigation */}
      <nav className="flex z-50 w-full pt-6 pr-4 pl-4 fixed top-0 left-0 right-0 items-center justify-center">
        <div
          className="flex bg-black/90 backdrop-blur-md w-full max-w-5xl border-white/10 border rounded-full pt-2 pr-2 pb-2 pl-6 relative shadow-2xl items-center justify-between scroll-item scroll-fade-up"
          style={{ animationPlayState: 'running' }}
        >
          <a href="#" className="inline-flex items-center justify-center text-2xl font-medium text-white tracking-tight h-[50px]">
            <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-8 h-8 object-contain mr-2" />
            SmartFinance
          </a>
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="bg-white text-black hover:bg-gray-200 transition-colors px-6 py-2.5 rounded-full text-sm font-semibold tracking-tight"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex flex-col z-10 pt-40 pr-6 pl-6 relative gap-y-3 items-center justify-center">
        {/* Headline */}
        <h1
          className="md:text-7xl leading-[1.1] scroll-item scroll-blur-in delay-100 text-5xl font-medium tracking-tight text-center max-w-4xl mx-auto"
          style={{ animationPlayState: 'running' }}
        >
          Master Finance. <span className="text-pink-500 tracking-tight font-medium">Simply.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="leading-relaxed scroll-item scroll-fade-up delay-200 text-xl font-medium text-gray-400 text-center max-w-2xl mt-8 mx-auto"
          style={{ animationPlayState: 'running' }}
        >
          Your all-in-one solution for tracking balances, managing expenses, and staying within budget effortlessly.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 scroll-item scroll-fade-up delay-300"
          style={{ animationPlayState: 'running' }}
        >
          <Link
            to="/register"
            className="group inline-flex overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] sm:w-auto text-sm font-medium text-white w-full h-[54px] rounded-full pt-4 pr-8 pb-4 pl-8 relative items-center justify-center landing-cta-btn"
          >
            <div className="absolute inset-0 -z-20 rounded-full overflow-hidden p-[1px]">
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#ec4899_360deg)] landing-beam-spin"></div>
              <div className="absolute inset-[1px] rounded-full bg-[#050505]"></div>
            </div>
            <div className="overflow-hidden bg-[#0A0A0A] rounded-full absolute top-[2px] right-[2px] bottom-[2px] left-[2px]">
              <div className="bg-gradient-to-b from-pink-900/20 to-transparent absolute inset-0"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-pink-500/20 blur-2xl rounded-full pointer-events-none transition-colors duration-500 group-hover:bg-pink-500/40"></div>
            </div>
            <span className="transition-colors group-hover:text-white uppercase font-semibold text-white/90 tracking-tight z-10 relative">
              Start free
            </span>
            <ArrowRight size={16} className="relative z-10 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/login"
            className="sm:w-auto hover:bg-pink-500/10 hover:border-pink-400 hover:shadow-[0_0_35px_rgba(236,72,153,0.6),inset_0_0_20px_rgba(236,72,153,0.4)] hover:scale-[1.02] transition-all duration-300 flex group text-base font-medium text-white bg-black/60 w-full border-pink-500 border rounded-full pt-3.5 pr-8 pb-3.5 pl-8 shadow-[0_0_20px_rgba(236,72,153,0.5),inset_0_0_10px_rgba(236,72,153,0.2)] gap-x-2 items-center justify-center"
          >
            <PlayCircle size={20} className="text-pink-400 group-hover:text-pink-300 transition-colors" />
            Sign In
          </Link>
        </div>

        {/* Visual / Dashboard Mockup */}
        <div
          className="flex scroll-item scroll-blur-in delay-500 w-full h-[750px] max-w-5xl mt-32 mx-auto relative items-center justify-center"
          style={{ animationPlayState: 'running' }}
        >
          {/* Floating Elements */}
          <div className="absolute left-0 lg:left-12 top-20 z-20 hidden md:flex items-center gap-3 p-2.5 pr-4 bg-[#111] border border-white/10 rounded-lg shadow-2xl animate-bounce" style={{ animationDuration: '6s' }}>
            <div className="w-8 h-8 rounded bg-green-900/30 flex items-center justify-center border border-green-500/20">
              <Briefcase size={14} className="text-green-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">+ $4,250 Salary</span>
          </div>

          <div className="absolute left-4 lg:-left-4 top-64 z-10 hidden md:flex items-center gap-3 p-2.5 pr-4 bg-[#111] border border-white/10 rounded-lg shadow-2xl animate-pulse" style={{ animationDuration: '5s' }}>
            <div className="w-8 h-8 rounded bg-red-900/30 flex items-center justify-center border border-red-500/20">
              <Plane size={14} className="text-red-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">- $1,200 Holidays</span>
          </div>

          <div className="absolute left-8 lg:left-0 bottom-48 z-20 hidden md:flex items-center gap-3 p-2.5 pr-4 bg-[#111] border border-white/10 rounded-lg shadow-2xl animate-bounce" style={{ animationDuration: '8s' }}>
            <div className="w-8 h-8 rounded bg-blue-900/30 flex items-center justify-center border border-blue-500/20">
              <Tv size={14} className="text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">- $14.99 Netflix</span>
          </div>

          <div className="absolute right-0 lg:right-24 top-10 z-20 hidden md:flex items-center gap-3 p-2.5 pr-4 bg-[#111] border border-white/10 rounded-lg shadow-2xl animate-bounce" style={{ animationDuration: '7s' }}>
            <div className="w-8 h-8 rounded bg-teal-900/30 flex items-center justify-center border border-teal-500/20">
              <Coffee size={14} className="text-teal-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">- $3.99 Coffee</span>
          </div>

          <div className="absolute right-4 lg:right-0 top-48 z-10 hidden md:flex items-center gap-3 p-2.5 pr-4 bg-[#111] border border-white/10 rounded-lg shadow-2xl animate-pulse" style={{ animationDuration: '4s' }}>
            <div className="w-8 h-8 rounded bg-pink-900/30 flex items-center justify-center border border-pink-500/20">
              <TrendingUp size={14} className="text-pink-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">+ $250 Dividend</span>
          </div>

          <div className="absolute right-8 lg:-right-4 bottom-32 z-10 hidden md:flex items-center gap-3 p-2.5 pr-4 bg-[#111] border border-white/10 rounded-lg shadow-2xl animate-pulse" style={{ animationDuration: '6s' }}>
            <div className="w-8 h-8 rounded bg-pink-900/30 flex items-center justify-center border border-pink-500/20">
              <PieChart size={14} className="text-pink-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">+ 12.5% Portfolio</span>
          </div>

          {/* Web Frame Mockup */}
          <div className="flex flex-col w-full max-w-6xl h-[800px] bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative mx-auto">
            {/* Browser Bar */}
            <div className="flex bg-[#0A0A0A] w-full h-12 border-b border-white/5 px-4 items-center justify-between shrink-0">
              <div className="flex gap-2 items-center w-20">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-[0_0_4px_rgba(255,95,86,0.3)]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-[0_0_4px_rgba(255,189,46,0.3)]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_4px_rgba(39,201,63,0.3)]"></div>
              </div>
              <div className="flex-1 max-w-md bg-white/[0.03] h-7 rounded-md border border-white/5 flex items-center justify-center gap-2">
                <Link2 size={12} className="text-gray-500" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">smartfinance.app/dashboard</span>
              </div>
              <div className="w-20"></div>
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Sidebar */}
              <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0A0A0A] p-4 shrink-0">
                <div className="flex items-center justify-between p-2 mb-6 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-3">
                    <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-8 h-8 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">SmartFinance</span>
                      <span className="text-[11px] text-gray-500">Pro Plan</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[11px] text-gray-500 font-medium px-3 py-2 mb-1 tracking-wider uppercase">Menu</div>
                  <button className="flex items-center gap-3 px-3 py-2 bg-white/10 text-white rounded-md text-sm font-medium transition-colors">
                    <LayoutDashboard size={18} className="text-pink-400" /> Dashboard
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors group">
                    <TrendingUp size={18} className="group-hover:text-white transition-colors" /> Analytics
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors group">
                    <Wallet size={18} className="group-hover:text-white transition-colors" /> Accounts
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors group">
                    <PieChart size={18} className="group-hover:text-white transition-colors" /> Reports
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors group">
                    <Users size={18} className="group-hover:text-white transition-colors" /> Goals
                  </button>
                </div>

                <div className="mt-auto">
                  <div className="p-4 bg-gradient-to-b from-white/[0.05] to-transparent rounded-xl border border-white/[0.05]">
                    <h4 className="text-sm font-medium text-white mb-1">Upgrade to Pro</h4>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">Get advanced analytics and custom reporting.</p>
                    <button className="w-full py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">Upgrade Now</button>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl text-white tracking-tight font-medium">Stats Overview</h1>
                    <p className="text-sm text-gray-400 mt-1">Here's what's happening with your finances today.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <Download size={16} /> Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-sm font-medium text-white hover:bg-pink-500 transition-colors shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                      <PlusSquare size={16} /> New Report
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 shadow-sm hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-400">Total Revenue</span>
                      <div className="p-2 bg-green-500/10 rounded-md text-green-400"><Wallet size={16} /></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-white">$45,231.89</span>
                      <span className="text-xs font-medium text-green-400">+20.1%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
                  </div>

                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 shadow-sm hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-400">Active Users</span>
                      <div className="p-2 bg-pink-500/10 rounded-md text-pink-400"><Users size={16} /></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-white">+2,350</span>
                      <span className="text-xs font-medium text-green-400">+15.2%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
                  </div>

                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 shadow-sm hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-400">Conversion Rate</span>
                      <div className="p-2 bg-teal-500/10 rounded-md text-teal-400"><TrendingUp size={16} /></div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold tracking-tight text-white">4.3%</span>
                      <span className="text-xs font-medium text-red-400">-2.1%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                  {/* Bar Chart */}
                  <div className="overflow-visible border-white/[0.05] bg-[#0A0A0C] border rounded-2xl p-6 md:p-8 relative hover:border-white/[0.1] transition-colors">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-pink-500/5 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                    <div className="flex z-10 mb-10 relative items-start justify-between">
                      <div>
                        <h2 className="text-xl text-white tracking-tight font-medium">User Acquisition</h2>
                        <p className="text-[13px] text-gray-400 mt-1 font-medium">Installment vs Sign-ups (Last 6 months)</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse"></div>
                        <span className="text-[11px] font-medium text-gray-300 tracking-wide">Live Data</span>
                      </div>
                    </div>

                    <div className="relative h-[280px] w-full pl-8 pr-2">
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] text-gray-500 font-medium pb-8 pt-2">
                        <span>100k</span><span>75k</span><span>50k</span><span>25k</span><span>0</span>
                      </div>
                      <div className="absolute left-10 right-0 top-0 h-full flex flex-col justify-between pb-8 pt-2 pointer-events-none">
                        {[0,1,2,3,4].map(i => (
                          <div key={i} className="w-full h-px border-t border-dashed border-white/10"></div>
                        ))}
                      </div>
                      <div className="flex justify-around items-end h-full pl-2 pb-8 relative z-10 w-full">
                        {[
                          { label: 'Install', height: '75%', color: 'from-[#be185d] to-[#be185d]/10', delay: '0.1s' },
                          { label: 'Open',    height: '60%', color: 'from-[#db2777] to-[#db2777]/10', delay: '0.2s' },
                          { label: 'Sign Up', height: '60%', color: 'from-[#ec4899] to-[#ec4899]/10', delay: '0.3s' },
                          { label: 'Active',  height: '80%', color: 'from-[#f472b6] to-[#f472b6]/10', delay: '0.4s' },
                        ].map(({ label, height, color, delay }) => (
                          <div key={label} className="flex flex-col items-center gap-3 w-16 group cursor-pointer relative h-full justify-end">
                            <div
                              className={`w-12 bg-gradient-to-b ${color} rounded-t-md relative overflow-hidden group-hover:brightness-110 transition-all origin-bottom landing-bar-grow`}
                              style={{ height, animationDelay: delay }}
                            >
                              <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent"></div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap absolute -bottom-7">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Content */}
                  <div className="border-white/[0.05] bg-[#0A0A0C] border rounded-2xl p-6 md:p-8 relative hover:border-white/[0.1] transition-colors flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-xl font-medium text-white tracking-tight">Top Spending Categories</h2>
                        <p className="text-[13px] text-gray-400 mt-1 font-medium">Last 14 days breakdown</p>
                      </div>
                      <button className="px-4 py-1.5 rounded-md border border-white/10 bg-white/5 text-[13px] font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                        View All
                      </button>
                    </div>

                    <div className="flex items-baseline gap-3 mb-8 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-3xl text-white tracking-tight font-semibold">$4,295.29</span>
                      <span className="text-sm text-gray-400 font-medium">Total monthly spending</span>
                    </div>

                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                      {[
                        { label: 'Housing & Rent', amount: '$1,500', pct: '75%', gradient: 'from-orange-500 via-red-500 to-pink-500', bg: 'from-orange-400 via-red-500 to-pink-600' },
                        { label: 'Food & Dining', amount: '$892', pct: '55%', gradient: 'from-pink-500 to-pink-600', bg: 'from-pink-400 via-pink-500 to-rose-600' },
                        { label: 'Transport', amount: '$345', pct: '40%', gradient: 'from-emerald-500 to-cyan-500', bg: 'from-emerald-400 via-teal-500 to-cyan-600' },
                      ].map(({ label, amount, pct, gradient, bg }) => (
                        <div key={label} className="flex gap-4 items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors -mx-2">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0 shadow-lg ring-1 ring-white/10">
                            <div className={`w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${bg} scale-125 group-hover:scale-110 transition-transform duration-500`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-white truncate pr-2">{label}</h3>
                              <span className="text-sm font-semibold text-white">{amount}</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: pct }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050505] to-transparent z-0 pointer-events-none"></div>
        </div>

        {/* Intelligence Section */}
        <section className="z-10 w-full max-w-7xl mt-32 mx-auto mb-24 relative space-y-20">
          <div className="flex flex-col bg-[#0A0A0C] border-[#ffffff]/10 border rounded-3xl mt-24 mb-24 pt-8 pr-8 pb-16 pl-8 gap-x-16 gap-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 w-full">
              <div className="flex flex-col gap-6 max-w-3xl">
                <div className="flex gap-3 items-center scroll-item scroll-fade-up" style={{ animationPlayState: 'running' }}>
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-500/10 text-[11px] font-mono font-medium text-pink-400 border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.2)]">01</span>
                  <span className="text-sm font-medium tracking-widest uppercase text-gray-500">CORE FEATURES</span>
                </div>
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight scroll-item scroll-fade-up delay-100 font-medium"
                  style={{ animationPlayState: 'running' }}
                >
                  Predictive Analytics <span className="text-gray-600 tracking-tight font-medium">for Modern Growth</span>
                </h2>
                <p
                  className="leading-relaxed text-lg font-light text-gray-400 max-w-xl scroll-item scroll-fade-up delay-200"
                  style={{ animationPlayState: 'running' }}
                >
                  Leverage AI-driven insights to forecast trends, optimize spending, and maximize returns across all your financial channels with precision.
                </p>
              </div>
              <button
                className="group flex items-center gap-2 pl-6 pr-5 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-all duration-200 whitespace-nowrap scroll-item scroll-fade-up delay-300"
                style={{ animationPlayState: 'running' }}
              >
                <span>Explore Features</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[400px] gap-6" id="dashboard-grid">
              {/* ROI Prediction */}
              <div
                className="relative h-[400px] rounded-[2rem] bg-[#0A0A0C] border border-white/10 p-8 overflow-hidden flex flex-col justify-between group hover:border-white/[0.15] transition-colors scroll-item scroll-fade-up delay-100"
                style={{ animationPlayState: 'running' }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0A0A0C] to-[#0A0A0C]"></div>
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="relative z-10">
                  <h3 className="text-4xl text-white tracking-tight font-medium">ROI Prediction</h3>
                  <p className="mt-2 text-lg font-light leading-relaxed text-gray-400">Predict recurring bills and upcoming expenses accurately.</p>
                </div>
                <div className="relative z-10 h-32 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path d="M0 45 L100 45" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"></path>
                    <path d="M0 25 L100 25" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"></path>
                    <defs>
                      <linearGradient id="gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.2 }}></stop>
                        <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0 }}></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0 40 C 20 40, 30 35, 50 20 C 70 5, 80 10, 100 0 V 50 H 0 Z" fill="url(#gradient-area)"></path>
                    <path d="M0 40 C 20 40, 30 35, 50 20 C 70 5, 80 10, 100 0" fill="none" stroke="#ec4899" strokeWidth="2"></path>
                    <foreignObject x="60" y="-10" width="40" height="25">
                      <div className="px-2 py-1 rounded bg-pink-500 text-white text-[10px] text-center shadow-[0_0_10px_rgba(236,72,153,0.5)] font-semibold">
                        <span data-counter-target="24" data-counter-prefix="+">+0</span>%
                      </div>
                    </foreignObject>
                  </svg>
                </div>
              </div>

              {/* Cashflow */}
              <div
                className="relative rounded-[2rem] bg-[#0A0A0C] border border-white/10 p-8 overflow-hidden flex flex-col h-[400px] md:h-[400px] lg:h-[824px] lg:row-span-2 group hover:border-white/[0.15] transition-colors scroll-item scroll-fade-up delay-200"
                style={{ animationPlayState: 'running' }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0A0A0C] to-[#0A0A0C]"></div>
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 100%)' }}></div>
                <div className="relative z-10">
                  <h3 className="text-4xl text-white tracking-tight font-medium">Cashflow</h3>
                  <p className="mt-2 text-lg font-light leading-relaxed text-gray-400 max-w-[26rem]">Income vs outcome trend across the last 6 months.</p>
                </div>
                <div className="relative z-10 flex-1 flex items-center justify-center pt-6">
                  <svg viewBox="0 0 300 300" className="w-[320px] h-[320px] md:w-[360px] md:h-[360px] lg:w-[380px] lg:h-[380px] overflow-visible" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#be185d"></stop>
                        <stop offset="100%" stopColor="#db2777"></stop>
                      </linearGradient>
                      <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f472b6"></stop>
                        <stop offset="100%" stopColor="#ec4899"></stop>
                      </linearGradient>
                    </defs>
                    <g fill="none" stroke="#ffffff" strokeOpacity="0.10" strokeWidth="1" strokeDasharray="3 3">
                      {[22,44,66,88,110].map(r => <circle key={r} cx="150" cy="150" r={r} />)}
                    </g>
                    <g stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1">
                      <line x1="150" y1="150" x2="150" y2="40" />
                      <line x1="150" y1="150" x2="245" y2="95" />
                      <line x1="150" y1="150" x2="245" y2="205" />
                      <line x1="150" y1="150" x2="150" y2="260" />
                      <line x1="150" y1="150" x2="55" y2="205" />
                      <line x1="150" y1="150" x2="55" y2="95" />
                    </g>
                    <g fill="white" fontSize="11" fontWeight="500" textAnchor="middle" dominantBaseline="middle">
                      <text x="150" y="25">Jan</text>
                      <text x="268" y="85">Feb</text>
                      <text x="268" y="215">Mar</text>
                      <text x="150" y="278">Apr</text>
                      <text x="32" y="215">May</text>
                      <text x="32" y="85">Jun</text>
                    </g>
                    <path d="M150 62 L197 122 L188 172 L150 249 L102 177 L74 106 Z" fill="none" stroke="url(#grad-purple)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
                    <path d="M150 95 L240 102 L230 196 L150 254 L80 190 L107 125 Z" fill="none" stroke="url(#grad-cyan)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
                  </svg>
                </div>
              </div>

              {/* Engagement Forecasting */}
              <div
                className="relative h-[400px] rounded-[2rem] bg-[#0A0A0C] border border-white/10 p-8 overflow-hidden flex flex-col group hover:border-white/[0.15] transition-colors scroll-item scroll-fade-up delay-300"
                style={{ animationPlayState: 'running' }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0A0A0C] to-[#0A0A0C]"></div>
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="relative z-10">
                  <h3 className="text-4xl text-white tracking-tight font-medium">Engagement Forecasting</h3>
                  <p className="mt-2 text-lg font-light leading-relaxed text-gray-400">Predict engagement rates for upcoming campaigns.</p>
                </div>
                <div className="relative z-10 flex-1 flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-3xl bg-white/[0.03] border border-white/[0.05] animate-spin" style={{ animationDuration: '25s' }}></div>
                  <div className="absolute w-24 h-24 rounded-2xl bg-white/[0.05] border border-white/[0.05] animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center shadow-[0_12px_30px_-10px_rgba(236,72,153,0.4)] relative z-10">
                    <span className="text-4xl text-white font-medium tracking-tight flex items-baseline">
                      <span data-counter-target="45" data-counter-suffix="k">0k</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion Probability */}
              <div
                className="relative h-[400px] rounded-[2rem] bg-[#0A0A0C] border border-white/10 p-8 overflow-hidden flex flex-col justify-end group hover:border-white/[0.15] transition-colors scroll-item scroll-fade-up delay-500"
                style={{ animationPlayState: 'running' }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0A0A0C] to-[#0A0A0C]"></div>
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center -translate-y-10 z-10">
                  <div className="relative">
                    <span className="text-[8rem] text-white/10 select-none font-medium tracking-tight flex">
                      <span data-counter-target="20" data-counter-suffix="%">0%</span>
                    </span>
                    <div className="absolute top-1/2 left-0 h-[4px] bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.6)] w-full"></div>
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl text-white tracking-tight font-medium">Conversion Probability</h3>
                  <p className="mt-2 text-lg font-light leading-relaxed text-gray-400">Estimate the likelihood of conversions based on data.</p>
                </div>
              </div>

              {/* Channel Performance */}
              <div className="relative h-[400px] rounded-[2rem] bg-[#0A0A0C] border border-white/10 p-8 overflow-hidden flex flex-col justify-end group hover:border-white/[0.15] transition-colors">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#0A0A0C] to-[#0A0A0C]"></div>
                <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="relative z-10 mb-10 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl text-white tracking-tight font-medium">Top Assets</h4>
                    <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-4 pr-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                      All Projects <ChevronRight size={14} className="opacity-70" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-5">
                    {[
                      { label: 'AAPL', pct: '80%', color: 'bg-[#d946ef]', val: '$800' },
                      { label: 'TSLA', pct: '90%', color: 'bg-[#f472b6]', val: '$85K' },
                      { label: 'BTC',  pct: '85%', color: 'bg-[#f87171]', val: '$42K' },
                      { label: 'NVDA', pct: '60%', color: 'bg-[#ec4899]', val: '120' },
                    ].map(({ label, pct, color, val }) => (
                      <div key={label} className="flex items-center gap-4">
                        <span className="w-[110px] shrink-0 text-sm text-gray-300 font-medium truncate">{label}</span>
                        <div className="h-3 flex-1 rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: pct }}></div>
                        </div>
                        <span className="w-12 shrink-0 text-right text-sm text-white font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl text-white tracking-tight font-medium">Channel Performance</h3>
                  <p className="mt-2 text-lg font-light leading-relaxed text-gray-400">Analyze and predict channel-specific effectiveness.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Web Platform Section */}
          <div className="flex flex-col bg-[#0A0A0C] border-[#ffffff]/10 border rounded-3xl mt-24 mb-24 pt-8 pr-8 pb-16 pl-8 gap-x-16 gap-y-16">
            <div className="flex flex-col overflow-hidden lg:flex-row lg:gap-24 mt-12 pt-10 pr-10 pb-10 pl-10 relative gap-x-16 gap-y-16 items-center justify-between">
              {/* Web Mockup */}
              <div className="z-10 shrink-0 w-full lg:w-[500px] relative order-2 lg:order-1">
                <div className="flex flex-col w-full h-[450px] bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative mx-auto">
                  <div className="flex bg-[#0A0A0A] w-full h-10 border-b border-white/5 px-4 items-center gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="flex flex-1 p-4 gap-4">
                    <div className="hidden md:flex w-32 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex-col gap-3">
                      <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                      <div className="w-3/4 h-3 bg-white/5 rounded"></div>
                      <div className="w-full h-3 bg-white/5 rounded"></div>
                      <div className="w-5/6 h-3 bg-white/5 rounded"></div>
                      <div className="w-4/5 h-3 bg-white/5 rounded"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex gap-4">
                        <div className="flex-1 h-20 bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-16 h-16 bg-pink-500/20 blur-xl rounded-full"></div>
                          <div className="w-10 h-3 bg-white/10 rounded mb-2"></div>
                          <div className="w-16 h-5 bg-white/30 rounded"></div>
                        </div>
                        <div className="flex-1 h-20 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                          <div className="w-10 h-3 bg-white/10 rounded mb-2"></div>
                          <div className="w-16 h-5 bg-white/20 rounded"></div>
                        </div>
                      </div>
                      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-end">
                        <div className="flex items-end justify-between h-full gap-2 pt-4">
                          {[30,50,80,40,60,70,100].map((h, i) => (
                            <div
                              key={i}
                              className={`w-full rounded-t-sm transition-colors ${h === 100 ? 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : h === 80 ? 'bg-pink-500/40 hover:bg-pink-500/60' : 'bg-white/5 hover:bg-white/10'}`}
                              style={{ height: `${h}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col w-full gap-8 items-start justify-center z-10 order-1 lg:order-2">
                <div className="flex flex-col gap-6 max-w-xl">
                  <div className="flex gap-3 items-center scroll-item scroll-fade-up" style={{ animationPlayState: 'running' }}>
                    <span className="flex items-center justify-center text-[11px] font-medium text-pink-400 font-mono bg-pink-500/10 w-7 h-7 border-pink-500/20 border rounded-lg shadow-[0_0_10px_rgba(236,72,153,0.2)]">02</span>
                    <span className="uppercase text-sm font-medium text-gray-500 tracking-widest">Web Platform</span>
                  </div>
                  <h2
                    className="md:text-5xl lg:text-6xl leading-[1.1] text-4xl text-white tracking-tight scroll-item scroll-fade-up delay-100 font-medium"
                    style={{ animationPlayState: 'running' }}
                  >
                    Complete control.
                    <span className="text-gray-600 tracking-tight font-medium block mt-2">From any browser.</span>
                  </h2>
                  <p
                    className="leading-relaxed text-lg font-light text-gray-400 mt-2 scroll-item scroll-fade-up delay-200"
                    style={{ animationPlayState: 'running' }}
                  >
                    Experience the full power of personal finance management on the web. Gain deep insights, manage budgets, track your net worth, and generate custom reports with our comprehensive desktop experience.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="group flex items-center gap-2 pl-6 pr-5 py-3 mt-4 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-all duration-200 whitespace-nowrap scroll-item scroll-fade-up delay-300"
                  style={{ animationPlayState: 'running' }}
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="z-10 w-full max-w-7xl mx-auto pb-12 px-6">
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/SmartFinance_LOGO_1.png" alt="SmartFinance" className="w-6 h-6 object-contain" />
              <span className="text-sm font-medium text-white">SmartFinance</span>
            </div>
            <p className="text-xs text-gray-600">© 2026 SmartFinance. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/login" className="text-xs text-gray-500 hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="text-xs text-gray-500 hover:text-white transition-colors">Get Started</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
