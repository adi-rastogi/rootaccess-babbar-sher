import { useState, useEffect, useRef } from 'react';
import {
  RefreshCw, Wind, Droplets, Thermometer, Radio, AlertTriangle, TrendingUp, Users,
  Eye, Activity, ShieldAlert, Sparkles, MapPin, Compass, Navigation, ArrowUpRight,
  HeartPulse, ShieldCheck, Play, Layers, Clock
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, AreaChart, Area
} from 'recharts';
import { useApp } from '../../App';
import { NEIGHBORHOODS, SENSORS, ALERTS, COMMUNITY_REPORTS, getAQICategory, generateHourlyData, getStatusColor } from '../../data/demoData';
import { useNavigate } from 'react-router-dom';

declare const L: any;

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
  const { selectedNeighborhood, setSelectedNeighborhood, setTourActive } = useApp();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const miniMapRef = useRef<any>(null);
  const miniMapInstance = useRef<any>(null);
  const miniMarkersRef = useRef<any[]>([]);

  const neighborhood = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;
  const sensor = SENSORS.find(s => s.neighborhood === selectedNeighborhood) || SENSORS[0];
  const aqiCat = getAQICategory(sensor.aqi);
  const hourlyData = generateHourlyData(sensor.aqi);

  // Live telemetry clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Dashboard Mini Map
  useEffect(() => {
    if (!miniMapRef.current) return;

    if ((miniMapRef.current as any)._leaflet_id) {
      (miniMapRef.current as any)._leaflet_id = null;
    }

    if (miniMapInstance.current) {
      try { miniMapInstance.current.remove(); } catch (e) {}
      miniMapInstance.current = null;
    }

    try {
      if (typeof L !== 'undefined') {
        const map = L.map(miniMapRef.current, {
          center: [neighborhood.lat, neighborhood.lng],
          zoom: 11,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        }).addTo(map);

        miniMapInstance.current = map;
        renderMiniMapSensors(map);
      }
    } catch (err) {
      console.error('Mini map error:', err);
    }

    return () => {
      if (miniMapInstance.current) {
        try { miniMapInstance.current.remove(); } catch (e) {}
        miniMapInstance.current = null;
      }
    };
  }, []);

  // Update center when neighborhood changes
  useEffect(() => {
    if (!miniMapInstance.current) return;
    miniMapInstance.current.flyTo([neighborhood.lat, neighborhood.lng], 12, { duration: 1 });
    renderMiniMapSensors(miniMapInstance.current);
  }, [selectedNeighborhood]);

  function renderMiniMapSensors(map: any) {
    if (!map || typeof L === 'undefined') return;

    miniMarkersRef.current.forEach(m => {
      try { m.remove(); } catch (e) {}
    });
    miniMarkersRef.current = [];

    SENSORS.forEach(s => {
      const isSelected = s.neighborhood === selectedNeighborhood;
      const cat = getAQICategory(s.aqi);

      // Outer aura
      const circle = L.circle([s.lat, s.lng], {
        radius: isSelected ? 1800 : 1200,
        fillColor: cat.color,
        fillOpacity: isSelected ? 0.35 : 0.15,
        color: cat.color,
        weight: isSelected ? 2.5 : 1,
        opacity: isSelected ? 0.9 : 0.4,
      }).addTo(map);

      // Marker pin
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            background: #0f2044;
            border: 2px solid ${isSelected ? '#ffffff' : cat.color};
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #ffffff; font-size: ${isSelected ? '10px' : '8px'}; font-weight: 800;
            box-shadow: 0 0 12px ${cat.color};
            cursor: pointer;
          ">
            ${s.pm25}
          </div>
        `,
        iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
        iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
      });

      const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
      marker.on('click', () => setSelectedNeighborhood(s.neighborhood as any));
      marker.bindTooltip(`<b>${s.label}</b><br/>PM2.5: ${s.pm25} µg/m³ · AQI: ${s.aqi}`, { className: 'leaflet-popup-content-wrapper' });

      miniMarkersRef.current.push(circle);
      miniMarkersRef.current.push(marker);
    });
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const onlineSensors = SENSORS.filter(s => s.status === 'online').length;
  const offlineSensors = SENSORS.filter(s => s.status !== 'online').length;
  const topPolluted = [...SENSORS].sort((a, b) => b.pm25 - a.pm25).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🚀 UPGRADED HERO SECTION: SMART CITY ENVIRONMENTAL COMMAND CENTER */}
      <div className="hud-panel p-6 sm:p-8 relative overflow-hidden border-cyan-500/40 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            {/* Live Status Tickers */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="hud-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                NCR AIRSPACE RADAR ACTIVE
              </span>
              <span className="hud-badge bg-navy-900 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
                IST {currentTime}
              </span>
              <span className="hud-badge bg-red-500/20 text-red-300 border border-red-500/40 text-xs critical-blink">
                2 CRITICAL EMERGENCY ZONES
              </span>
              <span className="hud-badge bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono">
                NW 6.8 km/h DRIFT
              </span>
            </div>

            {/* Hero Main Heading & Subtitle */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                POLLUTION<span className="text-emerald-400">MITRA</span>
                <span className="text-cyan-400 text-base sm:text-xl font-normal ml-3 font-mono">
                  // Street-by-Street Environmental Defense
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Hyper-local environmental intelligence analyzing wind-aware particulate plume dispersion, Diwali smog impact, real-time IoT calibration, and low-exposure eco-mobility routes for Delhi-NCR.
              </p>
            </div>

            {/* Quick Sector Selector Chips in Hero */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} className="text-cyan-400" />
                Fast Sector Switcher:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {NEIGHBORHOODS.map(n => {
                  const s = SENSORS.find(sen => sen.neighborhood === n.id) || SENSORS[0];
                  const c = getAQICategory(s.aqi);
                  const isCur = n.id === selectedNeighborhood;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNeighborhood(n.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
                        isCur
                          ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-navy-950/80 border-navy-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                      {n.name.split(' ')[0]}
                      <span style={{ color: c.color }}>{s.aqi}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Health Advisory Bar */}
            <div className="p-3 rounded-xl bg-navy-950/80 border border-amber-500/40 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div className="text-xs text-amber-200/90 leading-tight">
                <strong>Advisory ({neighborhood.name}):</strong> {sensor.aqi > 250
                  ? 'Severe Inversion Trap. Vulnerable groups stay indoors, N95 respirators required for outdoor transit.'
                  : sensor.aqi > 150
                  ? 'Unhealthy Air. Morning joggers shift exercise window to solar noon (12:00 - 15:00).'
                  : 'Air quality within acceptable bounds for outdoor activity.'}
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <button
                onClick={() => navigate('/map')}
                className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-bold"
              >
                <Compass size={14} />
                Live GIS Flow Heatmap
              </button>
              <button
                onClick={() => setTourActive(true)}
                className="btn-secondary text-xs py-2.5 px-4 border-cyan-500/40 text-cyan-300 hover:text-white flex items-center gap-2 font-bold"
              >
                <Play size={13} />
                Voice Guided Tour
              </button>
              <button
                onClick={() => navigate('/critical-zones')}
                className="btn-secondary text-xs py-2.5 px-4 border-red-500/40 text-red-300 hover:text-white flex items-center gap-2 font-bold"
              >
                <AlertTriangle size={13} />
                Critical Radar
              </button>
              <button
                onClick={() => navigate('/simulator')}
                className="btn-secondary text-xs py-2.5 px-4 border-purple-500/40 text-purple-300 hover:text-white flex items-center gap-2 font-bold"
              >
                <Sparkles size={13} />
                Policy Simulator
              </button>
            </div>
          </div>

          {/* Hero Quick Telemetry HUD Card */}
          <div className="w-full lg:w-80 bg-navy-950/90 p-5 rounded-2xl border border-cyan-500/40 flex flex-col justify-between space-y-4 shadow-2xl flex-shrink-0">
            <div className="flex items-center justify-between border-b border-navy-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400" />
                <span className="text-[11px] font-mono text-slate-300 font-bold uppercase">Focus Telemetry</span>
              </div>
              <span className="badge bg-cyan-500/20 text-cyan-400 text-xs font-bold">{neighborhood.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-black font-mono text-white tracking-tight">{sensor.pm25}</div>
                <div className="text-[11px] text-slate-400 font-medium">µg/m³ PM2.5</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-mono" style={{ color: aqiCat.color }}>{sensor.aqi}</div>
                <div className="text-xs font-black uppercase tracking-wider" style={{ color: aqiCat.color }}>{aqiCat.label}</div>
              </div>
            </div>

            {/* Gauge preview mini */}
            <div className="py-1">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span>0 (Good)</span>
                <span>200 (Poor)</span>
                <span>500 (Hazardous)</span>
              </div>
              <div className="h-2 bg-navy-900 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (sensor.aqi / 500) * 100)}%`,
                    background: aqiCat.color,
                    boxShadow: `0 0 10px ${aqiCat.color}`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2.5 border-t border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono"><Wind size={12} className="text-cyan-400" />NW 6.8 km/h</span>
              <span className="text-emerald-400 font-mono font-bold">8/8 Nodes Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* AQI Core Gauge + Key Metrics */}
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

      {/* 🗺️ LIVE MAP EMBEDDED IN DASHBOARD + HOURLY TELEMETRY CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live GIS Radar Mini Map */}
        <div className="hud-panel p-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                Live Regional Environmental Radar ({neighborhood.name})
              </h2>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              Full GIS View
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-navy-700 flex-1" style={{ minHeight: '260px' }}>
            <div ref={miniMapRef} className="w-full h-full" style={{ minHeight: '260px' }} />

            {/* In-Map Sector Quick Selector */}
            <div className="absolute bottom-3 left-3 right-3 z-10 hud-panel p-2 flex items-center justify-between text-xs bg-navy-950/90 shadow-xl">
              <span className="text-slate-400 text-[11px] font-mono">Quick Switch Sector:</span>
              <div className="flex gap-1 overflow-x-auto max-w-[70%]">
                {NEIGHBORHOODS.slice(0, 4).map(n => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNeighborhood(n.id as any)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      selectedNeighborhood === n.id
                        ? 'bg-emerald-500 text-navy-950 font-bold'
                        : 'bg-navy-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {n.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Trend Chart */}
        <div className="hud-panel p-5">
          <div className="section-title text-sm mb-3">
            <TrendingUp size={16} className="text-emerald-400" />
            24-Hour Particulate Concentration Trend ({neighborhood.name})
            <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] ml-auto">HOURLY</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2.4} dot={false} name="PM2.5" />
              <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={1.8} dot={false} name="PM10" strokeDasharray="3 2" />
              <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical (150)', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Safe (60)', fill: '#22c55e', fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* UNIQUE SECTION: RESPIRATORY SENSITIVITY & HEALTH RISK MATRIX */}
      <div className="hud-panel p-5 border-emerald-500/30">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white">
              Biosphere & Vulnerable Demographics Health Advisory Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-400">Based on active PM2.5 ({sensor.pm25} µg/m³)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {[
            {
              group: 'Children & Schools',
              risk: sensor.pm25 > 150 ? 'HIGH RISK' : sensor.pm25 > 80 ? 'MODERATE' : 'LOW RISK',
              color: sensor.pm25 > 150 ? '#ef4444' : sensor.pm25 > 80 ? '#f59e0b' : '#22c55e',
              advice: sensor.pm25 > 150 ? 'Suspend outdoor sports; keep indoor air filtration active' : 'Normal school playtime permitted with observation',
            },
            {
              group: 'Asthma & Respiratory',
              risk: sensor.pm25 > 120 ? 'SEVERE RISK' : sensor.pm25 > 60 ? 'CAUTION' : 'PERMISSIBLE',
              color: sensor.pm25 > 120 ? '#ef4444' : '#f59e0b',
              advice: sensor.pm25 > 120 ? 'N95 respirator mandatory outdoors; keep reliever inhalers handy' : 'Moderate particulate levels; limit prolonged outdoor exposure',
            },
            {
              group: 'Athletes & Cyclists',
              risk: sensor.pm25 > 100 ? 'UNFAVORABLE' : 'FAVORABLE',
              color: sensor.pm25 > 100 ? '#f59e0b' : '#22c55e',
              advice: sensor.pm25 > 100 ? 'Shift intensive cardio indoors; high ventilation multiplies inhaled dose' : 'Outdoor cycling acceptable along green corridors',
            },
            {
              group: 'Senior Citizens',
              risk: sensor.pm25 > 140 ? 'HIGH RISK' : 'MODERATE',
              color: sensor.pm25 > 140 ? '#ef4444' : '#f59e0b',
              advice: sensor.pm25 > 140 ? 'Avoid morning walks before 09:30 AM when temperature inversion traps soot' : 'Afternoon walks permissible during peak mixing layer',
            },
          ].map(item => (
            <div key={item.group} className="bg-navy-950/70 p-3.5 rounded-xl border border-navy-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white">{item.group}</span>
                <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded" style={{ color: item.color, background: item.color + '1a' }}>
                  {item.risk}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{item.advice}</p>
            </div>
          ))}
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
                    <span className="text-emerald-400 font-semibold">+{r.xp} XP</span>
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
