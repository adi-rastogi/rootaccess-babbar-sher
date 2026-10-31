import { useState } from 'react';
import { TrendingUp, Info, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { NEIGHBORHOODS, generateForecast, getAQICategory } from '../../data/demoData';
import { useApp } from '../../App';

export default function ForecastModule() {
  const { selectedNeighborhood, setSelectedNeighborhood } = useApp();
  const [horizon, setHorizon] = useState(24);
  const [pollutant, setPollutant] = useState('aqi');

  const neighborhood = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;
  const baseAQI = selectedNeighborhood === 'nm' ? 289 :
    selectedNeighborhood === 'rk' ? 248 :
    selectedNeighborhood === 'cp' ? 193 :
    selectedNeighborhood === 'gh' ? 103 : 160;

  const forecast = generateForecast(baseAQI, horizon);
  const cat = getAQICategory(baseAQI);

  // Future hotspots (SIMULATED)
  const hotspots = [
    { neighborhood: 'Narela', expectedPeak: 312, window: '+6h', risk: 'critical', confidence: 62 },
    { neighborhood: 'RK Puram', expectedPeak: 267, window: '+8h', risk: 'high', confidence: 58 },
    { neighborhood: 'Connaught Place', expectedPeak: 220, window: '+12h', risk: 'high', confidence: 51 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Neighborhood Pollution Forecasting
          <span className="badge badge-simulated">SIMULATED — not real predictions</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Educational forecast · Uncertainty shown · Would use trained ML model in production</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300/80">
            <strong>Forecast disclaimer:</strong> Values shown are <strong>SIMULATED</strong> using a sine-wave + noise generator for demonstration.
            Real forecasts would use a trained scikit-learn model (e.g. Random Forest / LSTM) trained on historical sensor data,
            evaluated with held-out test sets, and clearly reporting R², MAE, and uncertainty intervals.
            Confidence intervals widen with forecast horizon (shown below).
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Neighborhood:</label>
          <select
            value={selectedNeighborhood}
            onChange={e => setSelectedNeighborhood(e.target.value as any)}
            className="select-field text-xs"
          >
            {NEIGHBORHOODS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Horizon:</label>
          <div className="flex gap-1">
            {[6, 12, 24, 48].map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  horizon === h
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-navy-800 border-navy-600 text-slate-400 hover:text-slate-200'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Show:</label>
          <select value={pollutant} onChange={e => setPollutant(e.target.value)} className="select-field text-xs">
            <option value="aqi">AQI</option>
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10</option>
          </select>
        </div>
      </div>

      {/* Current status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Current AQI', value: baseAQI, color: cat.color, sub: cat.label },
          { label: `${horizon}h Peak (SIMULATED)`, value: Math.max(...forecast.map(f => f.aqi)), color: '#ef4444', sub: 'DEMO simulation' },
          { label: `${horizon}h Min (SIMULATED)`, value: Math.min(...forecast.map(f => f.aqi)), color: '#22c55e', sub: 'DEMO simulation' },
          { label: 'Max Confidence', value: `${Math.round(forecast[0]?.confidence || 95)}%`, color: '#22d3ee', sub: 'Drops with horizon' },
        ].map(m => (
          <div key={m.label} className="card text-center">
            <div className="text-xs text-slate-500 mb-1">{m.label}</div>
            <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Forecast chart with confidence band */}
      <div className="card">
        <div className="section-title">
          <TrendingUp size={16} className="text-emerald-400" />
          {horizon}-Hour AQI Forecast — {neighborhood.name}
          <span className="badge badge-simulated ml-auto">SIMULATED</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} interval={Math.floor(horizon / 6)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v: any, n: string) => [`${Math.round(v)}`, n]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
            <Area
              type="monotone" dataKey="upper" stroke="none"
              fill="url(#confGrad)" name="Upper CI" legendType="none"
            />
            <Area
              type="monotone" dataKey="lower" stroke="none"
              fill="#0a1628" name="Lower CI" legendType="none"
            />
            <Area
              type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2}
              fill="url(#aqiGrad)" name="Forecast AQI"
            />
            <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="4 4" opacity={0.5} />
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" opacity={0.5} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-2">
          Shaded band = confidence interval (widens with forecast horizon). All values: DEMO/SIMULATED.
          In production: would show actual model predictions with validated accuracy metrics.
        </p>
      </div>

      {/* Future hotspot explorer */}
      <div className="card">
        <div className="section-title">
          <AlertTriangle size={16} className="text-orange-400" />
          Future Hotspot Explorer (SIMULATED)
        </div>
        <div className="space-y-3">
          {hotspots.map(h => (
            <div key={h.neighborhood} className="flex items-center gap-4 px-4 py-3 bg-navy-900 rounded-xl flex-wrap">
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{h.neighborhood}</div>
                <div className="text-xs text-slate-500">Expected peak in {h.window} · Confidence: {h.confidence}%</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${h.risk === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                  {h.expectedPeak}
                </div>
                <div className="text-xs text-slate-500">AQI (SIMULATED)</div>
              </div>
              <div className="w-full">
                <div className="h-1.5 bg-navy-800 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${h.confidence}%`,
                      background: h.risk === 'critical' ? '#ef4444' : '#f97316',
                    }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{h.confidence}% model confidence — DEMO simulation only</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

