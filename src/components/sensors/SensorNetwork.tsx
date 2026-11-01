import { useState } from 'react';
import { Radio, Search, Filter, Battery, Wifi, Clock, CheckCircle, AlertTriangle, XCircle, Server, ShieldCheck, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SENSORS, getAQICategory, getStatusColor, generateHourlyData } from '../../data/demoData';
import { useApp } from '../../App';
import { getLiveAQICategory } from '../../services/airQualityService';

const STATUS_ICONS: Record<string, any> = {
  online: CheckCircle,
  offline: XCircle,
  malfunction: AlertTriangle,
  calibration: AlertTriangle,
};

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  offline: '#ef4444',
  malfunction: '#f97316',
  calibration: '#eab308',
};

export default function SensorNetwork() {
  const { liveData, isLiveMode } = useApp();
  const [tab, setTab] = useState<'live' | 'openaq' | 'iot'>('live');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDemo, setSelectedDemo] = useState<any>(SENSORS[0]);
  const [selectedLive, setSelectedLive] = useState<any>(null);

  const activeLiveList = liveData?.stations || [];
  const activeSelected = selectedLive || activeLiveList[0] || selectedDemo;

  const filteredDemo = SENSORS.filter(s => {
    const matchSearch = s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredLive = activeLiveList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = generateHourlyData(activeSelected?.aqi || 194);

  const liveCounts = {
    total: activeLiveList.length,
    severe: activeLiveList.filter(s => s.aqi > 300).length,
    poor: activeLiveList.filter(s => s.aqi > 200 && s.aqi <= 300).length,
    moderate: activeLiveList.filter(s => s.aqi <= 200).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Sensor &amp; Regulatory Monitor Network
            <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              WAQI &amp; OpenAQ LIVE
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time feed fusing WAQI Delhi station telemetry with OpenAQ v3 CPCB/DPCC regulatory reference nodes
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-navy-900 border border-navy-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'live' ? 'bg-cyan-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live WAQI Stations ({activeLiveList.length})
          </button>
          <button
            onClick={() => setTab('openaq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'openaq' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            OpenAQ Monitors ({liveData?.openaqMonitors.length || 5})
          </button>
          <button
            onClick={() => setTab('iot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'iot' ? 'bg-purple-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            IoT Ward Nodes ({SENSORS.length})
          </button>
        </div>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Live Delhi Stations', value: liveCounts.total || 14, color: '#22d3ee', icon: Radio },
          { label: 'Severe Hotspots (>300)', value: liveCounts.severe, color: '#dc2626', icon: AlertTriangle },
          { label: 'Poor Smog Zones (201-300)', value: liveCounts.poor, color: '#ef4444', icon: CheckCircle },
          { label: 'OpenAQ Regulatory Monitors', value: liveData?.openaqMonitors.length || 5, color: '#10b981', icon: Server },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="hud-panel flex items-center gap-3 p-4">
              <Icon size={22} style={{ color: item.color }} />
              <div>
                <div className="text-xl font-bold text-white font-mono">{item.value}</div>
                <div className="text-xs text-slate-400">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main layout */}
      {tab === 'openaq' ? (
        /* OpenAQ Regulatory Monitors View */
        <div className="hud-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server size={18} className="text-emerald-400" />
                OpenAQ v3 Regulatory Monitors in Delhi NCR
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Government reference stations operated by CPCB (Central Pollution Control Board) and DPCC
              </p>
            </div>
            <span className="badge bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
              OpenAQ v3 Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(liveData?.openaqMonitors || []).map(m => (
              <div key={m.id} className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 hover:border-emerald-500/40 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">ID: {m.id}</span>
                    <h3 className="font-bold text-white text-sm mt-1">{m.name}</h3>
                    <p className="text-xs text-emerald-400 mt-0.5">{m.provider}</p>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Coordinates: {m.lat.toFixed(4)}° N, {m.lng.toFixed(4)}° E
                </div>

                <div className="border-t border-navy-800 pt-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-mono mb-1.5">Monitored Parameters:</div>
                  <div className="flex flex-wrap gap-1">
                    {m.sensors.map(s => (
                      <span key={s.id} className="px-2 py-0.5 rounded bg-navy-900 border border-navy-700 text-slate-300 text-[10px] font-mono">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Live WAQI / IoT Layout */
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Station list */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="hud-panel p-4">
              {/* Search */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Delhi stations..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-8 text-xs w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {tab === 'live' ? (
                  filteredLive.map(s => {
                    const cat = getLiveAQICategory(s.aqi);
                    const isSel = activeSelected?.uid === s.uid;
                    return (
                      <div
                        key={s.uid}
                        onClick={() => setSelectedLive(s)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow'
                            : 'bg-navy-950/60 border-navy-800/80 hover:bg-navy-900 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-bold text-xs truncate text-white">{s.shortName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{s.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs" style={{ color: cat.color }}>
                            AQI {s.aqi}
                          </div>
                          <div className="text-[9px] font-bold uppercase" style={{ color: cat.color }}>
                            {cat.label.split(' ')[0]}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  filteredDemo.map(s => {
                    const isSel = activeSelected?.id === s.id;
                    const cat = getAQICategory(s.aqi);
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedDemo(s)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow'
                            : 'bg-navy-950/60 border-navy-800/80 hover:bg-navy-900 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-bold text-xs truncate text-white">{s.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{s.neighborhood.toUpperCase()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs" style={{ color: cat.color }}>
                            AQI {s.aqi}
                          </div>
                          <div className="text-[9px] text-slate-400">PM2.5: {s.pm25}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Station details */}
          {activeSelected && (
            <div className="flex-1 space-y-4">
              <div className="hud-panel p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-xs">
                        {tab === 'live' ? 'WAQI LIVE STATION' : 'IOT SENSOR'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {tab === 'live' ? `UID: ${activeSelected.uid}` : `ID: ${activeSelected.id}`}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      {activeSelected.name || activeSelected.label}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coordinates: {activeSelected.lat?.toFixed(4)}° N, {activeSelected.lng?.toFixed(4)}° E · DPCC Network
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-black font-mono" style={{ color: getLiveAQICategory(activeSelected.aqi).color }}>
                      {activeSelected.aqi}
                    </div>
                    <div className="text-xs font-bold uppercase" style={{ color: getLiveAQICategory(activeSelected.aqi).color }}>
                      {getLiveAQICategory(activeSelected.aqi).label}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                    <div className="text-[11px] text-slate-400">PM2.5 Density</div>
                    <div className="text-lg font-black font-mono text-red-400 mt-0.5">{activeSelected.pm25} µg/m³</div>
                    <div className="text-[10px] text-slate-500">Std: 60 µg/m³</div>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                    <div className="text-[11px] text-slate-400">PM10 Density</div>
                    <div className="text-lg font-black font-mono text-orange-400 mt-0.5">{activeSelected.pm10} µg/m³</div>
                    <div className="text-[10px] text-slate-500">Std: 100 µg/m³</div>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                    <div className="text-[11px] text-slate-400">Temperature</div>
                    <div className="text-lg font-black font-mono text-cyan-400 mt-0.5">24.2 °C</div>
                    <div className="text-[10px] text-slate-500">Surface Layer</div>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-navy-800">
                    <div className="text-[11px] text-slate-400">Relative Humidity</div>
                    <div className="text-lg font-black font-mono text-purple-400 mt-0.5">88 %</div>
                    <div className="text-[10px] text-slate-500">Inversion Active</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="hud-panel p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" />
                    24-Hour Particulate Concentration Profile
                  </div>
                  <span className="badge bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">HOURLY</span>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#091322', border: '1px solid #162d5e', borderRadius: '12px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2.2} dot={false} name="PM2.5" />
                    <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={1.8} dot={false} name="PM10" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
