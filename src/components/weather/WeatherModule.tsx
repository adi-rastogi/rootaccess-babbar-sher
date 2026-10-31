import { useState, useEffect, useRef } from 'react';
import { Cloud, Wind, Droplets, Thermometer, Eye, Sun, CloudRain, Zap, ShieldAlert, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WEATHER_DATA } from '../../data/demoData';

function WeatherCard({ icon: Icon, label, value, unit, color, sub }: any) {
  return (
    <div className="hud-panel p-4 flex items-center gap-3 hover:border-cyan-500/40 transition-all">
      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: color + '1c' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-[11px] text-slate-400 font-medium tracking-wide">{label}</div>
        <div className="text-xl font-black text-white font-mono">{value}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></div>
        {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function WindCompass({ deg, speed }: { deg: number; speed: number }) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dir = dirs[Math.round(deg / 45) % 8];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="54" fill="#081426" stroke="#162d5e" strokeWidth="2" />
          <circle cx="60" cy="60" r="42" fill="none" stroke="#162d5e" strokeWidth="1" strokeDasharray="3 3" />
          {dirs.map((d, i) => {
            const angle = (i * 45 - 90) * Math.PI / 180;
            const x = 60 + 44 * Math.cos(angle);
            const y = 60 + 44 * Math.sin(angle);
            return <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={d === 'N' ? '#22c55e' : '#475569'} fontSize="9" fontWeight="bold">{d}</text>;
          })}
          {/* Animated Wind vector */}
          <g transform={`rotate(${deg}, 60, 60)`}>
            <polygon points="60,16 53,52 60,46 67,52" fill="#22d3ee" opacity="0.95" style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
            <polygon points="60,104 54,68 60,74 66,68" fill="#475569" opacity="0.6" />
          </g>
          <circle cx="60" cy="60" r="4.5" fill="#22d3ee" />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-cyan-400 font-black font-mono tracking-wider text-base">{dir} ({deg}°)</div>
        <div className="text-slate-400 text-xs font-mono">{speed} km/h · Moderate Breeze</div>
      </div>
    </div>
  );
}

export default function WeatherModule() {
  const w = WEATHER_DATA.current;
  const [rainRate, setRainRate] = useState<number>(0); // mm/h (0 = clear/dry)
  const [activePreset, setActivePreset] = useState<'dry' | 'drizzle' | 'monsoon' | 'torrent'>('dry');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Atmospheric Wet Scavenging Calculation
  // Lambda = A * I^B (A ~ 1.2e-4, B ~ 0.8)
  const scavengingPct = rainRate === 0 
    ? 0 
    : Math.min(82, Math.round(18 + Math.pow(rainRate, 0.72) * 11));
  
  const baselinePM = 185;
  const washedPM = Math.max(22, Math.round(baselinePM * (1 - scavengingPct / 100)));

  // Preset setter
  const applyPreset = (preset: 'dry' | 'drizzle' | 'monsoon' | 'torrent') => {
    setActivePreset(preset);
    if (preset === 'dry') setRainRate(0);
    else if (preset === 'drizzle') setRainRate(4.5);
    else if (preset === 'monsoon') setRainRate(18.0);
    else if (preset === 'torrent') setRainRate(42.0);
  };

  // High performance Canvas Rain Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const numDrops = rainRate === 0 ? 0 : Math.min(350, Math.round(rainRate * 7 + 35));
    const drops = Array.from({ length: 400 }, () => ({
      x: Math.random() * (width + 100) - 50,
      y: Math.random() * height,
      len: Math.random() * 16 + 8,
      speed: Math.random() * 8 + 12 + rainRate * 0.4,
      slant: -2.8, // slight angle matching wind
      opacity: Math.random() * 0.45 + 0.25,
      splashRadius: 0,
      splashing: false,
    }));

    const splashes: Array<{ x: number; y: number; r: number; opacity: number }> = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (rainRate > 0) {
        // Draw drops
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = rainRate > 20 ? 1.8 : 1.2;

        for (let i = 0; i < numDrops; i++) {
          const d = drops[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(103, 232, 249, ${d.opacity})`;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.slant, d.y + d.len);
          ctx.stroke();

          d.y += d.speed;
          d.x += d.slant * 0.6;

          // Splash on floor
          if (d.y >= height - 12) {
            if (splashes.length < 50 && Math.random() > 0.4) {
              splashes.push({ x: d.x, y: height - Math.random() * 6, r: 1, opacity: 0.6 });
            }
            d.y = -10;
            d.x = Math.random() * (width + 100) - 50;
          }
        }

        // Render ripples / splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(56, 189, 248, ${s.opacity})`;
          ctx.ellipse(s.x, s.y, s.r * 2.2, s.r * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();
          s.r += 0.45;
          s.opacity -= 0.045;
          if (s.opacity <= 0) {
            splashes.splice(i, 1);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [rainRate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Weather & Atmospheric Intelligence
            <span className="badge badge-demo">LIVE METEOROLOGY</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dynamic Precipitation Simulation · Particulate Wet Scavenging · Atmospheric Inversion Surveillance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs">
            <Wind size={12} className="inline mr-1" /> NW 6.8 km/h
          </span>
          <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs">
            <Droplets size={12} className="inline mr-1" /> 68% RH
          </span>
        </div>
      </div>

      {/* RAIN SIMULATION INTERACTIVE STAGE */}
      <div className="relative hud-panel overflow-hidden border border-cyan-500/30 p-6">
        {/* Background Canvas for Rain Particles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <canvas ref={canvasRef} className="w-full h-full opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/50 to-navy-950/90" />
        </div>

        {/* Content over Rain */}
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <CloudRain size={20} className={rainRate > 0 ? 'animate-bounce' : ''} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Atmospheric Rain & Wet Deposition Simulator
                    {rainRate > 0 && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono animate-pulse">
                        WASHING ACTIVE ({rainRate} mm/h)
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Precipitation actively washes out airborne PM2.5 via collision and nucleation scavenging.
                  </p>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'dry', label: '☀️ Clear Haze', rate: 0 },
                { id: 'drizzle', label: '🌦️ Light Drizzle', rate: 4.5 },
                { id: 'monsoon', label: '🌧️ Monsoon Wash', rate: 18.0 },
                { id: 'torrent', label: '⛈️ Cloudburst', rate: 42.0 },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activePreset === p.id
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-navy-900/80 border-navy-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Slider & Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Slider Control */}
            <div className="lg:col-span-5 bg-navy-900/70 p-4 rounded-xl border border-navy-700">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Droplets size={14} className="text-cyan-400" />
                  Precipitation Intensity:
                </span>
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  {rainRate.toFixed(1)} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={rainRate}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setRainRate(val);
                  if (val === 0) setActivePreset('dry');
                  else if (val < 10) setActivePreset('drizzle');
                  else if (val < 30) setActivePreset('monsoon');
                  else setActivePreset('torrent');
                }}
                className="w-full accent-cyan-400 h-2 bg-navy-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0 mm (Dry Smog)</span>
                <span>15 mm (Steady Rain)</span>
                <span>50 mm (Heavy Torrent)</span>
              </div>
            </div>

            {/* Live Scavenging Telemetry */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3">
              <div className="bg-navy-900/70 p-3.5 rounded-xl border border-navy-700 text-center">
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">PM Washout Rate</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  -{scavengingPct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Scavenging efficiency</div>
              </div>

              <div className="bg-navy-900/70 p-3.5 rounded-xl border border-navy-700 text-center">
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Baseline PM2.5</div>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                  {baselinePM}
                  <span className="text-xs text-slate-400 font-normal ml-0.5">µg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Pre-precipitation</div>
              </div>

              <div className="bg-navy-900/70 p-3.5 rounded-xl border border-emerald-500/40 text-center bg-emerald-500/5">
                <div className="text-[11px] text-emerald-300 uppercase tracking-wide">Post-Rain PM2.5</div>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                  {washedPM}
                  <span className="text-xs text-slate-400 font-normal ml-0.5">µg</span>
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">
                  {rainRate > 0 ? '✨ Air Cleaned' : 'Normal Haze'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current conditions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <WeatherCard icon={Thermometer} label="Temperature" value={w.temp.toFixed(1)} unit="°C" color="#06b6d4" sub={`Feels ${w.feelsLike}°C`} />
        <WeatherCard icon={Droplets} label="Humidity" value={w.humidity} unit="%" color="#8b5cf6" sub={`Dew: ${w.dewPoint}°C`} />
        <WeatherCard icon={Wind} label="Wind Speed" value={w.windSpeed} unit="km/h" color="#22d3ee" sub={w.windDir} />
        <WeatherCard icon={Eye} label="Visibility" value={w.visibility} unit="km" color="#f59e0b" sub="Winter Smog" />
        <WeatherCard icon={Cloud} label="Pressure" value={w.pressure} unit="hPa" color="#6366f1" sub="High Stagnation" />
        <WeatherCard icon={Sun} label="UV Index" value={w.uvIndex} unit="" color="#eab308" sub="Moderate" />
      </div>

      {/* Main meteorological panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wind compass */}
        <div className="hud-panel flex flex-col items-center py-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Compass size={15} className="text-cyan-400" />
            Live Aerodynamic Wind Compass
          </div>
          <WindCompass deg={w.windDeg} speed={w.windSpeed} />
          <div className="mt-4 text-xs text-slate-400 text-center max-w-xs leading-relaxed">
            Dominant North-Westerly drift advects agrarian stubble smoke plume directly towards Delhi NCR basin.
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="hud-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">7-Day Meteorological Trajectory</span>
            <span className="badge badge-demo">SIMULATED</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {WEATHER_DATA.weeklyForecast.map((day, i) => (
              <div key={i} className="text-center bg-navy-950/70 border border-navy-800 rounded-xl p-2.5 hover:border-cyan-500/30 transition-all">
                <div className="text-[11px] text-slate-400 font-bold">{day.day}</div>
                <div className="text-2xl my-1.5">{day.condition}</div>
                <div className="text-xs font-black text-white">{day.high}°</div>
                <div className="text-[11px] text-slate-500">{day.low}°</div>
                {day.rain > 0 ? (
                  <div className="text-[10px] text-cyan-400 font-bold mt-1 bg-cyan-500/10 rounded py-0.5">{day.rain}mm</div>
                ) : (
                  <div className="text-[10px] text-slate-600 mt-1">Dry</div>
                )}
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{day.windSpeed}km/h</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly chart */}
      <div className="hud-panel">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Hourly Diurnal Temperature & Relative Humidity Gradient
          </span>
          <span className="badge badge-demo">24-HR CYCLE</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={WEATHER_DATA.hourlyForecast.slice(0, 24)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={2} />
            <YAxis yAxisId="temp" orientation="left" tick={{ fill: '#06b6d4', fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="humid" orientation="right" tick={{ fill: '#8b5cf6', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#081426', border: '1px solid #162d5e', borderRadius: '10px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Temp (°C)" />
            <Line yAxisId="humid" type="monotone" dataKey="humidity" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Humidity (%)" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wind vs PM2.5 correlation */}
      <div className="hud-panel">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Wind Velocity vs Airborne Particulate Concentration (Dilution Dynamics)
          </span>
          <span className="badge badge-demo">VENTILATION INDEX</span>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Stagnant calm conditions (&lt; 5 km/h) prevent vertical pollutant dispersion, trapping emissions in the surface boundary layer.
          Wind speeds above 12 km/h enhance advective cleansing and regional plume dilution.
        </p>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={WEATHER_DATA.correlations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
            <XAxis dataKey="windSpeed" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Surface Wind Speed (km/h)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#ef4444', fontSize: 10 }} label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#081426', border: '1px solid #162d5e', borderRadius: '10px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="PM2.5 µg/m³" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
