import { useState } from 'react';
import { Bell, Menu, Compass, RefreshCw, MapPin, ChevronDown, Presentation, Radio, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../App';
import { NEIGHBORHOODS } from '../../data/demoData';

export default function TopNav() {
  const {
    setSidebarOpen,
    selectedNeighborhood,
    setSelectedNeighborhood,
    setTourActive,
    demoMode,
    setDemoMode,
    notifications,
    liveData,
    isFetchingLive,
    refreshLiveData,
    selectedStation,
    setSelectedStation,
    isLiveMode,
    setIsLiveMode,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const current = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;

  const notifList = [
    { icon: '🔴', msg: 'Live WAQI & OpenAQ CPCB feed active', time: 'Just now', color: 'text-emerald-400' },
    { icon: '🚨', msg: 'Critical AQI 412 detected at ITI Jahangirpuri', time: 'Live', color: 'text-red-400' },
    { icon: '⚠️', msg: 'Severe particulate surge at Wazirpur (AQI 370)', time: 'Live', color: 'text-orange-400' },
    { icon: '📡', msg: 'OpenAQ Regulatory Monitors reporting for Delhi NCR', time: 'Verified', color: 'text-cyan-400' },
  ];

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-700 flex items-center gap-3 sm:gap-4 px-3 sm:px-4 flex-shrink-0 z-20">
      {/* Mobile menu */}
      <button
        className="md:hidden text-slate-400 hover:text-white p-1"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Real Station / Neighborhood Selector */}
      <div className="flex items-center gap-2 bg-navy-950/90 border border-cyan-500/40 rounded-xl px-2.5 sm:px-3 py-1.5 cursor-pointer hover:border-cyan-400 transition-all shadow-sm">
        <MapPin size={14} className="text-cyan-400 flex-shrink-0" />
        {isLiveMode && liveData?.stations && liveData.stations.length > 0 ? (
          <select
            value={selectedStation?.uid || liveData.stations[0].uid}
            onChange={e => {
              const uid = parseInt(e.target.value, 10);
              const found = liveData.stations.find(s => s.uid === uid);
              if (found) setSelectedStation(found);
            }}
            className="bg-transparent text-slate-200 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer pr-1 max-w-[140px] sm:max-w-[220px] truncate"
          >
            {liveData.stations.map(st => (
              <option key={st.uid} value={st.uid} className="bg-navy-900 text-white">
                {st.shortName} (AQI {st.aqi})
              </option>
            ))}
          </select>
        ) : (
          <select
            value={selectedNeighborhood}
            onChange={e => setSelectedNeighborhood(e.target.value as any)}
            className="bg-transparent text-slate-200 text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
          >
            {NEIGHBORHOODS.map(n => (
              <option key={n.id} value={n.id} className="bg-navy-900 text-white">
                {n.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Live WAQI & OpenAQ Feed Pill */}
      <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-mono font-bold text-emerald-300">
          WAQI &amp; OpenAQ LIVE
        </span>
        <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
          {liveData?.lastUpdated ? `Sync: ${liveData.lastUpdated}` : 'Syncing...'}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Real-time Refresh Button */}
      <button
        onClick={() => refreshLiveData(true)}
        disabled={isFetchingLive}
        className="p-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all cursor-pointer disabled:opacity-50"
        title="Refresh Real-Time Data from WAQI and OpenAQ"
      >
        <RefreshCw size={14} className={isFetchingLive ? "animate-spin text-cyan-400" : ""} />
      </button>

      {/* Mode toggle (Live Real-Time vs Demo Simulation) */}
      <button
        onClick={() => {
          setIsLiveMode(!isLiveMode);
          setDemoMode(isLiveMode); // Invert demoMode
        }}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer
          ${isLiveMode
            ? 'bg-gradient-to-r from-emerald-600/30 to-navy-900 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/10'
            : 'bg-navy-800 border-navy-600 text-slate-400 hover:text-slate-200'
          }
        `}
        title={isLiveMode ? "Using live data from WAQI & OpenAQ APIs" : "Using simulated test data"}
      >
        <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
        <span className="hidden sm:inline">{isLiveMode ? '🔴 REAL-TIME LIVE' : 'SIMULATION'}</span>
        <span className="sm:hidden">{isLiveMode ? 'LIVE' : 'DEMO'}</span>
      </button>

      {/* Guided tour */}
      <button
        onClick={() => setTourActive(true)}
        className="btn-secondary hidden md:flex text-xs py-1.5 px-3 cursor-pointer"
      >
        <Presentation size={13} />
        Guided Tour
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full notif-pulse" />
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-navy-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Live Environmental Alerts</span>
              <span className="badge bg-emerald-500/20 text-emerald-300 text-[10px]">REAL-TIME</span>
            </div>
            {notifList.map((n, i) => (
              <div key={i} className="px-4 py-3 border-b border-navy-800/60 flex items-start gap-3 hover:bg-navy-800/40 cursor-pointer">
                <span className="text-sm">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${n.color}`}>{n.msg}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 text-[10px] text-slate-400 text-center bg-navy-950">
              Sourced via WAQI (delhi feed) &amp; OpenAQ v3 CPCB network
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400">
        PM
      </div>
    </header>
  );
}

