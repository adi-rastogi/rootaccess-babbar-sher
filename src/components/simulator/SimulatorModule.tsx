import { useState } from 'react';
import { FlaskConical, Play, RotateCcw, Info, BookmarkPlus, GitCompare, ShieldCheck, Zap, Car, Factory, Flame, Droplets, CheckCircle2, AlertOctagon, TrendingDown, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface Scenario {
  id: string;
  name: string;
  windSpeed: number;
  windDir: string;
  temp: number;
  humidity: number;
  rainfall: 'none' | 'light' | 'moderate' | 'heavy';
  traffic: 'low' | 'medium' | 'high';
  industrial: number;
  festival: number;
}

const PRESET_SCENARIOS: Scenario[] = [
  { id: 'normal', name: 'Normal Urban Base', windSpeed: 8, windDir: 'NW', temp: 25, humidity: 60, rainfall: 'none', traffic: 'medium', industrial: 30, festival: 0 },
  { id: 'high_traffic', name: 'Peak Rush Congestion', windSpeed: 4, windDir: 'NW', temp: 28, humidity: 55, rainfall: 'none', traffic: 'high', industrial: 30, festival: 0 },
  { id: 'diwali', name: 'Diwali Smog Trap', windSpeed: 2.5, windDir: 'N', temp: 22, humidity: 78, rainfall: 'none', traffic: 'low', industrial: 20, festival: 90 },
  { id: 'low_wind', name: 'Stagnant Calm Inversion', windSpeed: 1.5, windDir: 'NE', temp: 24, humidity: 70, rainfall: 'none', traffic: 'medium', industrial: 30, festival: 0 },
  { id: 'heavy_rain', name: 'Heavy Monsoon Wash', windSpeed: 15, windDir: 'SW', temp: 20, humidity: 92, rainfall: 'heavy', traffic: 'low', industrial: 20, festival: 0 },
  { id: 'high_wind', name: 'High Wind Cleansing', windSpeed: 18, windDir: 'W', temp: 23, humidity: 52, rainfall: 'none', traffic: 'medium', industrial: 30, festival: 0 },
];

// Educational simulation model
function runSimulation(scenario: Scenario): Record<string, number> {
  const windFactor = Math.max(0.2, 1 - scenario.windSpeed * 0.045);
  const humidFactor = 1 + (scenario.humidity - 50) * 0.004;
  const trafficFactor = scenario.traffic === 'high' ? 1.5 : scenario.traffic === 'low' ? 0.7 : 1.0;
  const rainfallFactor = scenario.rainfall === 'heavy' ? 0.45 : scenario.rainfall === 'moderate' ? 0.65 : scenario.rainfall === 'light' ? 0.8 : 1.0;
  const industrialFactor = 1 + scenario.industrial * 0.006;
  const festivalFactor = 1 + scenario.festival * 0.018;

  const basePM25 = 80;
  const pm25 = Math.round(basePM25 * windFactor * humidFactor * trafficFactor * rainfallFactor * industrialFactor * festivalFactor);
  const pm10 = Math.round(pm25 * 1.4);
  const aqi = Math.round(pm25 * 1.35);

  return { pm25: Math.max(10, pm25), pm10: Math.max(15, pm10), aqi: Math.max(20, aqi) };
}

// City Policy Interventions Data
interface Policy {
  id: string;
  name: string;
  reductionPct: number;
  icon: any;
  category: string;
  description: string;
  cost: string;
  active: boolean;
}

export default function SimulatorModule() {
  const [activeTab, setActiveTab] = useState<'meteorology' | 'policy'>('policy');

  // Meteorology Sandbox State
  const [scenario, setScenario] = useState<Scenario>({ ...PRESET_SCENARIOS[0] });
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [running, setRunning] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<Array<{ scenario: Scenario; results: Record<string, number> }>>([]);

  // Policy Interventions State
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 'odd_even',
      name: 'Odd-Even Traffic Rationing',
      reductionPct: 14,
      icon: Car,
      category: 'Transport',
      description: 'Restricts 50% of non-electric passenger vehicles on alternate days based on registration number plate.',
      cost: 'Low',
      active: true,
    },
    {
      id: 'lez',
      name: 'Zero-Emission Ultra Low Emission Zones (ULEZ)',
      reductionPct: 22,
      icon: Zap,
      category: 'Transport',
      description: 'Strict restriction on BS-III/IV diesel commercial vehicles in core urban commercial districts.',
      cost: 'Medium',
      active: true,
    },
    {
      id: 'stubble_ban',
      name: 'Satellite Stubble Inflow Strict Geo-Fence Ban',
      reductionPct: 38,
      icon: Flame,
      category: 'Regional',
      description: 'Zero-tolerance farm fire enforcement via real-time VIIRS/MODIS satellite geo-alerts and crop bio-decomposers.',
      cost: 'High',
      active: false,
    },
    {
      id: 'anti_smog',
      name: 'High-Pressure Anti-Smog Gun Mist Cannons',
      reductionPct: 11,
      icon: Droplets,
      category: 'Municipal',
      description: 'Deployment of 150+ truck-mounted atomized water mist cannons at major arterial corridors and construction sites.',
      cost: 'Medium',
      active: true,
    },
    {
      id: 'industrial_curtail',
      name: 'Coal Boiler & Brick Kiln Temporary Halts',
      reductionPct: 26,
      icon: Factory,
      category: 'Industry',
      description: 'Curtailment of heavy industrial boilers, stone crushers, and non-piped natural gas (PNG) manufacturing units.',
      cost: 'High',
      active: false,
    },
    {
      id: 'free_transit',
      name: 'Zero-Fare Public Metro & Electric Buses',
      reductionPct: 18,
      icon: ShieldCheck,
      category: 'Transit',
      description: 'Free public transport rides during high-smog periods to incentivize modal shift away from private combustion vehicles.',
      cost: 'High',
      active: false,
    },
  ]);

  // Toggle Policy
  const togglePolicy = (id: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  // Preset GRAP Actions
  const applyGrapPreset = (level: 'grap2' | 'grap3' | 'grap4' | 'clear') => {
    setPolicies(prev =>
      prev.map(p => {
        if (level === 'clear') return { ...p, active: false };
        if (level === 'grap2') return { ...p, active: p.id === 'anti_smog' };
        if (level === 'grap3') return { ...p, active: p.id === 'anti_smog' || p.id === 'lez' || p.id === 'industrial_curtail' };
        if (level === 'grap4') return { ...p, active: true };
        return p;
      })
    );
  };

  // Calculate Cumulative Abatement
  const activePolicies = policies.filter(p => p.active);
  // Diminishing returns formula: 1 - prod(1 - r_i)
  const totalReductionPct = Math.round(
    (1 - activePolicies.reduce((acc, p) => acc * (1 - p.reductionPct / 100), 1)) * 100
  );

  const baselineAQI = 310;
  const simulatedAQI = Math.max(45, Math.round(baselineAQI * (1 - totalReductionPct / 100)));
  const avoidedHospitalVisits = Math.round(totalReductionPct * 26.5);
  const economicProductivitySaved = Math.round(totalReductionPct * 1.8);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setResults(runSimulation(scenario));
      setRunning(false);
    }, 900);
  };

  const handlePreset = (preset: Scenario) => {
    setScenario({ ...preset });
    setResults(null);
  };

  const handleSave = () => {
    if (results) {
      setSavedScenarios(prev => [...prev.slice(-2), { scenario: { ...scenario }, results }]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Environmental & Policy Simulation Lab
            <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">
              DIGITAL TWIN SANDBOX
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluate Urban Policy Interventions · GRAP Action Modules · Meteorological Advection Simulator
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-navy-950 p-1.5 rounded-xl border border-navy-800">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'policy'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            Policy Interventions (GRAP)
          </button>
          <button
            onClick={() => setActiveTab('meteorology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'meteorology'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical size={13} />
            Meteorology Sandbox
          </button>
        </div>
      </div>

      {/* POLICY INTERVENTIONS SIMULATOR (MODERN 21ST.DEV STYLE) */}
      {activeTab === 'policy' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Live Abatement Telemetry Banner */}
          <div className="hud-panel p-6 border border-purple-500/40 bg-gradient-to-r from-navy-950 via-purple-950/20 to-navy-950 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 critical-sonar" />
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    GRAP Emergency Action Impact Engine
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  Urban Policy & Emergency Action Simulator
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toggle municipal restrictions, stubble enforcement, and traffic bans to project citywide pollution abatement and public health relief in real time.
                </p>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-semibold">Quick Presets:</span>
                  <button
                    onClick={() => applyGrapPreset('grap2')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all"
                  >
                    GRAP Stage II (Very Poor)
                  </button>
                  <button
                    onClick={() => applyGrapPreset('grap3')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-all"
                  >
                    GRAP Stage III (Severe)
                  </button>
                  <button
                    onClick={() => applyGrapPreset('grap4')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
                  >
                    GRAP Stage IV (Max Emergency)
                  </button>
                  <button
                    onClick={() => applyGrapPreset('clear')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-navy-700 bg-navy-900 text-slate-400 hover:text-white transition-all"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              {/* Dynamic Counters Bento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto flex-shrink-0">
                <div className="bg-navy-950/80 p-3.5 rounded-2xl border border-purple-500/30 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Net Abatement</div>
                  <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                    -{totalReductionPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{activePolicies.length} Active Policies</div>
                </div>

                <div className="bg-navy-950/80 p-3.5 rounded-2xl border border-purple-500/30 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Baseline AQI</div>
                  <div className="text-3xl font-black font-mono text-red-400 mt-1">
                    {baselineAQI}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Severe Smog</div>
                </div>

                <div className="bg-navy-950/80 p-3.5 rounded-2xl border border-emerald-500/50 bg-emerald-500/5 text-center">
                  <div className="text-[10px] text-emerald-300 uppercase tracking-wide">Simulated AQI</div>
                  <div className="text-3xl font-black font-mono text-emerald-300 mt-1">
                    {simulatedAQI}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {simulatedAQI > 200 ? 'Poor' : simulatedAQI > 100 ? 'Moderate' : 'Acceptable'}
                  </div>
                </div>

                <div className="bg-navy-950/80 p-3.5 rounded-2xl border border-purple-500/30 text-center">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avoided ER Visits</div>
                  <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
                    {avoidedHospitalVisits}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cases / Day saved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Policy Cards Grid (21st.dev inspired Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map(p => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => togglePolicy(p.id)}
                  className={`cursor-pointer hud-panel p-5 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between border ${
                    p.active
                      ? 'border-purple-400/80 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                      : 'border-navy-700/80 opacity-60 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2.5 rounded-xl ${
                            p.active ? 'bg-purple-500/20 text-purple-300' : 'bg-navy-800 text-slate-400'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {p.category}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                        </div>
                      </div>

                      {/* Toggle Pill */}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border transition-all ${
                          p.active
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-navy-900 border-navy-700 text-slate-500'
                        }`}
                      >
                        {p.active ? 'ENFORCED' : 'OFF'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-navy-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingDown size={14} />
                      -{p.reductionPct}% Sector PM
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Cost: <span className="text-slate-200 font-semibold">{p.cost}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Policy Before vs After Comparison Visualizer */}
          <div className="hud-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Simulated Particulate Spectrum: Uncontrolled vs Enforced Policy Suite
              </span>
              <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px]">
                LIVE DELTA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'PM2.5 (Fine Respirable)', base: 230, projected: Math.round(230 * (1 - totalReductionPct / 100)), unit: 'µg/m³' },
                { label: 'PM10 (Coarse Inhalable)', base: 360, projected: Math.round(360 * (1 - totalReductionPct / 100)), unit: 'µg/m³' },
                { label: 'Nitrogen Dioxide (NO₂)', base: 98, projected: Math.round(98 * (1 - (totalReductionPct * 0.75) / 100)), unit: 'ppb' },
              ].map(item => (
                <div key={item.label} className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">{item.label}</div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-red-400">{item.base} {item.unit}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400 font-black">{item.projected} {item.unit}</span>
                  </div>
                  {/* Progress difference bar */}
                  <div className="h-2 bg-navy-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(item.projected / item.base) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-500/50 transition-all duration-500"
                      style={{ width: `${100 - (item.projected / item.base) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    Avoided: <span className="text-emerald-400 font-bold">{item.base - item.projected} {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* METEOROLOGY SANDBOX (ORIGINAL TAB) */}
      {activeTab === 'meteorology' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-purple-300/80 leading-relaxed">
                <strong>Model disclaimer:</strong> This simulator uses a <em>simplified educational approximation</em>, not a validated Gaussian plume or advection-diffusion model.
                Results show illustrative directional trends only. Real atmospheric dispersion modelling requires validated emission inventories, meteorological profiles, boundary conditions, and evaluation against measured data.
              </div>
            </div>
          </div>

          {/* Preset scenarios */}
          <div className="hud-panel p-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Preset Meteorological Scenarios</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {PRESET_SCENARIOS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    scenario.id === p.id
                      ? 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-md shadow-purple-500/20'
                      : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-slate-200 hover:border-navy-500'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Controls */}
            <div className="hud-panel p-5 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Meteorological & Source Knobs</div>

              {/* Live Station Feeds (NO SLIDERS) */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Live Station Telemetry Feeds:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'CPCB Anand Vihar', wind: 3.5, hum: 72, ind: 45, fest: 10 },
                    { label: 'Safdarjung AWS', wind: 12.0, hum: 58, ind: 20, fest: 0 },
                    { label: 'Okhla Industrial', wind: 2.2, hum: 65, ind: 80, fest: 15 },
                    { label: 'Diwali Peak Stagnation', wind: 1.8, hum: 78, ind: 25, fest: 90 },
                  ].map(f => (
                    <button
                      key={f.label}
                      onClick={() => setScenario(s => ({
                        ...s,
                        windSpeed: f.wind,
                        humidity: f.hum,
                        industrial: f.ind,
                        festival: f.fest,
                      }))}
                      className="p-2 rounded-xl border border-navy-700 bg-navy-950/80 hover:bg-navy-900 text-left transition-all"
                    >
                      <div className="text-[11px] font-bold text-white truncate">{f.label}</div>
                      <div className="text-[9px] text-cyan-400 font-mono mt-0.5">{f.wind} km/h · {f.hum}% RH</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wind Speed Stepper */}
              <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Wind Velocity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScenario(s => ({ ...s, windSpeed: Math.max(0.5, parseFloat((s.windSpeed - 0.5).toFixed(1))) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      -
                    </button>
                    <span className="font-mono text-cyan-400 font-bold text-xs w-16 text-center">{scenario.windSpeed} km/h</span>
                    <button
                      onClick={() => setScenario(s => ({ ...s, windSpeed: Math.min(35, parseFloat((s.windSpeed + 0.5).toFixed(1))) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Humidity Stepper */}
              <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Relative Humidity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScenario(s => ({ ...s, humidity: Math.max(20, s.humidity - 5) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      -
                    </button>
                    <span className="font-mono text-purple-400 font-bold text-xs w-16 text-center">{scenario.humidity}%</span>
                    <button
                      onClick={() => setScenario(s => ({ ...s, humidity: Math.min(100, s.humidity + 5) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Industrial Activity Stepper */}
              <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Industrial Boiler Output:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScenario(s => ({ ...s, industrial: Math.max(0, s.industrial - 10) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      -
                    </button>
                    <span className="font-mono text-amber-400 font-bold text-xs w-16 text-center">{scenario.industrial}%</span>
                    <button
                      onClick={() => setScenario(s => ({ ...s, industrial: Math.min(100, s.industrial + 10) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Firecracker / Festival Activity Stepper */}
              <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pyrotechnic Burst Factor:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScenario(s => ({ ...s, festival: Math.max(0, s.festival - 10) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      -
                    </button>
                    <span className="font-mono text-red-400 font-bold text-xs w-16 text-center">{scenario.festival}%</span>
                    <button
                      onClick={() => setScenario(s => ({ ...s, festival: Math.min(100, s.festival + 10) }))}
                      className="w-6 h-6 rounded bg-navy-900 border border-navy-700 text-white font-bold hover:bg-navy-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Traffic Density & Rainfall */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Traffic Density</label>
                  <select
                    value={scenario.traffic}
                    onChange={e => setScenario(s => ({ ...s, traffic: e.target.value as any }))}
                    className="select-field text-xs w-full bg-navy-950"
                  >
                    <option value="low">Low (Night/Holiday)</option>
                    <option value="medium">Medium (Regular)</option>
                    <option value="high">High (Severe Rush)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rain Precipitation</label>
                  <select
                    value={scenario.rainfall}
                    onChange={e => setScenario(s => ({ ...s, rainfall: e.target.value as any }))}
                    className="select-field text-xs w-full bg-navy-950"
                  >
                    <option value="none">None (Dry)</option>
                    <option value="light">Light Drizzle</option>
                    <option value="moderate">Moderate Showers</option>
                    <option value="heavy">Heavy Torrent</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="btn-primary text-xs py-2 flex-1 justify-center bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  <Play size={14} className={running ? 'animate-spin' : ''} />
                  {running ? 'Computing Dispersion...' : 'Run Simulation'}
                </button>
                {results && (
                  <button
                    onClick={handleSave}
                    className="btn-secondary text-xs py-2 px-3"
                    title="Save to comparison"
                  >
                    <BookmarkPlus size={14} />
                  </button>
                )}
                <button
                  onClick={() => handlePreset(PRESET_SCENARIOS[0])}
                  className="btn-secondary text-xs py-2 px-3"
                  title="Reset to default"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="hud-panel p-5 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Simulation Telemetry Output</div>

              {running && (
                <div className="h-64 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <span className="text-xs text-slate-400 font-mono">Solving Advection & Dispersion Equations...</span>
                </div>
              )}

              {!running && !results && (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <FlaskConical size={36} className="text-purple-400/40" />
                  <span className="text-xs">Adjust knobs and click "Run Simulation"</span>
                </div>
              )}

              {!running && results && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                      <div className="text-[10px] text-slate-400">Projected PM2.5</div>
                      <div className="text-2xl font-black font-mono text-amber-400 mt-1">{results.pm25} <span className="text-xs font-normal">µg</span></div>
                    </div>
                    <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                      <div className="text-[10px] text-slate-400">Projected PM10</div>
                      <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{results.pm10} <span className="text-xs font-normal">µg</span></div>
                    </div>
                    <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                      <div className="text-[10px] text-slate-400">Projected AQI</div>
                      <div className="text-2xl font-black font-mono text-red-400 mt-1">{results.aqi}</div>
                    </div>
                  </div>

                  <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
                    <div className="text-xs font-semibold text-slate-300 mb-2">Simulated Impact Assessment</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {results.aqi > 300
                        ? '🚨 Severe Emergency. Rapid particulate buildup exceeds hazardous thresholds. Strict emission curtailment required.'
                        : results.aqi > 200
                        ? '⚠️ Very Poor. Adverse meteorological stagnation trapping combustion products.'
                        : '✅ Moderate to Acceptable. Strong dispersion ventilation diluting surface particulates.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
