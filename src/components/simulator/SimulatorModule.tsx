import { useState } from 'react';
import { FlaskConical, Play, RotateCcw, Info, BookmarkPlus, GitCompare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

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
  { id: 'normal', name: 'Normal Urban', windSpeed: 8, windDir: 'NW', temp: 25, humidity: 60, rainfall: 'none', traffic: 'medium', industrial: 30, festival: 0 },
  { id: 'high_traffic', name: 'High Traffic', windSpeed: 4, windDir: 'NW', temp: 28, humidity: 55, rainfall: 'none', traffic: 'high', industrial: 30, festival: 0 },
  { id: 'diwali', name: 'Diwali Scenario', windSpeed: 2.5, windDir: 'N', temp: 22, humidity: 78, rainfall: 'none', traffic: 'low', industrial: 20, festival: 90 },
  { id: 'low_wind', name: 'Low Wind', windSpeed: 1.5, windDir: 'NE', temp: 24, humidity: 70, rainfall: 'none', traffic: 'medium', industrial: 30, festival: 0 },
  { id: 'heavy_rain', name: 'Heavy Rainfall', windSpeed: 15, windDir: 'SW', temp: 20, humidity: 92, rainfall: 'heavy', traffic: 'low', industrial: 20, festival: 0 },
  { id: 'high_wind', name: 'High Wind', windSpeed: 18, windDir: 'W', temp: 23, humidity: 52, rainfall: 'none', traffic: 'medium', industrial: 30, festival: 0 },
];

// Educational simulation model (NOT a validated dispersion model)
function runSimulation(scenario: Scenario): Record<string, number> {
  // Simplified educational approximation
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

export default function SimulatorModule() {
  const [scenario, setScenario] = useState<Scenario>({ ...PRESET_SCENARIOS[0] });
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [running, setRunning] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<Array<{ scenario: Scenario; results: Record<string, number> }>>([]);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setResults(runSimulation(scenario));
      setRunning(false);
    }, 1200);
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

  const comparisonData = savedScenarios.map(s => ({
    name: s.scenario.name,
    pm25: s.results.pm25,
    pm10: s.results.pm10,
    aqi: s.results.aqi,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Environmental Scenario Lab
          <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">EDUCATIONAL SIMULATION</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Modify environmental parameters · Explore hypothetical scenarios · Not a validated dispersion model</p>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-purple-300/80">
            <strong>Model disclaimer:</strong> This simulator uses a <em>simplified educational approximation</em>, not a validated Gaussian plume or advection-diffusion model.
            Results show illustrative directional trends only. Real atmospheric dispersion modelling requires validated emission inventories, meteorological profiles, boundary conditions, and evaluation against measured data.
            Do not use these outputs for environmental decision-making.
          </div>
        </div>
      </div>

      {/* Preset scenarios */}
      <div className="card">
        <div className="section-title mb-3">Preset Scenarios</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SCENARIOS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              className={`p-3 rounded-xl border text-xs font-medium transition-all text-center ${
                scenario.id === p.id
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                  : 'border-navy-600 bg-navy-900 text-slate-400 hover:text-slate-200 hover:border-navy-500'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="card space-y-4">
          <div className="section-title">Simulation Controls</div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Wind Speed: {scenario.windSpeed} km/h</label>
              <input type="range" min={0.5} max={25} step={0.5}
                value={scenario.windSpeed}
                onChange={e => setScenario(s => ({ ...s, windSpeed: Number(e.target.value), id: 'custom', name: 'Custom' }))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Wind Direction</label>
              <select
                value={scenario.windDir}
                onChange={e => setScenario(s => ({ ...s, windDir: e.target.value, id: 'custom', name: 'Custom' }))}
                className="select-field w-full text-xs"
              >
                {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Temperature: {scenario.temp}°C</label>
              <input type="range" min={5} max={45} value={scenario.temp}
                onChange={e => setScenario(s => ({ ...s, temp: Number(e.target.value), id: 'custom', name: 'Custom' }))}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Humidity: {scenario.humidity}%</label>
              <input type="range" min={10} max={100} value={scenario.humidity}
                onChange={e => setScenario(s => ({ ...s, humidity: Number(e.target.value), id: 'custom', name: 'Custom' }))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Rainfall</label>
              <select
                value={scenario.rainfall}
                onChange={e => setScenario(s => ({ ...s, rainfall: e.target.value as any, id: 'custom', name: 'Custom' }))}
                className="select-field w-full text-xs"
              >
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Traffic Activity</label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setScenario(s => ({ ...s, traffic: t, id: 'custom', name: 'Custom' }))}
                    className={`flex-1 py-1.5 rounded text-xs font-medium border transition-all ${
                      scenario.traffic === t
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-navy-600 bg-navy-900 text-slate-500'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Industrial Emissions: {scenario.industrial}%</label>
              <input type="range" min={0} max={100} value={scenario.industrial}
                onChange={e => setScenario(s => ({ ...s, industrial: Number(e.target.value), id: 'custom', name: 'Custom' }))}
                className="w-full accent-gray-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Festival Emissions (firecrackers etc.): {scenario.festival}%</label>
              <input type="range" min={0} max={100} value={scenario.festival}
                onChange={e => setScenario(s => ({ ...s, festival: Number(e.target.value), id: 'custom', name: 'Custom' }))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleRun} disabled={running} className="btn-primary flex-1">
              <Play size={14} className={running ? 'animate-spin' : ''} />
              {running ? 'Simulating...' : 'Run Simulation'}
            </button>
            <button onClick={() => { setScenario({ ...PRESET_SCENARIOS[0] }); setResults(null); }} className="btn-secondary">
              <RotateCcw size={14} />
              Reset
            </button>
            {results && (
              <button onClick={handleSave} className="btn-secondary" title="Save for comparison">
                <BookmarkPlus size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <div className="section-title">Simulation Results</div>
          {!results && !running && (
            <div className="text-center py-16 text-slate-500">
              <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Adjust parameters and click <strong>Run Simulation</strong></p>
            </div>
          )}
          {running && (
            <div className="text-center py-16 text-slate-400">
              <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Running educational simulation...</p>
            </div>
          )}
          {results && !running && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'PM2.5', value: results.pm25, unit: 'µg/m³', color: '#ef4444' },
                  { label: 'PM10', value: results.pm10, unit: 'µg/m³', color: '#f97316' },
                  { label: 'AQI', value: results.aqi, unit: '', color: results.aqi > 200 ? '#a855f7' : results.aqi > 150 ? '#ef4444' : '#f97316' },
                ].map(m => (
                  <div key={m.label} className="bg-navy-900 rounded-xl p-4 text-center">
                    <div className="text-xs text-slate-500">{m.label}</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs text-slate-600">{m.unit}</div>
                    <div className="text-xs text-purple-400 mt-1">SIMULATED</div>
                  </div>
                ))}
              </div>

              <div className="bg-navy-900 rounded-xl p-4 text-xs leading-relaxed">
                <div className="font-semibold text-slate-300 mb-2">Scenario: {scenario.name}</div>
                <div className="text-slate-500 space-y-1">
                  <div>Wind {scenario.windDir} at {scenario.windSpeed} km/h → {scenario.windSpeed < 5 ? '⚠️ Low dispersal' : '✓ Moderate dispersal'}</div>
                  <div>Rainfall: {scenario.rainfall} → {scenario.rainfall !== 'none' ? '✓ Wet scavenging reduces PM' : '— No washout effect'}</div>
                  <div>Traffic: {scenario.traffic} · Industrial: {scenario.industrial}% · Festival: {scenario.festival}%</div>
                </div>
                <div className="mt-2 text-purple-400/80">
                  ⚗️ EDUCATIONAL SIMULATION — factors applied multiplicatively to educational base value.
                  Not a validated physical dispersion model.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scenario comparison */}
      {savedScenarios.length >= 2 && (
        <div className="card">
          <div className="section-title">
            <GitCompare size={16} className="text-cyan-400" />
            Scenario Comparison
            <span className="badge badge-simulated ml-auto">EDUCATIONAL</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="pm25" fill="#ef4444" name="PM2.5" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="pm10" fill="#f97316" name="PM10" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="aqi" fill="#a855f7" name="AQI" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

