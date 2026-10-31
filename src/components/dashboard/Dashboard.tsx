import { useState } from 'react';
import { RefreshCw, Wind, Droplets, Thermometer, Radio, AlertTriangle, TrendingUp, Users, Eye, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useApp } from '../../App';
import { NEIGHBORHOODS, SENSORS, ALERTS, COMMUNITY_REPORTS, getAQICategory, generateHourlyData, generateTrendData } from '../../data/demoData';
import { useNavigate } from 'react-router-dom';

function AQIGauge({ aqi }: { aqi: number }) {
  const cat = getAQICategory(aqi);
  const pct = Math.min(aqi / 500, 1);
  const r = 55;
  const stroke = 2 * Math.PI * r;
  const dash = stroke * pct * 0.75;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-32">
        <svg viewBox="0 0 140 115" className="w-full h-full">
          <path
            d="M 20 95 A 50 50 0 1 1 120 95"
            fill="none" stroke="#162d5e" strokeWidth="11" strokeLinecap="round"
          />
          <path
            d="M 20 95 A 50 50 0 1 1 120 95"
            fill="none"
            stroke={cat.color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${dash * 2.09} ${(stroke - dash) * 2.09}`}
            style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 8px ${cat.color}66)` }}
          />
          <text x="70" y="80" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="900" fontFamily="monospace">{aqi}</text>
          <text x="70" y="100" textAnchor="middle" fill={cat.color} fontSize="10" fontWeight="700">{cat.label.toUpperCase()}</text>
        </svg>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, unit, color, sub, alert }: any) {
  return (
    <div className="hud-panel p-4 flex items-start gap-3 hover:border-cyan-500/40 transition-all">
      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: color + '1c' }}>
        <Icon size={19} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center justify-between">
          <span>{label}</span>
          {alert && <span className="w-2 h-2 rounded-full bg-red-500 critical-blink" />}
        </div>
        <div className="text-xl font-black text-white font-mono mt-0.5">
          {value}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
        </div>
        {sub && <div className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="hud-panel p-3 text-xs border border-cyan-500/30">
        <p className="text-slate-400 mb-1 font-mono">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-mono">
            {p.name}: <span className="font-bold text-white">{Math.round(p.value)}</span>
          </p>
        ))}
        <p className="text-slate-600 text-[10px] mt-1 border-t border-navy-700 pt-1">DEMO telemetry stream</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { selectedNeighborhood, setSelectedNeighborhood } = useApp();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  const neighborhood = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;
  const sensor = SENSORS.find(s => s.neighborhood === selectedNeighborhood) || SENSORS[0];
  const aqiCat = getAQICategory(sensor.aqi);
  const hourlyData = generateHourlyData(sensor.aqi);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const onlineSensors = SENSORS.filter(s => s.status === 'online').length;
  const offlineSensors = SENSORS.filter(s => s.status !== 'online').length;

  const topPolluted = [...SENSORS].sort((a, b) => b.pm25 - a.pm25).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Command Bar */}
      <div className="hud-panel p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-black text-white tracking-wide">
              Real-Time Atmospheric Intelligence Center
            </h1>
            <span className="badge bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
              TELEMETRY LIVE
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Sector: <strong className="text-white">{neighborhood.name}</strong> · Continuous urban air quality surveillance · Simulated DEMO data
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="select-field text-xs py-1.5"
          >
            <option value="6h">Rolling 6 Hours</option>
            <option value="24h">Rolling 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <button onClick={handleRefresh} className="btn-secondary py-1.5 text-xs">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Live Refresh'}
          </button>
        </div>
      </div>

      {/* AQI Core Gauge + Environmental Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Core AQI Card */}
        <div
          className="hud-panel lg:col-span-1 flex flex-col items-center justify-center p-5 border-2 text-center"
          style={{ borderColor: aqiCat.color + '55', boxShadow: `0 0 24px -6px ${aqiCat.color}33` }}
        >
          <div className="text-[11px] text-slate-400 font-mono tracking-widest uppercase mb-1">
            AIR QUALITY INDEX
          </div>
          <AQIGauge aqi={sensor.aqi} />
          <div className="text-xs font-semibold text-slate-300 mt-1">
            {aqiCat.emoji} {aqiCat.label}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{neighborhood.name} Sector Node</div>
        </div>

        {/* Telemetry Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-3.5">
          <MetricCard icon={Wind} label="PM2.5 Density" value={sensor.pm25} unit="µg/m³" color="#ef4444" sub="Indian Std: 60 µg/m³" alert={sensor.pm25 > 150} />
          <MetricCard icon={Wind} label="PM10 Density" value={sensor.pm10} unit="µg/m³" color="#f97316" sub="Indian Std: 100 µg/m³" alert={sensor.pm10 > 250} />
          <MetricCard icon={Thermometer} label="Ambient Temp" value={sensor.temp.toFixed(1)} unit="°C" color="#06b6d4" sub="Dewpoint: 17.8°C" />
          <MetricCard icon={Droplets} label="Relative Humidity" value={sensor.humidity} unit="%" color="#8b5cf6" sub="Inversion potential" />
          <MetricCard icon={Wind} label="Surface Wind" value="6.8" unit="km/h" color="#22d3ee" sub="NW 315° · Moving SE" />
          <MetricCard icon={Radio} label="IoT Network Active" value={`${onlineSensors}/${SENSORS.length}`} unit="Nodes" color="#22c55e" sub={`${offlineSensors} offline/calibrating`} />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Trend Chart */}
        <div className="hud-panel p-5">
          <div className="section-title text-sm mb-3">
            <TrendingUp size={16} className="text-emerald-400" />
            24-Hour Particulate Concentration Trend
            <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] ml-auto">HOURLY</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2.2} dot={false} name="PM2.5" />
              <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={1.8} dot={false} name="PM10" strokeDasharray="3 2" />
              <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical (150)', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Safe (60)', fill: '#22c55e', fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cross-Sector Comparative Bar */}
        <div className="hud-panel p-5">
          <div className="section-title text-sm mb-3">
            <Eye size={16} className="text-cyan-400" />
            Cross-Sector Pollution Comparison (PM2.5 & PM10)
            <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] ml-auto">SECTOR HUD</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={SENSORS.map(s => ({
              name: s.label.split('-')[0],
              pm25: s.pm25,
              pm10: s.pm10,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pm25" fill="#ef4444" radius={[3, 3, 0, 0]} name="PM2.5" fillOpacity={0.88} />
              <Bar dataKey="pm10" fill="#f97316" radius={[3, 3, 0, 0]} name="PM10" fillOpacity={0.65} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Feeds & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Polluted Sectors */}
        <div className="hud-panel p-4">
          <div className="section-title text-sm mb-3">
            <AlertTriangle size={15} className="text-red-400" />
            Peak Critical Hotspots
          </div>
          <div className="space-y-2">
            {topPolluted.map((s, i) => {
              const cat = getAQICategory(s.aqi);
              return (
                <div key={s.id} className="flex items-center gap-2 py-1.5 border-b border-navy-800/40">
                  <span className="text-slate-500 font-mono text-xs w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      {s.label}
                      {s.pm25 > 150 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 critical-blink" />}
                    </div>
                    <div className="text-[10px] text-slate-500">{s.neighborhood.toUpperCase()} · Status {s.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold" style={{ color: cat.color }}>{s.pm25} µg</div>
                    <div className="text-[10px] text-slate-500">{cat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Alerts */}
        <div className="hud-panel p-4">
          <div className="section-title text-sm mb-3">
            <ShieldAlert size={15} className="text-orange-400" />
            Active Warning Alerts
          </div>
          <div className="space-y-2">
            {ALERTS.slice(0, 4).map(alert => {
              const isCrit = alert.severity === 'critical';
              return (
                <div
                  key={alert.id}
                  onClick={() => navigate('/critical-zones')}
                  className="p-2 rounded-lg bg-navy-950/60 hover:bg-navy-900 border border-navy-800/70 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-red-500 critical-blink' : 'bg-orange-500'}`} />
                      {alert.message}
                    </span>
                    <span className={`text-[10px] font-mono px-1 rounded ${isCrit ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{alert.neighborhood} · {alert.reason}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Citizen Reports */}
        <div className="hud-panel p-4">
          <div className="section-title text-sm mb-3">
            <Users size={15} className="text-purple-400" />
            Verified Community Feeds
          </div>
          <div className="space-y-2">
            {COMMUNITY_REPORTS.slice(0, 4).map(r => (
              <div
                key={r.id}
                onClick={() => navigate('/community')}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-navy-950/60 hover:bg-navy-900 border border-navy-800/70 cursor-pointer transition-all"
              >
                <span className="text-lg">
                  {r.category === 'smoke' ? '🔥' : r.category === 'construction' ? '🏗️' : '🌪️'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{r.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                    <span>{r.neighborhood.toUpperCase()}</span>
                    <span className="text-emerald-400">+{r.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
