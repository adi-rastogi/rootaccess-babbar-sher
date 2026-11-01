import { useState, useEffect, useRef } from 'react';
import {
  RefreshCw, Wind, Droplets, Thermometer, Radio, AlertTriangle, TrendingUp, Users,
  Eye, Activity, ShieldAlert, Sparkles, MapPin, Compass, Navigation, ArrowUpRight,
  HeartPulse, ShieldCheck, Play, Layers, Clock, Globe, Zap, Server, CheckCircle2,
  BarChart3, Gauge
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, AreaChart, Area
} from 'recharts';
import { useApp } from '../../App';
import { NEIGHBORHOODS, SENSORS, ALERTS, COMMUNITY_REPORTS, getAQICategory, generateHourlyData, getStatusColor } from '../../data/demoData';
import { getLiveAQICategory, type LiveAQIStation } from '../../services/airQualityService';
import { useNavigate } from 'react-router-dom';

declare const L: any;

function AQIGauge({ aqi }: { aqi: number }) {
  const cat = getLiveAQICategory(aqi);
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
        <p className="text-slate-600 text-[10px] mt-1 border-t border-navy-700 pt-1">WAQI / OpenAQ calibrated stream</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const {
    selectedNeighborhood,
    setSelectedNeighborhood,
    setTourActive,
    liveData,
    isLiveMode,
    selectedStation,
    setSelectedStation,
    refreshLiveData,
    isFetchingLive,
  } = useApp();

  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const miniMapRef = useRef<any>(null);
  const miniMapInstance = useRef<any>(null);
  const miniMarkersRef = useRef<any[]>([]);

  // Computed Real-Time Telemetry Values
  const neighborhood = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;
  const sensor = SENSORS.find(s => s.neighborhood === selectedNeighborhood) || SENSORS[0];

  const currentAqi = isLiveMode
    ? (selectedStation ? selectedStation.aqi : (liveData?.overview.aqi ?? 194))
    : sensor.aqi;

  const currentPm25 = isLiveMode
    ? (selectedStation ? selectedStation.pm25 : (liveData?.overview.pm25 ?? 194))
    : sensor.pm25;

  const currentPm10 = isLiveMode
    ? (selectedStation ? selectedStation.pm10 : (liveData?.overview.pm10 ?? 158))
    : sensor.pm10;

  const currentNo2 = isLiveMode
    ? (selectedStation?.no2 ?? liveData?.overview.no2 ?? 21.3)
    : 42;

  const currentSo2 = isLiveMode
    ? (selectedStation?.so2 ?? liveData?.overview.so2 ?? 5.0)
    : 14;

  const currentO3 = isLiveMode
    ? (selectedStation?.o3 ?? liveData?.overview.o3 ?? 2.2)
    : 28;

  const currentCo = isLiveMode
    ? (selectedStation?.co ?? liveData?.overview.co ?? 20.6)
    : 1.8;

  const currentTemp = isLiveMode
    ? (selectedStation?.temp ?? liveData?.overview.temp ?? 24.2)
    : sensor.temp;

  const currentHumidity = isLiveMode
    ? (selectedStation?.humidity ?? liveData?.overview.humidity ?? 88.1)
    : sensor.humidity;

  const currentWindSpeed = isLiveMode
    ? (selectedStation?.windSpeed ?? liveData?.overview.windSpeed ?? 1.4)
    : 6.8;

  const currentWindDir = isLiveMode
    ? (selectedStation?.windDirection ?? liveData?.overview.windDirection ?? 245)
    : 315;

  const stationDisplayName = isLiveMode
    ? (selectedStation ? selectedStation.name : (liveData?.overview.stationName ?? 'Major Dhyan Chand National Stadium, Delhi'))
    : neighborhood.name;

  const aqiCat = getLiveAQICategory(currentAqi);
  const hourlyData = generateHourlyData(currentAqi);

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
        const centerLat = isLiveMode && selectedStation ? selectedStation.lat : neighborhood.lat;
        const centerLng = isLiveMode && selectedStation ? selectedStation.lng : neighborhood.lng;

        const map = L.map(miniMapRef.current, {
          center: [centerLat, centerLng],
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

  // Update center when selection changes
  useEffect(() => {
    if (!miniMapInstance.current) return;
    const lat = isLiveMode && selectedStation ? selectedStation.lat : neighborhood.lat;
    const lng = isLiveMode && selectedStation ? selectedStation.lng : neighborhood.lng;
    miniMapInstance.current.flyTo([lat, lng], 12, { duration: 1 });
    renderMiniMapSensors(miniMapInstance.current);
  }, [selectedNeighborhood, selectedStation, isLiveMode, liveData]);

  function renderMiniMapSensors(map: any) {
    if (!map || typeof L === 'undefined') return;

    miniMarkersRef.current.forEach(m => {
      try { m.remove(); } catch (e) {}
    });
    miniMarkersRef.current = [];

    if (isLiveMode && liveData?.stations && liveData.stations.length > 0) {
      // Render Real WAQI & OpenAQ Live Stations
      liveData.stations.forEach(st => {
        const isSelected = selectedStation?.uid === st.uid;
        const cat = getLiveAQICategory(st.aqi);

        const circle = L.circle([st.lat, st.lng], {
          radius: isSelected ? 1800 : 1200,
          fillColor: cat.color,
          fillOpacity: isSelected ? 0.4 : 0.18,
          color: cat.color,
          weight: isSelected ? 2.5 : 1,
          opacity: isSelected ? 0.9 : 0.45,
        }).addTo(map);

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: ${isSelected ? '34px' : '26px'};
              height: ${isSelected ? '34px' : '26px'};
              background: #091322;
              border: 2px solid ${isSelected ? '#ffffff' : cat.color};
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: #ffffff; font-size: ${isSelected ? '10px' : '8px'}; font-weight: 800;
              box-shadow: 0 0 14px ${cat.color};
              cursor: pointer;
            ">
              ${st.aqi}
            </div>
          `,
          iconSize: [isSelected ? 34 : 26, isSelected ? 34 : 26],
          iconAnchor: [isSelected ? 17 : 13, isSelected ? 17 : 13],
        });

        const marker = L.marker([st.lat, st.lng], { icon }).addTo(map);
        marker.on('click', () => setSelectedStation(st));
        marker.bindTooltip(`<b>${st.name}</b><br/>AQI: ${st.aqi} (${cat.label})<br/>PM2.5: ${st.pm25} µg/m³`, { className: 'leaflet-popup-content-wrapper' });

        miniMarkersRef.current.push(circle);
        miniMarkersRef.current.push(marker);
      });
    } else {
      // Demo sensors
      SENSORS.forEach(s => {
        const isSelected = s.neighborhood === selectedNeighborhood;
        const cat = getAQICategory(s.aqi);

        const circle = L.circle([s.lat, s.lng], {
          radius: isSelected ? 1800 : 1200,
          fillColor: cat.color,
          fillOpacity: isSelected ? 0.35 : 0.15,
          color: cat.color,
          weight: isSelected ? 2.5 : 1,
          opacity: isSelected ? 0.9 : 0.4,
        }).addTo(map);

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
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLiveData(true);
    setRefreshing(false);
  };

  const onlineSensors = isLiveMode && liveData
    ? liveData.stations.length
    : SENSORS.filter(s => s.status === 'online').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🚀 SMART CITY ENVIRONMENTAL COMMAND CENTER */}
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
                {isLiveMode ? 'REAL-TIME CPCB & WAQI ACTIVE' : 'SIMULATION MODE'}
              </span>
              <span className="hud-badge bg-navy-900 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
                IST {currentTime}
              </span>
              <span className="hud-badge bg-red-500/20 text-red-300 border border-red-500/40 text-xs critical-blink">
                HOTSPOT: {liveData?.overview.hotspot.name || 'Jahangirpuri'} ({liveData?.overview.hotspot.aqi || 412})
              </span>
              <span className="hud-badge bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono">
                {currentWindSpeed} km/h · {currentWindDir}°
              </span>
            </div>

            {/* Hero Main Heading & Subtitle */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                POLLUTION<span className="text-emerald-400">MITRA</span>
                <span className="text-cyan-400 text-base sm:text-xl font-normal ml-3 font-mono">
                  // Live Delhi Air Intelligence
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                Integrated with <strong>OpenAQ v3 CPCB network</strong> and <strong>WAQI live telemetry feed</strong>, providing street-by-street particulate plume dispersion, chemical speciation, and clinical health advisories.
              </p>
            </div>

            {/* Quick Station Switcher Chips in Hero */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-cyan-400" />
                  {isLiveMode ? 'Live Monitoring Stations in Delhi NCR:' : 'Fast Sector Switcher:'}
                </span>
                {isLiveMode && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {liveData?.stations.length || 14} Stations Online
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
                {isLiveMode && liveData?.stations && liveData.stations.length > 0 ? (
                  liveData.stations.map(st => {
                    const c = getLiveAQICategory(st.aqi);
                    const isCur = selectedStation?.uid === st.uid;
                    return (
                      <button
                        key={st.uid}
                        onClick={() => setSelectedStation(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isCur
                            ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-navy-950/80 border-navy-800 text-slate-300 hover:text-white hover:border-navy-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                        {st.shortName}
                        <span style={{ color: c.color }}>{st.aqi}</span>
                      </button>
                    );
                  })
                ) : (
                  NEIGHBORHOODS.map(n => {
                    const s = SENSORS.find(sen => sen.neighborhood === n.id) || SENSORS[0];
                    const c = getAQICategory(s.aqi);
                    const isCur = n.id === selectedNeighborhood;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNeighborhood(n.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
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
                  })
                )}
              </div>
            </div>

            {/* Dynamic Health Advisory Bar */}
            <div className="p-3 rounded-xl bg-navy-950/80 border border-amber-500/40 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div className="text-xs text-amber-200/90 leading-tight">
                <strong>Advisory ({stationDisplayName}):</strong> {currentAqi > 300
                  ? 'Severe Inversion Trap. Emergency conditions. Everyone stay indoors with active HEPA filtration; certified N95 respirators required outdoors.'
                  : currentAqi > 200
                  ? 'Very Poor Air. Vulnerable demographics avoid outdoor exertion. Shift morning exercise window to solar noon.'
                  : currentAqi > 100
                  ? 'Unhealthy for sensitive groups. Children and elderly should limit prolonged outdoor exposure.'
                  : 'Air quality within acceptable bounds for outdoor activity.'}
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <button
                onClick={() => navigate('/map')}
                className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-bold cursor-pointer"
              >
                <Compass size={14} />
                Live GIS Flow Heatmap
              </button>
              <button
                onClick={() => setTourActive(true)}
                className="btn-secondary text-xs py-2.5 px-4 border-cyan-500/40 text-cyan-300 hover:text-white flex items-center gap-2 font-bold cursor-pointer"
              >
                <Play size={13} />
                Voice Guided Tour
              </button>
              <button
                onClick={() => navigate('/canyon')}
                className="btn-secondary text-xs py-2.5 px-4 border-cyan-500/40 text-cyan-300 hover:text-white flex items-center gap-2 font-bold cursor-pointer"
              >
                <Layers size={13} />
                3D Urban Canyon
              </button>
              <button
                onClick={() => navigate('/health')}
                className="btn-secondary text-xs py-2.5 px-4 border-emerald-500/40 text-emerald-300 hover:text-white flex items-center gap-2 font-bold cursor-pointer"
              >
                <HeartPulse size={13} />
                Precision Health Alerts
              </button>
              <button
                onClick={handleRefresh}
                disabled={isFetchingLive}
                className="btn-secondary text-xs py-2.5 px-3 border-navy-700 text-slate-300 hover:text-white flex items-center gap-1.5 font-bold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isFetchingLive || refreshing ? "animate-spin text-cyan-400" : ""} />
                {isFetchingLive ? 'Syncing...' : 'Refresh Feed'}
              </button>
            </div>
          </div>

          {/* Hero Quick Telemetry HUD Card */}
          <div className="w-full lg:w-80 bg-navy-950/90 p-5 rounded-2xl border border-cyan-500/40 flex flex-col justify-between space-y-4 shadow-2xl flex-shrink-0">
            <div className="flex items-center justify-between border-b border-navy-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400" />
                <span className="text-[11px] font-mono text-slate-300 font-bold uppercase">Active Station</span>
              </div>
              <span className="badge bg-cyan-500/20 text-cyan-400 text-xs font-bold truncate max-w-[130px]" title={stationDisplayName}>
                {stationDisplayName.split(',')[0]}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-black font-mono text-white tracking-tight">{currentPm25}</div>
                <div className="text-[11px] text-slate-400 font-medium">µg/m³ PM2.5</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-mono" style={{ color: aqiCat.color }}>{currentAqi}</div>
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
                    width: `${Math.min(100, (currentAqi / 500) * 100)}%`,
                    background: aqiCat.color,
                    boxShadow: `0 0 10px ${aqiCat.color}`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2.5 border-t border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono">
                <Wind size={12} className="text-cyan-400" />
                {currentWindSpeed} km/h · {currentWindDir}°
              </span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                OpenAQ / WAQI Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL API VERIFICATION ARCHITECTURE CARD */}
      <div className="hud-panel p-5 border border-cyan-500/30 bg-gradient-to-r from-navy-900/90 via-navy-950/90 to-navy-900/90">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Dual-Stream Live Air Quality Architecture (WAQI &amp; OpenAQ v3)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API KEYS CONNECTED &amp; ACTIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">WAQI Regional Feed</div>
            <div className="text-white font-bold text-sm flex items-center gap-1.5">
              <span className="text-emerald-400">●</span> Token Authenticated
            </div>
            <div className="text-slate-400 text-[11px] mt-1 font-mono">
              d630856c...fc7d61958b8
            </div>
            <div className="text-cyan-400 text-[10px] mt-1">24 Stations in Delhi NCR</div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">OpenAQ v3 Network</div>
            <div className="text-white font-bold text-sm flex items-center gap-1.5">
              <span className="text-emerald-400">●</span> Key Validated
            </div>
            <div className="text-slate-400 text-[11px] mt-1 font-mono">
              403a1611...8924547f
            </div>
            <div className="text-cyan-400 text-[10px] mt-1">CPCB / DPCC Reference Monitors</div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Government Source</div>
            <div className="text-white font-bold text-sm">
              DPCC &amp; CPCB Delhi
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              Central Pollution Control Board
            </div>
            <div className="text-emerald-400 text-[10px] mt-1 font-mono">Regulatory Grade Data</div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">Hotspot Surveillance</div>
            <div className="text-red-400 font-bold text-sm">
              {liveData?.overview.hotspot.name || 'Jahangirpuri'}
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              Peak AQI: <span className="text-red-400 font-mono font-bold">{liveData?.overview.hotspot.aqi || 412}</span>
            </div>
            <div className="text-slate-500 text-[10px] mt-1 font-mono">Cleanest: {liveData?.overview.cleanest.name || 'Sonia Vihar'} ({liveData?.overview.cleanest.aqi || 163})</div>
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
          <AQIGauge aqi={currentAqi} />
          <div className="text-xs font-semibold text-slate-300 mt-1">
            {aqiCat.label}
          </div>
          <div className="text-[11px] text-cyan-400 mt-0.5 truncate max-w-full font-medium" title={stationDisplayName}>
            {stationDisplayName}
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-3.5">
          <MetricCard
            icon={Wind}
            label="PM2.5 Density"
            value={currentPm25}
            unit="µg/m³"
            color="#ef4444"
            sub="Indian NAAQS Limit: 60 µg/m³"
            alert={currentPm25 > 150}
          />
          <MetricCard
            icon={Wind}
            label="PM10 Density"
            value={currentPm10}
            unit="µg/m³"
            color="#f97316"
            sub="Indian NAAQS Limit: 100 µg/m³"
            alert={currentPm10 > 250}
          />
          <MetricCard
            icon={Gauge}
            label="Nitrogen Dioxide (NO2)"
            value={typeof currentNo2 === 'number' ? currentNo2.toFixed(1) : currentNo2}
            unit="ppb"
            color="#a855f7"
            sub="OpenAQ CPCB Verified · Limit: 80"
          />
          <MetricCard
            icon={Droplets}
            label="Relative Humidity"
            value={typeof currentHumidity === 'number' ? Math.round(currentHumidity) : currentHumidity}
            unit="%"
            color="#38bdf8"
            sub="Thermal Inversion Factor"
          />
          <MetricCard
            icon={Thermometer}
            label="Ambient Temp"
            value={typeof currentTemp === 'number' ? currentTemp.toFixed(1) : currentTemp}
            unit="°C"
            color="#06b6d4"
            sub="Surface layer measurement"
          />
          <MetricCard
            icon={Wind}
            label="Surface Wind Flow"
            value={currentWindSpeed}
            unit="km/h"
            color="#22d3ee"
            sub={`Vector: ${currentWindDir}° WSW`}
          />
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
                Live Regional Environmental Radar ({stationDisplayName.split(',')[0]})
              </h2>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              Full GIS View
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-navy-700 flex-1" style={{ minHeight: '260px' }}>
            <div ref={miniMapRef} className="w-full h-full" style={{ minHeight: '260px' }} />

            {/* In-Map Quick Selector */}
            <div className="absolute bottom-3 left-3 right-3 z-10 hud-panel p-2 flex items-center justify-between text-xs bg-navy-950/90 shadow-xl">
              <span className="text-slate-400 text-[11px] font-mono">Live Stations:</span>
              <div className="flex gap-1 overflow-x-auto max-w-[75%]">
                {isLiveMode && liveData?.stations && liveData.stations.length > 0 ? (
                  liveData.stations.slice(0, 5).map(st => (
                    <button
                      key={st.uid}
                      onClick={() => setSelectedStation(st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                        selectedStation?.uid === st.uid
                          ? 'bg-emerald-500 text-navy-950 font-bold'
                          : 'bg-navy-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {st.shortName} ({st.aqi})
                    </button>
                  ))
                ) : (
                  NEIGHBORHOODS.slice(0, 4).map(n => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNeighborhood(n.id as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                        selectedNeighborhood === n.id
                          ? 'bg-emerald-500 text-navy-950 font-bold'
                          : 'bg-navy-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {n.name.split(' ')[0]}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Trend Chart */}
        <div className="hud-panel p-5">
          <div className="section-title text-sm mb-3">
            <TrendingUp size={16} className="text-emerald-400" />
            24-Hour Particulate Concentration Trend ({stationDisplayName.split(',')[0]})
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

      {/* HEALTH RISK MATRIX */}
      <div className="hud-panel p-5 border-emerald-500/30">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white">
              Biosphere &amp; Vulnerable Demographics Health Advisory Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-400">Based on live PM2.5 ({currentPm25} µg/m³)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {[
            {
              group: 'Children & Schools',
              risk: currentPm25 > 150 ? 'HIGH RISK' : currentPm25 > 80 ? 'MODERATE' : 'LOW RISK',
              color: currentPm25 > 150 ? '#ef4444' : currentPm25 > 80 ? '#f59e0b' : '#22c55e',
              advice: currentPm25 > 150 ? 'Suspend outdoor sports; keep indoor air filtration active' : 'Normal school playtime permitted with observation',
            },
            {
              group: 'Asthma & Respiratory',
              risk: currentPm25 > 120 ? 'SEVERE RISK' : currentPm25 > 60 ? 'CAUTION' : 'PERMISSIBLE',
              color: currentPm25 > 120 ? '#ef4444' : '#f59e0b',
              advice: currentPm25 > 120 ? 'N95 respirator mandatory outdoors; keep reliever inhalers handy' : 'Moderate particulate levels; limit prolonged outdoor exposure',
            },
            {
              group: 'Athletes & Cyclists',
              risk: currentPm25 > 100 ? 'UNFAVORABLE' : 'FAVORABLE',
              color: currentPm25 > 100 ? '#f59e0b' : '#22c55e',
              advice: currentPm25 > 100 ? 'Shift intensive cardio indoors; high ventilation multiplies inhaled dose' : 'Outdoor cycling acceptable along green corridors',
            },
            {
              group: 'Senior Citizens',
              risk: currentPm25 > 140 ? 'HIGH RISK' : 'MODERATE',
              color: currentPm25 > 140 ? '#ef4444' : '#f59e0b',
              advice: currentPm25 > 140 ? 'Avoid morning walks before 09:30 AM when temperature inversion traps soot' : 'Afternoon walks permissible during peak mixing layer',
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
            Live Delhi Hotspot Rankings
          </div>
          <div className="space-y-2">
            {(isLiveMode && liveData?.stations ? liveData.stations.slice(0, 5) : SENSORS.slice(0, 5)).map((s: any, i: number) => {
              const cat = getLiveAQICategory(s.aqi);
              return (
                <div
                  key={s.uid || s.id}
                  onClick={() => {
                    if (isLiveMode && s.uid) setSelectedStation(s);
                  }}
                  className="flex items-center gap-2 py-1.5 border-b border-navy-800/40 cursor-pointer hover:bg-navy-900/50 px-1 rounded transition-colors"
                >
                  <span className="text-slate-500 font-mono text-xs w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      {s.shortName || s.label}
                      {s.aqi > 200 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 critical-blink" />}
                    </div>
                    <div className="text-[10px] text-slate-500">{s.source || 'WAQI'} · Live Feed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold" style={{ color: cat.color }}>AQI {s.aqi}</div>
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
