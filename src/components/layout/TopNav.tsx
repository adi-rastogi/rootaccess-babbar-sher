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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 flex-shrink-0 z-20 shadow-sm">
      {/* Mobile menu */}
      <button
        className="md:hidden text-slate-600 hover:text-slate-900"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Neighborhood selector */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:border-emerald-500/50 transition-colors shadow-sm">
        <MapPin size={14} className="text-emerald-600 flex-shrink-0" />
        <select
          value={selectedNeighborhood}
          onChange={e => setSelectedNeighborhood(e.target.value as any)}
          className="bg-transparent text-slate-800 font-semibold text-sm focus:outline-none cursor-pointer pr-1"
        >
          {NEIGHBORHOODS.map(n => (
            <option key={n.id} value={n.id} className="bg-white text-slate-800">
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
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm
          ${demoMode
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          }
        `}
      >
        <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`} />
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
          className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full critical-sonar" />
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              <span className="badge badge-demo">{notifications} new</span>
            </div>
            {notifList.map((n, i) => (
              <div key={i} className="px-4 py-3 border-b border-slate-100 flex items-start gap-3 hover:bg-slate-50 cursor-pointer">
                <span className="text-lg">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${n.color}`}>{n.msg}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 text-xs text-slate-500 text-center bg-slate-50">DEMO alerts — not real environmental data</div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-800 shadow-sm">
        DE
      </div>
    </header>
  );
}

