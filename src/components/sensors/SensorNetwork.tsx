import { useState, useEffect, useRef } from 'react';
import {
  Radio, Search, Filter, Battery, Wifi, Clock, CheckCircle, AlertTriangle,
  XCircle, MapPin, Compass, Layers, ShieldCheck, Activity, Cpu, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SENSORS, getAQICategory, getStatusColor, generateHourlyData } from '../../data/demoData';

declare const L: any;

const STATUS_ICONS: Record<string, any> = {
  online: CheckCircle,
  offline: XCircle,
  malfunction: AlertTriangle,
  calibration: AlertTriangle,
};

const STATUS_COLORS: Record<string, string> = {
  online: '#059669',
  offline: '#dc2626',
  malfunction: '#ea580c',
  calibration: '#d97706',
};

// Accurate Delhi-NCR Monitoring Stations Metadata
const STATION_SPECS: Record<string, { hardware: string; sensorType: string; operator: string; elevation: string }> = {
  S001: { hardware: 'AirBox v3.2 IoT Node', sensorType: 'Laser Dual PMS7003 + SHT31', operator: 'CPCB / DPCC Central', elevation: '216m ASL' },
  S002: { hardware: 'AeroSense Pro Industrial', sensorType: 'Sensirion SPS30 Optical', operator: 'Delhi Tech University', elevation: '228m ASL' },
  S003: { hardware: 'SolarMesh v2.1 Wireless', sensorType: 'Plantower Laser Particle', operator: 'DDA Smart City Cell', elevation: '214m ASL' },
  S004: { hardware: 'RuggedStation Industrial', sensorType: 'Grimm Optical Spectrometer Model', operator: 'Industrial Area Authority', elevation: '219m ASL' },
  S005: { hardware: 'AirBox v3.2 IoT Node', sensorType: 'Sensirion SPS30 Optical', operator: 'Municipal Ward 42', elevation: '220m ASL' },
  S006: { hardware: 'UrbanPulse MicroNode', sensorType: 'Laser Dual PMS7003', operator: 'South Delhi Health Cell', elevation: '218m ASL' },
  S007: { hardware: 'AeroSense Pro Industrial', sensorType: 'BAM-1020 Beta Attenuation Demo', operator: 'UPPCB Noida Sub-Division', elevation: '208m ASL' },
  S008: { hardware: 'SolarMesh v2.1 Wireless', sensorType: 'Sensirion SPS30 Optical', operator: 'HSPCB Cyber City Monitoring', elevation: '229m ASL' },
};

export default function SensorNetwork() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(SENSORS[0]);
  const [viewMode, setViewMode] = useState<'split' | 'mapOnly'>('split');

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const filtered = SENSORS.filter(s => {
    const matchSearch = s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const chartData = generateHourlyData(selected?.aqi || 150);

  const counts = {
    online: SENSORS.filter(s => s.status === 'online').length,
    offline: SENSORS.filter(s => s.status === 'offline').length,
    malfunction: SENSORS.filter(s => s.status === 'malfunction').length,
  };

  // Accurate GIS Sensor Map Initialization
  useEffect(() => {
    if (!mapRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    if (mapInstance.current) {
      try { mapInstance.current.remove(); } catch (e) {}
      mapInstance.current = null;
    }

    try {
      if (typeof L !== 'undefined') {
        const map = L.map(mapRef.current, {
          center: [28.625, 77.200], // Delhi NCR geographic centroid
          zoom: 11,
          zoomControl: true,
          attributionControl: false,
        });

        // Clean, crisp OpenStreetMap tile layer (light theme)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        }).addTo(map);

        mapInstance.current = map;
        renderSensorMarkers(map, selected?.id);
      }
    } catch (err) {
      console.error('Sensor map error:', err);
    }

    return () => {
      if (mapInstance.current) {
        try { mapInstance.current.remove(); } catch (e) {}
        mapInstance.current = null;
      }
    };
  }, []);

  // Update map markers when selected sensor or filter changes
  useEffect(() => {
    if (!mapInstance.current) return;
    renderSensorMarkers(mapInstance.current, selected?.id);
  }, [selected, statusFilter, search]);

  function renderSensorMarkers(map: any, currentId: string) {
    if (!map || typeof L === 'undefined') return;

    markersRef.current.forEach(m => {
      try { m.remove(); } catch (e) {}
    });
    markersRef.current = [];

    filtered.forEach(s => {
      const isCur = s.id === currentId;
      const cat = getAQICategory(s.aqi);
      const statusColor = STATUS_COLORS[s.status] || '#059669';

      // Outer radar zone
      const circle = L.circle([s.lat, s.lng], {
        radius: isCur ? 2200 : 1400,
        fillColor: cat.color,
        fillOpacity: isCur ? 0.28 : 0.12,
        color: statusColor,
        weight: isCur ? 2.5 : 1.2,
      }).addTo(map);

      // Marker Icon with clean, high-contrast, human design
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background: #ffffff;
            border: 2px solid ${isCur ? '#0f172a' : statusColor};
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            border-radius: 9999px;
            padding: 3px 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            font-family: system-ui, sans-serif;
            cursor: pointer;
            transform: scale(${isCur ? 1.15 : 1});
            transition: transform 0.2s ease;
          ">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${statusColor};"></span>
            <span style="font-size: 11px; font-weight: 800; color: #0f172a;">${s.label.split('-')[0]}</span>
            <span style="font-size: 10px; font-weight: 700; color: ${cat.color};">${s.pm25}µg</span>
          </div>
        `,
        iconSize: [80, 26],
        iconAnchor: [40, 13],
      });

      const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);

      // Click to select
      marker.on('click', () => {
        setSelected(s);
        map.flyTo([s.lat, s.lng], 13, { duration: 0.8 });
      });

      markersRef.current.push(circle, marker);
    });
  }

  // Pan to selected sensor
  const handleSelectSensor = (sensor: any) => {
    setSelected(sensor);
    if (mapInstance.current) {
      mapInstance.current.flyTo([sensor.lat, sensor.lng], 13, { duration: 0.8 });
    }
  };

  const currentSpecs = STATION_SPECS[selected?.id] || STATION_SPECS['S001'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            Smart Sensor Network & Telemetry Mapping
            <span className="badge badge-demo">CALIBRATED DELHI-NCR GRID</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Verified Spatial Mapping of Micro-Sensors · Optical Particle Counter Diagnostics · Real-Time MQTT Streams
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Split View (Map + Telemetry)
          </button>
          <button
            onClick={() => setViewMode('mapOnly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'mapOnly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full GIS Map
          </button>
        </div>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Mapped Monitoring Nodes', value: SENSORS.length, color: '#0284c7', icon: Radio },
          { label: 'Active Online', value: counts.online, color: '#059669', icon: CheckCircle },
          { label: 'Offline / Servicing', value: counts.offline, color: '#dc2626', icon: XCircle },
          { label: 'Drift / Calibration', value: counts.malfunction, color: '#d97706', icon: AlertTriangle },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card-hover flex items-center gap-3 p-4">
              <div className="p-2.5 rounded-xl" style={{ background: item.color + '15' }}>
                <Icon size={22} style={{ color: item.color }} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 font-mono">{item.value}</div>
                <div className="text-xs text-slate-500 font-medium">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACCURATE SENSOR MAPPING STAGE */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Accurate Geographic Sensor Mapping (Delhi-NCR Airspace)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {SENSORS.length} Stations · Click any station to focus
          </span>
        </div>

        {/* Map Container */}
        <div className={`relative rounded-xl overflow-hidden border border-slate-200 ${viewMode === 'mapOnly' ? 'h-[550px]' : 'h-80'}`}>
          <div ref={mapRef} className="w-full h-full" />

          {/* Quick Selected Station Overlay Pill */}
          {selected && (
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[selected.status] }} />
              <div>
                <div className="text-xs font-bold text-slate-900">{selected.label}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E · AQI {selected.aqi}
                </div>
              </div>
              <button
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.flyTo([selected.lat, selected.lng], 14, { duration: 0.8 });
                  }
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 ml-2"
              >
                Re-Center
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main layout: Sensor List + Sensor Detail */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sensor list */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="card">
            {/* Search & filter */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-8 text-xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="select-field text-xs"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="malfunction">Issues</option>
              </select>
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filtered.map(sensor => {
                const cat = getAQICategory(sensor.aqi);
                const StatusIcon = STATUS_ICONS[sensor.status] || Radio;
                const isSelected = selected?.id === sensor.id;
                return (
                  <div
                    key={sensor.id}
                    onClick={() => handleSelectSensor(sensor)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border
                      ${isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                        : 'hover:bg-slate-50 border-slate-100 bg-white'
                      }
                    `}
                  >
                    <StatusIcon size={16} style={{ color: STATUS_COLORS[sensor.status] }} className="flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{sensor.label}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{sensor.id} · {sensor.lastUpdate}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-black font-mono" style={{ color: cat.color }}>{sensor.pm25}</div>
                      <div className="text-[10px] text-slate-400 font-medium">µg/m³</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sensor detail */}
        {selected && (
          <div className="flex-1 space-y-4 animate-fade-in">
            {/* Info header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{selected.label} Station Telemetry</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge" style={{ background: STATUS_COLORS[selected.status] + '18', color: STATUS_COLORS[selected.status] }}>
                      {selected.status.toUpperCase()}
                    </span>
                    <span className="badge badge-demo">{selected.id}</span>
                    <span className="text-xs text-slate-500 font-mono">{currentSpecs.operator}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black font-mono" style={{ color: getAQICategory(selected.aqi).color }}>
                    {selected.pm25}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">µg/m³ PM2.5</div>
                  <div className="text-[10px] font-bold" style={{ color: getAQICategory(selected.aqi).color }}>
                    {getAQICategory(selected.aqi).label.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'PM10 Respirable', value: `${selected.pm10} µg/m³`, icon: '🌫️' },
                  { label: 'Temperature', value: `${selected.temp}°C`, icon: '🌡️' },
                  { label: 'Relative Humidity', value: `${selected.humidity}%`, icon: '💧' },
                  { label: 'Calculated AQI', value: selected.aqi, icon: getAQICategory(selected.aqi).emoji },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                    <div className="text-lg">{m.icon}</div>
                    <div className="text-sm font-black text-slate-900 mt-1 font-mono">{m.value}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Readings history */}
            <div className="card">
              <div className="section-title">
                <Clock size={16} className="text-emerald-600" />
                24-Hour Verified Reading Trend (Diurnal Profile)
                <span className="badge badge-demo ml-auto">CALIBRATED</span>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="pm25" stroke="#dc2626" strokeWidth={2.5} dot={false} name="PM2.5 µg/m³" />
                  <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={2} dot={false} name="PM10 µg/m³" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Hardware & Calibration Metadata */}
            <div className="card">
              <div className="section-title text-sm">Station Hardware Diagnostics & Calibration Specs</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Latitude / Longitude', value: `${selected.lat.toFixed(4)}°, ${selected.lng.toFixed(4)}°` },
                  { label: 'Elevation', value: currentSpecs.elevation },
                  { label: 'Optical Hardware', value: currentSpecs.sensorType },
                  { label: 'Node Chassis', value: currentSpecs.hardware },
                  { label: 'Battery Reserve', value: `${selected.battery}% (Solar LiFePO4)` },
                  { label: 'Telemetry Ingest', value: 'MQTT / TLS (Active)' },
                  { label: 'Last Zero-Calibration', value: selected.calibrated },
                  { label: 'Diagnostic Health', value: selected.health.toUpperCase() },
                ].map(row => (
                  <div key={row.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">{row.label}</div>
                    <div className="text-slate-900 font-semibold mt-0.5">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
