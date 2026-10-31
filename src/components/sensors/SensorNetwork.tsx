import { useState } from 'react';
import { Radio, Search, Filter, Battery, Wifi, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SENSORS, getAQICategory, getStatusColor, generateHourlyData } from '../../data/demoData';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(SENSORS[0]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Smart Sensor Network
          <span className="badge badge-demo">DEMO sensors — not real hardware</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">API-ready architecture for physical IoT/MQTT integration</p>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Sensors', value: SENSORS.length, color: '#22d3ee', icon: Radio },
          { label: 'Online', value: counts.online, color: '#22c55e', icon: CheckCircle },
          { label: 'Offline', value: counts.offline, color: '#ef4444', icon: XCircle },
          { label: 'Issues', value: counts.malfunction, color: '#f97316', icon: AlertTriangle },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card-hover flex items-center gap-3 p-4">
              <Icon size={22} style={{ color: item.color }} />
              <div>
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main layout */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sensor list */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="card">
            {/* Search & filter */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sensors..."
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
                <option value="malfunction">Malfunction</option>
              </select>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filtered.map(sensor => {
                const cat = getAQICategory(sensor.aqi);
                const StatusIcon = STATUS_ICONS[sensor.status] || Radio;
                const isSelected = selected?.id === sensor.id;
                return (
                  <div
                    key={sensor.id}
                    onClick={() => setSelected(sensor)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                      ${isSelected
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'hover:bg-navy-700/40 border border-transparent'
                      }
                    `}
                  >
                    <StatusIcon size={14} style={{ color: STATUS_COLORS[sensor.status] }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{sensor.label}</div>
                      <div className="text-xs text-slate-500">{sensor.id} · {sensor.lastUpdate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: cat.color }}>{sensor.pm25}</div>
                      <div className="text-xs text-slate-600">µg/m³</div>
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
            <div className="card border border-navy-600">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">{selected.label}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge" style={{ background: STATUS_COLORS[selected.status] + '22', color: STATUS_COLORS[selected.status] }}>
                      {selected.status.toUpperCase()}
                    </span>
                    <span className="badge badge-demo">{selected.id}</span>
                    <span className="text-xs text-slate-500">DEMO sensor</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: getAQICategory(selected.aqi).color }}>
                    {selected.pm25}
                  </div>
                  <div className="text-xs text-slate-400">µg/m³ PM2.5</div>
                  <div className="text-xs text-slate-600">DEMO value</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'PM10', value: `${selected.pm10} µg/m³`, icon: '🌫️' },
                  { label: 'Temperature', value: `${selected.temp}°C`, icon: '🌡️' },
                  { label: 'Humidity', value: `${selected.humidity}%`, icon: '💧' },
                  { label: 'AQI', value: selected.aqi, icon: getAQICategory(selected.aqi).emoji },
                ].map(m => (
                  <div key={m.label} className="bg-navy-900 rounded-lg p-3 text-center">
                    <div className="text-lg">{m.icon}</div>
                    <div className="text-sm font-bold text-white mt-1">{m.value}</div>
                    <div className="text-xs text-slate-500">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Readings history */}
            <div className="card">
              <div className="section-title">
                <Clock size={16} className="text-cyan-400" />
                24-Hour Reading History
                <span className="badge badge-simulated ml-auto">SIMULATED</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#64748b' }}
                  />
                  <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2} dot={false} name="PM2.5" />
                  <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={1.5} dot={false} name="PM10" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Metadata */}
            <div className="card">
              <div className="section-title text-sm">Sensor Metadata</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Latitude', value: selected.lat.toFixed(4) },
                  { label: 'Longitude', value: selected.lng.toFixed(4) },
                  { label: 'Signal Strength', value: selected.signal.toUpperCase() },
                  { label: 'Battery', value: `${selected.battery}%` },
                  { label: 'Last Calibration', value: selected.calibrated },
                  { label: 'Health Status', value: selected.health.toUpperCase() },
                  { label: 'Connectivity', value: 'MQTT (Planned)' },
                  { label: 'Data Quality', value: 'DEMO' },
                ].map(row => (
                  <div key={row.label} className="bg-navy-900 rounded-lg p-2.5">
                    <div className="text-slate-500">{row.label}</div>
                    <div className="text-slate-200 font-medium mt-0.5">{row.value}</div>
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

