import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Clock, TrendingUp, Radio, ShieldAlert, CheckCircle, Flame, Filter, Eye, Activity } from 'lucide-react';
import { ALERTS, SENSORS, NEIGHBORHOODS, getAQICategory, getStatusColor } from '../../data/demoData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

declare const L: any;

export default function CriticalZones() {
  const [filterCondition, setFilterCondition] = useState<'all' | 'critical' | 'moderate' | 'normal'>('all');
  
  // Categorize sensors into Critical, Moderate, and Normal with explicit condition property
  const categorizedSensors = SENSORS.map(s => {
    let condition: 'critical' | 'moderate' | 'normal' = 'normal';
    if (s.pm25 > 150 || s.aqi > 200) {
      condition = 'critical';
    } else if (s.pm25 > 80 || s.aqi > 120) {
      condition = 'moderate';
    }
    return { ...s, condition };
  });

  // Safely initialize with the highest PM2.5 sensor (Narela) with condition attached
  const initialZone = categorizedSensors.find(s => s.id === 'S004') || categorizedSensors[0];
  const [selectedZone, setSelectedZone] = useState<any>(initialZone);

  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const zoneLayersRef = useRef<any[]>([]);

  const displayedSensors = categorizedSensors.filter(s => {
    if (filterCondition === 'all') return true;
    return s.condition === filterCondition;
  });

  const criticalCount = categorizedSensors.filter(s => s.condition === 'critical').length;
  const moderateCount = categorizedSensors.filter(s => s.condition === 'moderate').length;
  const normalCount = categorizedSensors.filter(s => s.condition === 'normal').length;

  useEffect(() => {
    if (!mapRef.current) return;

    // Safety check: if container already initialized in Leaflet, reset it
    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore cleanup error
      }
      mapInstanceRef.current = null;
    }

    try {
      if (typeof L !== 'undefined') {
        const map = L.map(mapRef.current, {
          center: [28.65, 77.16],
          zoom: 11,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;

        renderMapZones(map);
      }
    } catch (err) {
      console.error('CriticalZones Leaflet initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    renderMapZones(mapInstanceRef.current);
  }, [filterCondition]);

  function renderMapZones(map: any) {
    if (!map || typeof L === 'undefined') return;

    zoneLayersRef.current.forEach(l => {
      try {
        l.remove();
      } catch (e) {
        // ignore
      }
    });
    zoneLayersRef.current = [];

    displayedSensors.forEach(sensor => {
      const isCritical = sensor.condition === 'critical';
      const isModerate = sensor.condition === 'moderate';
      const cat = getAQICategory(sensor.aqi);

      const zoneColor = isCritical ? '#ef4444' : isModerate ? '#f59e0b' : '#22c55e';
      const radius = isCritical ? 2400 : isModerate ? 1600 : 1100;

      // Outer radar zone circle
      const circle = L.circle([sensor.lat, sensor.lng], {
        radius,
        fillColor: zoneColor,
        fillOpacity: isCritical ? 0.22 : isModerate ? 0.12 : 0.08,
        color: zoneColor,
        weight: isCritical ? 2.5 : 1.5,
        opacity: isCritical ? 0.9 : 0.5,
        dashArray: isCritical ? '6 4' : undefined,
      }).addTo(map);

      // Blinking icon for critical zones
      if (isCritical) {
        const beaconIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative; width:48px; height:48px;">
              <div class="critical-sonar" style="
                position:absolute; inset:0; border-radius:50%;
                background:rgba(239, 68, 68, 0.4);
                border:2px solid #ef4444;
              "></div>
              <div class="critical-blink" style="
                position:absolute; top:12px; left:12px;
                width:24px; height:24px; border-radius:50%;
                background:#ef4444; border:2px solid #ffffff;
                display:flex; align-items:center; justify-content:center;
                color:#fff; font-weight:800; font-size:12px;
                box-shadow:0 0 16px #ef4444;
              ">
                ⚠️
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const beacon = L.marker([sensor.lat, sensor.lng], { icon: beaconIcon }).addTo(map);
        beacon.on('click', () => setSelectedZone(sensor));
        zoneLayersRef.current.push(beacon);
      } else {
        // Standard marker for moderate / normal
        const dotIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:28px; height:28px; border-radius:50%;
              background:#0f2044; border:2px solid ${zoneColor};
              display:flex; align-items:center; justify-content:center;
              color:${zoneColor}; font-weight:800; font-size:10px;
              box-shadow:0 0 10px ${zoneColor}44;
            ">
              ${sensor.pm25}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([sensor.lat, sensor.lng], { icon: dotIcon }).addTo(map);
        marker.on('click', () => setSelectedZone(sensor));
        zoneLayersRef.current.push(marker);
      }

      circle.bindTooltip(`
        <div style="font-family:Inter,sans-serif; padding:5px;">
          <div style="font-weight:800; color:${zoneColor}; font-size:12px;">
            ${(sensor.condition || 'ALERT').toUpperCase()} CONDITION
          </div>
          <div style="font-weight:700; color:#fff; font-size:13px; margin-top:2px;">${sensor.label}</div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">
            PM2.5: <strong>${sensor.pm25} µg/m³</strong> · AQI: <strong>${sensor.aqi}</strong> (${cat.label})
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:3px;">
            Threshold exceedance: ${sensor.pm25 > 60 ? `+${Math.round(((sensor.pm25 - 60) / 60) * 100)}% over NAAQS` : 'Within safe limits'}
          </div>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });

      zoneLayersRef.current.push(circle);
    });
  }

  const currentCondition = selectedZone?.condition || (selectedZone?.pm25 > 150 ? 'critical' : selectedZone?.pm25 > 80 ? 'moderate' : 'normal');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hud-panel p-5 flex items-center justify-between flex-wrap gap-4 border-red-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 critical-blink" />
            <h1 className="text-2xl font-black text-white tracking-wide">
              Critical Pollution Zones & Atmospheric Hotspots
            </h1>
            <span className="badge bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono">
              PRIORITY HUD
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Automated threshold surveillance · Blinking critical alerts · Real-time categorical zone classification
          </p>
        </div>

        {/* Condition Filter Bar */}
        <div className="flex items-center gap-2 bg-navy-950/80 p-1.5 rounded-xl border border-navy-700">
          {[
            { id: 'all', label: 'All Zones', count: SENSORS.length, color: 'text-slate-200' },
            { id: 'critical', label: '🔴 Critical', count: criticalCount, color: 'text-red-400' },
            { id: 'moderate', label: '🟡 Moderate', count: moderateCount, color: 'text-yellow-400' },
            { id: 'normal', label: '🟢 Normal', count: normalCount, color: 'text-emerald-400' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCondition(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterCondition === f.id
                  ? 'bg-navy-800 text-white shadow-md border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={f.color}>{f.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-navy-900 text-[10px] text-slate-300">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical Alert Zones', value: criticalCount, sub: 'Immediate intervention required', color: '#ef4444', icon: ShieldAlert, pulse: true },
          { label: 'Moderate Caution', value: moderateCount, sub: 'Elevated particulate levels', color: '#f59e0b', icon: AlertTriangle, pulse: false },
          { label: 'Normal / Permissible', value: normalCount, sub: 'Within ambient guidelines', color: '#22c55e', icon: CheckCircle, pulse: false },
          { label: 'NAAQS Threshold', value: '60 µg/m³', sub: 'Indian 24h standard for PM2.5', color: '#06b6d4', icon: Activity, pulse: false },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="hud-panel p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                <Icon size={18} style={{ color: item.color }} className={item.pulse ? 'critical-blink' : ''} />
              </div>
              <div className="text-2xl font-black text-white font-mono" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Categorized Map + Zone Details Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive Zone Map */}
        <div className="lg:col-span-2 hud-panel p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan-400" />
              <h2 className="text-sm font-bold text-white">
                Categorical Pollution Zones Map (Critical / Moderate / Normal)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Click any beacon to inspect details</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-navy-700" style={{ height: '420px' }}>
            <div ref={mapRef} className="w-full h-full" style={{ height: '420px' }} />

            {/* Map overlay legend */}
            <div className="absolute top-3 left-3 z-10 hud-panel p-2.5 text-[11px] space-y-1 shadow-xl">
              <div className="font-bold text-white mb-1 border-b border-navy-700/60 pb-1">Condition Categories</div>
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 critical-blink" />
                Critical (&gt;150 µg/m³ PM2.5 / &gt;200 AQI)
              </div>
              <div className="flex items-center gap-2 text-yellow-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                Moderate (80–150 µg/m³ PM2.5)
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Normal (&le;80 µg/m³ PM2.5)
              </div>
            </div>
          </div>
        </div>

        {/* Selected Zone Deep Dive */}
        {selectedZone && (
          <div className="hud-panel p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-navy-700/60 pb-2 mb-3">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider">ZONE INSPECTION</span>
                  <h3 className="font-bold text-white text-base leading-tight">{selectedZone.label}</h3>
                </div>
                <span className={`badge ${
                  currentCondition === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50 critical-blink' :
                  currentCondition === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {currentCondition.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
                  <div className="text-slate-400 text-[11px]">Primary Telemetry Reading</div>
                  <div className="text-3xl font-black mt-1 font-mono" style={{ color: getAQICategory(selectedZone.aqi).color }}>
                    {selectedZone.pm25} <span className="text-sm font-normal text-slate-400">µg/m³ PM2.5</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    AQI: <strong>{selectedZone.aqi}</strong> · Status: <span className="font-semibold text-slate-200">{getAQICategory(selectedZone.aqi).label}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    { label: 'Standard Exceedance', value: `+${Math.max(0, Math.round(((selectedZone.pm25 - 60) / 60) * 100))}% above NAAQS`, color: '#ef4444' },
                    { label: 'PM10 Concentration', value: `${selectedZone.pm10} µg/m³` },
                    { label: 'Ambient Temperature', value: `${selectedZone.temp}°C` },
                    { label: 'Relative Humidity', value: `${selectedZone.humidity}%` },
                    { label: 'Node Hardware', value: `${selectedZone.health ? selectedZone.health.toUpperCase() : 'ACTIVE'} (${selectedZone.battery}% battery)` },
                    { label: 'Last Calibration', value: selectedZone.calibrated || '2024-10-15' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-1 border-b border-navy-800/40 text-[11px]">
                      <span className="text-slate-400">{r.label}</span>
                      <span className="font-mono text-slate-200" style={{ color: (r as any).color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300/90 leading-tight">
              <strong>Advisory:</strong> {currentCondition === 'critical' ? 'High particulate density detected. Sensitive groups should wear N95 respirators and avoid outdoor exertion.' : 'Ambient conditions are acceptable for typical activities.'}
            </div>
          </div>
        )}
      </div>

      {/* Blinking Critical Alert Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame size={16} className="text-red-400" />
            Active Critical Alert Feed
          </h2>
          <span className="text-xs text-slate-500">Live trigger threshold: 150 µg/m³ PM2.5</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALERTS.map(alert => {
            const isCrit = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`hud-panel p-4 border-l-4 transition-all ${
                  isCrit
                    ? 'border-l-red-500 border-red-500/30 glow-red'
                    : 'border-l-orange-500 border-orange-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-500 critical-blink' : 'bg-orange-500'}`} />
                    <h3 className="font-bold text-white text-sm">{alert.message}</h3>
                  </div>
                  <span className={`badge ${isCrit ? 'bg-red-500/20 text-red-400 critical-blink' : 'bg-orange-500/20 text-orange-400'}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1"><MapPin size={11} className="text-cyan-400" />{alert.neighborhood}</span>
                  <span className="flex items-center gap-1"><Radio size={11} />Node {alert.sensor}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{alert.timestamp.split('T')[1]?.slice(0, 5)}</span>
                </div>

                <div className="text-xs text-slate-300 bg-navy-950/70 p-2.5 rounded-lg border border-navy-800">
                  <span className="text-slate-400 font-semibold">Diagnosis: </span>{alert.reason}
                  {alert.value > 0 && (
                    <div className="mt-1 font-mono text-[11px] text-red-300">
                      Reading: {alert.value} µg/m³ (Exceeds baseline threshold by {alert.value - alert.threshold} µg/m³)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar Chart vs Standards */}
      <div className="hud-panel p-5">
        <div className="section-title text-sm mb-2">
          <TrendingUp size={16} className="text-cyan-400" />
          PM2.5 Concentrations Across Monitoring Points vs NAAQS Standards
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Direct comparative analysis against India National Ambient Air Quality Standard (60 µg/m³) and Unhealthy Exposure Threshold (150 µg/m³).
        </p>

        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={categorizedSensors.map(s => ({ name: s.label.split('-')[0], pm25: s.pm25, aqi: s.aqi }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }}
            />
            <ReferenceLine y={60} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: 'NAAQS Standard (60)', fill: '#22c55e', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={150} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: 'Critical Threshold (150)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
            <Bar dataKey="pm25" name="PM2.5 (µg/m³)" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
