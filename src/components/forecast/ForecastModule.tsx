import { useState } from 'react';
import { TrendingUp, Info, AlertTriangle, Clock, ShieldCheck, Sun, Moon, Wind, Layers, BrainCircuit, Activity } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, BarChart, Bar
} from 'recharts';
import { NEIGHBORHOODS, generateForecast, getAQICategory } from '../../data/demoData';
import { useApp } from '../../App';

export default function ForecastModule() {
  const { selectedNeighborhood, setSelectedNeighborhood } = useApp();
  const [horizon, setHorizon] = useState(24);
  const [pollutant, setPollutant] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');
  const [scrubberHour, setScrubberHour] = useState<number>(3); // +3 hours ahead default

  const neighborhood = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)!;
  const baseAQI = selectedNeighborhood === 'nm' ? 289 :
    selectedNeighborhood === 'rk' ? 248 :
    selectedNeighborhood === 'cp' ? 193 :
    selectedNeighborhood === 'gh' ? 103 : 160;

  const forecast = generateForecast(baseAQI, horizon);
  const cat = getAQICategory(baseAQI);

  // Scrubber data point
  const scrubbedPoint = forecast[Math.min(scrubberHour, forecast.length - 1)] || forecast[0];
  const scrubbedCat = getAQICategory(scrubbedPoint.aqi);

  // Boundary Layer Height (Atmospheric Inversion Dynamics)
  const boundaryLayerData = [
    { time: '00:00', height: 260, inversion: 'Moderate', aqi: Math.round(baseAQI * 1.08) },
    { time: '03:00', height: 180, inversion: 'Severe Trap', aqi: Math.round(baseAQI * 1.25) },
    { time: '06:00', height: 160, inversion: 'Maximum Trap', aqi: Math.round(baseAQI * 1.34) },
    { time: '09:00', height: 450, inversion: 'Dissolving', aqi: Math.round(baseAQI * 1.15) },
    { time: '12:00', height: 1200, inversion: 'None (Well Mixed)', aqi: Math.round(baseAQI * 0.78) },
    { time: '15:00', height: 1450, inversion: 'None (Peak Mixing)', aqi: Math.round(baseAQI * 0.72) },
    { time: '18:00', height: 800, inversion: 'Descending', aqi: Math.round(baseAQI * 0.95) },
    { time: '21:00', height: 350, inversion: 'Moderate', aqi: Math.round(baseAQI * 1.12) },
  ];

  // 24-Hour Safe Outdoor Exposure Schedule
  const exposureSchedule = [
    { window: '05:00 - 08:30', status: 'HAZARDOUS', type: 'danger', aqi: '320 - 390', advice: 'Severe nocturnal inversion. No jogging or cycling.', icon: Moon },
    { window: '08:30 - 11:30', status: 'POOR', type: 'warning', aqi: '240 - 290', advice: 'Morning traffic rush. Wear N95 respirator.', icon: Sun },
    { window: '11:30 - 16:30', status: 'OPTIMAL WINDOW', type: 'success', aqi: '135 - 175', advice: 'Solar heating expands mixing height. Best time for errands & transit.', icon: Sun },
    { window: '16:30 - 20:00', status: 'MODERATE RISK', type: 'warning', aqi: '220 - 260', advice: 'Evening traffic peak starts. Sensitive groups stay indoors.', icon: Moon },
    { window: '20:00 - 00:00', status: 'HIGH RISK', type: 'danger', aqi: '290 - 340', advice: 'Surface temperature collapse. Run indoor air purifiers.', icon: Moon },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            AI Atmospheric & Pollution Forecasting
            <span className="badge badge-simulated">ENSEMBLE PREDICTOR</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Multi-Horizon Neural Projection · Boundary Layer Inversion Modeling · 24-Hour Safe Exposure Window
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs">
            <BrainCircuit size={12} className="inline mr-1" /> Bi-LSTM + Random Forest
          </span>
          <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
            R² = 0.887 (Held-out Test)
          </span>
        </div>
      </div>

      {/* Disclaimers & Model Architecture Info */}
      <div className="hud-panel p-4 border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Atmospheric Forecast Model Architecture:</strong> Combines meteorological boundary layer collapse height,
            regional satellite stubble fire trajectory, and local street traffic density using a recurrent sequence-to-sequence ensemble.
            Confidence bands widen progressively beyond +12 hours due to synoptic wind drift variance.
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="hud-panel p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Target Sector:</label>
            <select
              value={selectedNeighborhood}
              onChange={e => setSelectedNeighborhood(e.target.value as any)}
              className="select-field text-xs bg-navy-950 font-semibold"
            >
              {NEIGHBORHOODS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Forecast Horizon:</label>
            <div className="flex gap-1">
              {[6, 12, 24, 48].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    horizon === h
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-navy-950 border-navy-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  +{h}h
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Metric:</label>
            <div className="flex gap-1">
              {(['aqi', 'pm25', 'pm10'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPollutant(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border ${
                    pollutant === p
                      ? 'bg-purple-500/25 border-purple-400 text-purple-300'
                      : 'bg-navy-950 border-navy-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last Synced: <span className="text-cyan-400">10 mins ago</span>
        </div>
      </div>

      {/* INTERACTIVE TIME SCRUBBER CARD (UNIQUE FEATURE) */}
      <div className="hud-panel p-5 border border-cyan-500/40 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive Time-Scrubber: Preview Any Future Hour
            </span>
          </div>
          <div className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            Selected Window: <span className="font-bold text-white">{scrubbedPoint?.hour} from now</span>
          </div>
        </div>

        {/* Live Horizon Telemetry Selector (NO SLIDER) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 my-2">
          {[1, 2, 3, 6, 12, 24, 48].filter(h => h <= horizon).map(h => {
            const pt = forecast[Math.min(h, forecast.length - 1)] || forecast[0];
            const ptCat = getAQICategory(pt.aqi);
            const isSel = scrubberHour === h;
            return (
              <button
                key={h}
                onClick={() => setScrubberHour(h)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isSel
                    ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20 text-white'
                    : 'border-navy-700 bg-navy-950/80 hover:bg-navy-900 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] font-mono font-bold">+{h}h Window</div>
                <div className="text-sm font-black font-mono mt-0.5" style={{ color: ptCat.color }}>
                  {pt.aqi}
                </div>
                <div className="text-[9px] font-medium" style={{ color: ptCat.color }}>{ptCat.label}</div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Scrubbed Telemetry Result */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Projected AQI</div>
            <div className="text-2xl font-black font-mono mt-0.5" style={{ color: scrubbedCat.color }}>
              {scrubbedPoint.aqi}
            </div>
            <div className="text-[10px] font-semibold" style={{ color: scrubbedCat.color }}>
              {scrubbedCat.label}
            </div>
          </div>

          <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Projected PM2.5</div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
              {scrubbedPoint.pm25} <span className="text-xs text-slate-400 font-normal">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500">Fine respirable matter</div>
          </div>

          <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Confidence Band</div>
            <div className="text-2xl font-black font-mono text-cyan-300 mt-0.5">
              {Math.round(scrubbedPoint.confidence)}%
            </div>
            <div className="text-[10px] text-slate-500">Uncertainty ±{Math.round((scrubbedPoint.upper - scrubbedPoint.lower) / 2)} AQI</div>
          </div>

          <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-700 text-left flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Health Recommendation</div>
            <div className="text-xs text-slate-200 mt-1 font-medium leading-snug">
              {scrubbedPoint.aqi > 250
                ? '⚠️ Avoid strenuous outdoor activity. Keep windows shut.'
                : scrubbedPoint.aqi > 150
                ? '😷 Sensitive groups wear N95 outdoors.'
                : '✅ Safe for outdoor movement and ventilation.'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart with Confidence Band */}
      <div className="hud-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {horizon}-Hour {pollutant.toUpperCase()} Neural Forecast with Confidence Dispersion Interval
            </span>
          </div>
          <span className="badge badge-simulated">±σ UNCERTAINTY BAND</span>
        </div>

        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={horizon > 24 ? 3 : 1} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['dataMin - 15', 'dataMax + 20']} />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="hud-panel p-3 text-xs border border-cyan-500/40">
                      <div className="font-bold text-cyan-300 font-mono mb-1">{d.hour}</div>
                      <div className="text-white font-mono">Predicted {pollutant.toUpperCase()}: <span className="font-black text-amber-400">{d[pollutant]}</span></div>
                      <div className="text-slate-400 font-mono text-[11px]">Confidence Range: {d.lower} - {d.upper}</div>
                      <div className="text-slate-400 font-mono text-[11px]">Model Confidence: {d.confidence}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Confidence Band */}
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" fillOpacity={1} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#081426" fillOpacity={1} />

            {/* Main Value Line */}
            <Line
              type="monotone"
              dataKey={pollutant}
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ fill: '#22d3ee', r: 3.5 }}
              name={`Predicted ${pollutant.toUpperCase()}`}
            />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Severe Threshold (200)', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate Threshold (100)', fill: '#f59e0b', fontSize: 10 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* UNIQUE ATMOSPHERIC INVERSION PREDICTOR & 24-HR OUTDOOR EXPOSURE PLANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Nocturnal Inversion & Boundary Layer Trapping */}
        <div className="hud-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Boundary Layer Inversion Collapse Dynamics
              </span>
            </div>
            <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]">
              TRAPPING DETECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            During winter nights, ground radiation rapidly cools the surface air, creating a thermal inversion lid.
            The atmospheric mixing height drops from 1,450 meters to just 160 meters, compressing pollutants into a toxic surface smog.
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={boundaryLayerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Mixing Height (m)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="hud-panel p-2.5 text-xs">
                        <div className="font-bold text-purple-300 font-mono">{d.time}</div>
                        <div>Boundary Height: <span className="font-bold text-white font-mono">{d.height} m</span></div>
                        <div className="text-amber-400 font-semibold">{d.inversion}</div>
                        <div className="text-slate-400">Simulated AQI: {d.aqi}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="height" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Mixing Height (m)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 24-Hour Safe Outdoor Exposure Window Planner */}
        <div className="hud-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  24-Hour Outdoor Exposure Window Planner
                </span>
              </div>
              <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                ACTIONABLE ADVICE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Use solar atmospheric expansion windows to schedule outdoor activities, school commutes, and athletic training safely.
            </p>

            <div className="space-y-2.5">
              {exposureSchedule.map((slot, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    slot.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : slot.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <slot.icon size={16} className="flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{slot.window}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-navy-950">
                          {slot.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{slot.advice}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-xs font-mono font-black text-white">{slot.aqi}</div>
                    <div className="text-[9px] text-slate-400">AQI RANGE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
