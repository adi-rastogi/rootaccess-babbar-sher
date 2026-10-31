import { useState } from 'react';
import { Bell, Menu, Compass, RefreshCw, MapPin, ChevronDown, Presentation } from 'lucide-react';
import { useApp } from '../../App';
import { NEIGHBORHOODS } from '../../data/demoData';

export default function TopNav() {
  const { setSidebarOpen, selectedNeighborhood, setSelectedNeighborhood, setTourActive, demoMode, setDemoMode, notifications } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const current = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;

  const notifList = [
    { icon: '🚨', msg: 'Critical AQI in Narela (289)', time: '6m ago', color: 'text-red-400' },
    { icon: '⚠️', msg: 'Sensor S006 offline (Lajpat Nagar)', time: '3h ago', color: 'text-orange-400' },
    { icon: '📈', msg: 'PM2.5 spike in RK Puram', time: '1h ago', color: 'text-yellow-400' },
    { icon: '✅', msg: 'Community report verified', time: '2h ago', color: 'text-emerald-400' },
  ];

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-700 flex items-center gap-4 px-4 flex-shrink-0 z-20">
      {/* Mobile menu */}
      <button
        className="md:hidden text-slate-400 hover:text-white"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Neighborhood selector */}
      <div className="flex items-center gap-2 bg-navy-800 border border-navy-600 rounded-lg px-3 py-1.5 cursor-pointer hover:border-emerald-500/40 transition-colors">
        <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
        <select
          value={selectedNeighborhood}
          onChange={e => setSelectedNeighborhood(e.target.value as any)}
          className="bg-transparent text-slate-200 text-sm focus:outline-none cursor-pointer pr-1"
        >
          {NEIGHBORHOODS.map(n => (
            <option key={n.id} value={n.id} className="bg-navy-800">
              {n.name}
            </option>
          ))}
        </select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Demo mode toggle */}
      <button
        onClick={() => setDemoMode(!demoMode)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
          ${demoMode
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
            : 'bg-navy-800 border-navy-600 text-slate-400 hover:text-slate-200'
          }
        `}
      >
        <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
        {demoMode ? 'DEMO MODE' : 'Live Mode'}
      </button>

      {/* Guided tour */}
      <button
        onClick={() => setTourActive(true)}
        className="btn-secondary hidden md:flex"
      >
        <Presentation size={14} />
        Take a Guided Tour
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full notif-pulse" />
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-navy-800 border border-navy-600 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-navy-700 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <span className="badge badge-demo">{notifications} new</span>
            </div>
            {notifList.map((n, i) => (
              <div key={i} className="px-4 py-3 border-b border-navy-700/50 flex items-start gap-3 hover:bg-navy-700/30 cursor-pointer">
                <span className="text-lg">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${n.color}`}>{n.msg}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 text-xs text-slate-500 text-center">DEMO alerts — not real environmental data</div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
        DE
      </div>
    </header>
  );
}

