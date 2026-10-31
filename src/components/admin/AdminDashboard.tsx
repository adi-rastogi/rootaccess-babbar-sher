import { useState } from 'react';
import { ShieldCheck, Radio, Users, Settings, Activity, Database, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SENSORS, COMMUNITY_REPORTS, DEMO_USER, ALERTS } from '../../data/demoData';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'sensors', label: 'Sensors', icon: Radio },
  { id: 'reports', label: 'Reports', icon: Users },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'settings', label: 'Thresholds', icon: Settings },
  { id: 'health', label: 'System Health', icon: Database },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [pm25Threshold, setPm25Threshold] = useState(150);
  const [pm10Threshold, setPm10Threshold] = useState(250);
  const [aqiThreshold, setAqiThreshold] = useState(200);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck size={24} className="text-emerald-400" />
          Admin Dashboard
          <span className="badge badge-demo">DEMO — role-based access</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Protected administrative interface · In production: JWT auth, role-based access control, audit logs</p>
      </div>

      {/* Admin notice */}
      <div className="bg-navy-800 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="text-emerald-400 font-semibold">Logged in as: Demo Admin (demo_user)</span>
          <span className="text-slate-500 ml-3 text-xs">Role: ADMIN · Session: DEMO · In production: protected by JWT + RBAC</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-navy-700 pb-0">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Sensors', value: SENSORS.length, color: '#22d3ee' },
              { label: 'Online Sensors', value: SENSORS.filter(s => s.status === 'online').length, color: '#22c55e' },
              { label: 'Active Alerts', value: ALERTS.length, color: '#ef4444' },
              { label: 'Pending Reports', value: COMMUNITY_REPORTS.filter(r => r.status === 'submitted' || r.status === 'under_review').length, color: '#f59e0b' },
            ].map(m => (
              <div key={m.label} className="card text-center">
                <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-slate-400 mt-1">{m.label}</div>
                <div className="text-xs text-slate-600">DEMO data</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="section-title">System Status</div>
            <div className="space-y-2">
              {[
                { component: 'Frontend (React/Vite)', status: 'operational', note: 'Running in dev mode' },
                { component: 'Backend API (FastAPI)', status: 'planned', note: 'Not running in demo' },
                { component: 'Database (PostgreSQL+PostGIS)', status: 'planned', note: 'Schema designed, not deployed' },
                { component: 'MQTT Sensor Broker', status: 'planned', note: 'Architecture ready, hardware needed' },
                { component: 'Weather API Integration', status: 'planned', note: 'Adapter ready, API key required' },
                { component: 'LLM (AI Copilot)', status: 'demo', note: 'Deterministic demo mode active' },
                { component: 'Routing Engine (OSRM)', status: 'planned', note: 'Illustrative paths in demo' },
              ].map(item => (
                <div key={item.component} className="flex items-center gap-3 px-3 py-2 bg-navy-900 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'operational' ? 'bg-emerald-400' :
                    item.status === 'demo' ? 'bg-cyan-400' :
                    'bg-slate-600'
                  }`} />
                  <span className="text-sm text-slate-300 flex-1">{item.component}</span>
                  <span className={`text-xs ${
                    item.status === 'operational' ? 'text-emerald-400' :
                    item.status === 'demo' ? 'text-cyan-400' : 'text-slate-500'
                  }`}>{item.status.toUpperCase()}</span>
                  <span className="text-xs text-slate-600">{item.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sensors tab */}
      {tab === 'sensors' && (
        <div className="card animate-fade-in">
          <div className="section-title">Sensor Management</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy-700">
                  {['ID', 'Label', 'Neighborhood', 'PM2.5', 'PM10', 'Status', 'Battery', 'Last Update', 'Actions'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENSORS.map(s => (
                  <tr key={s.id} className="border-b border-navy-700/30 hover:bg-navy-700/20">
                    <td className="py-2 px-3 text-slate-400 font-mono">{s.id}</td>
                    <td className="py-2 px-3 text-slate-200">{s.label}</td>
                    <td className="py-2 px-3 text-slate-400">{s.neighborhood.toUpperCase()}</td>
                    <td className="py-2 px-3 text-red-400 font-medium">{s.pm25}</td>
                    <td className="py-2 px-3 text-orange-400">{s.pm10}</td>
                    <td className="py-2 px-3">
                      <span className={`badge ${
                        s.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                        s.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>{s.status.toUpperCase()}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{s.battery}%</td>
                    <td className="py-2 px-3 text-slate-500">{s.lastUpdate}</td>
                    <td className="py-2 px-3">
                      <button className="text-emerald-400 hover:text-emerald-300 text-xs mr-2">Edit</button>
                      <button className="text-slate-500 hover:text-slate-300 text-xs">Logs</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-3">DEMO sensors — edit/add buttons functional in production with backend API</p>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="card animate-fade-in">
          <div className="section-title">Community Report Moderation</div>
          <div className="space-y-3">
            {COMMUNITY_REPORTS.map(r => (
              <div key={r.id} className="flex items-start gap-4 px-4 py-3 bg-navy-900 rounded-xl flex-wrap">
                <div className="flex-1">
                  <div className="font-medium text-white text-sm">{r.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{r.neighborhood} · {r.reporter} · {r.timestamp.split('T')[0]}</div>
                  <div className="text-xs text-slate-400 mt-1">{r.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    r.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.status === 'resolved' ? 'bg-cyan-500/20 text-cyan-400' :
                    r.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>{r.status}</span>
                  <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                    <CheckCircle size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">DEMO — verify/reject buttons connected to POST /api/reports/:id/status in production</p>
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="card animate-fade-in max-w-xl">
          <div className="section-title"><Settings size={16} className="text-emerald-400" />Configurable Alert Thresholds</div>
          <div className="space-y-6">
            {[
              { label: 'PM2.5 Alert Threshold (µg/m³)', value: pm25Threshold, setter: setPm25Threshold, min: 30, max: 300 },
              { label: 'PM10 Alert Threshold (µg/m³)', value: pm10Threshold, setter: setPm10Threshold, min: 50, max: 500 },
              { label: 'AQI Alert Threshold', value: aqiThreshold, setter: setAqiThreshold, min: 50, max: 500 },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-sm">
                  <label className="text-slate-800 font-bold">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => item.setter(Math.max(item.min, item.value - 10))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-mono text-emerald-700 font-black text-sm w-12 text-center">{item.value}</span>
                    <button
                      onClick={() => item.setter(Math.min(item.max, item.value + 10))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-primary">Save Thresholds (DEMO)</button>
            <p className="text-xs text-slate-600">In production: PUT /api/admin/thresholds — persisted to database, applied to real-time alert evaluation.</p>
          </div>
        </div>
      )}

      {/* Health tab */}
      {tab === 'health' && (
        <div className="card animate-fade-in">
          <div className="section-title"><Database size={16} className="text-cyan-400" />API & Integration Health</div>
          <div className="space-y-3">
            {[
              { endpoint: 'GET /api/health', status: 'demo', latency: '—', note: 'Returns 200 in production' },
              { endpoint: 'GET /api/environment/overview', status: 'demo', latency: '—', note: 'Returns demo data structure' },
              { endpoint: 'GET /api/sensors', status: 'demo', latency: '—', note: 'Demo sensor array' },
              { endpoint: 'POST /api/ai/chat', status: 'demo', latency: '~900ms', note: 'Deterministic demo (no LLM)' },
              { endpoint: 'POST /api/simulation/run', status: 'demo', latency: '~1.2s', note: 'Educational model' },
              { endpoint: 'GET /api/weather/current', status: 'unavailable', latency: '—', note: 'Needs WeatherAPI key in .env' },
              { endpoint: 'POST /api/routes/alternatives', status: 'unavailable', latency: '—', note: 'Needs OSRM endpoint' },
            ].map(item => (
              <div key={item.endpoint} className="flex items-center gap-3 px-3 py-2 bg-navy-900 rounded-lg flex-wrap">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.status === 'demo' ? 'bg-cyan-400' :
                  item.status === 'unavailable' ? 'bg-slate-600' : 'bg-emerald-400'
                }`} />
                <span className="font-mono text-xs text-slate-300 flex-1">{item.endpoint}</span>
                <span className={`text-xs ${item.status === 'demo' ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {item.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">{item.latency}</span>
                <span className="text-xs text-slate-600">{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts tab */}
      {tab === 'alerts' && (
        <div className="card animate-fade-in">
          <div className="section-title"><AlertTriangle size={16} className="text-orange-400" />Alert History</div>
          <div className="space-y-3">
            {ALERTS.map(a => (
              <div key={a.id} className="px-4 py-3 bg-navy-900 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white text-sm">{a.message}</div>
                    <div className="text-xs text-slate-500 mt-1">{a.neighborhood} · Sensor {a.sensor} · {a.timestamp}</div>
                    <div className="text-xs text-slate-400 mt-1">{a.reason}</div>
                  </div>
                  <span className={`badge ${
                    a.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    a.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>{a.severity.toUpperCase()}</span>
                </div>
                <div className="text-xs text-slate-600 mt-2">DEMO alert · All values simulated</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

