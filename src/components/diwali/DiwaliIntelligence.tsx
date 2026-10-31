import { useState, useEffect, useRef } from 'react';
import { Sparkles, Info, AlertTriangle, Wind, Droplets, Thermometer, ArrowUp, ArrowDown, MapPin, Radio, Flame, ShieldAlert, Layers, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { DIWALI_DATA, SENSORS, getAQICategory } from '../../data/demoData';

declare const L: any;

const POLLUTANTS = ['pm25', 'pm10', 'aqi'] as const;
type Pollutant = typeof POLLUTANTS[number];

const POLLUTANT_LABELS: Record<Pollutant, string> = { pm25: 'PM2.5 (µg/m³)', pm10: 'PM10 (µg/m³)', aqi: 'AQI' };
const POLLUTANT_COLORS: Record<Pollutant, string> = { pm25: '#ef4444', pm10: '#f97316', aqi: '#a855f7' };

function PctChange({ before, during }: { before: number; during: number }) {
  const pct = Math.round(((during - before) / before) * 100);
  const isUp = pct > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
      {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      +{Math.abs(pct)}%
    </span>
  );
}

// Regional Smog Classification Dataset for Diwali Map
const DIWALI_SMOG_ZONES = [
  {
    id: 'narela',
    name: 'Narela & North Fringe',
    lat: 28.8549, lng: 77.0934,
    sensorId: 'S004',
    baselinePM25: 145,
    diwaliNightPM25: 356,
    smogQuantity: '356 µg/m³ (Extremely Dense)',
    smogCategory: 'Severe Smog' as const,
    smogRadius: 3200,
    color: '#9f1239',
    changePct: '+145%',
    windInfluence: 'Stagnant (2.2 km/h) — Extreme entrapment of firecracker emissions and regional stubble smoke',
  },
  {
    id: 'rkpuram',
    name: 'RK Puram & South West',
    lat: 28.5685, lng: 77.1800,
    sensorId: 'S002',
    baselinePM25: 98,
    diwaliNightPM25: 287,
    smogQuantity: '287 µg/m³ (Heavy Accumulation)',
    smogCategory: 'Heavy Smog' as const,
    smogRadius: 2600,
    color: '#ef4444',
    changePct: '+193%',
    windInfluence: 'Low dispersion (3.1 km/h) — Severe localized residential bursting',
  },
  {
    id: 'cp',
    name: 'Connaught Place & Central',
    lat: 28.6315, lng: 77.2167,
    sensorId: 'S001',
    baselinePM25: 112,
    diwaliNightPM25: 245,
    smogQuantity: '245 µg/m³ (Heavy Smoke Haze)',
    smogCategory: 'Heavy Smog' as const,
    smogRadius: 2400,
    color: '#ef4444',
    changePct: '+119%',
    windInfluence: 'Downwind funneling from northwest corridor (2.8 km/h)',
  },
  {
    id: 'lajpat',
    name: 'Lajpat Nagar & South East',
    lat: 28.5693, lng: 77.2433,
    sensorId: 'S006',
    baselinePM25: 104,
    diwaliNightPM25: 232,
    smogQuantity: '232 µg/m³ (Substantial Smog)',
    smogCategory: 'Heavy Smog' as const,
    smogRadius: 2100,
    color: '#f97316',
    changePct: '+123%',
    windInfluence: 'Downwind accumulation corridor',
  },
  {
    id: 'dwarka',
    name: 'Dwarka Sub-City',
    lat: 28.5921, lng: 77.0460,
    sensorId: 'S003',
    baselinePM25: 65,
    diwaliNightPM25: 178,
    smogQuantity: '178 µg/m³ (Moderate Smog Plume)',
    smogCategory: 'Moderate Smog' as const,
    smogRadius: 1800,
    color: '#f59e0b',
    changePct: '+174%',
    windInfluence: 'Open terrain provided slightly better mixing (4.2 km/h)',
  },
  {
    id: 'noida',
    name: 'Noida Sec 62 Industrial Belt',
    lat: 28.6239, lng: 77.3647,
    sensorId: 'S007',
    baselinePM25: 118,
    diwaliNightPM25: 254,
    smogQuantity: '254 µg/m³ (Heavy Smog)',
    smogCategory: 'Heavy Smog' as const,
    smogRadius: 2300,
    color: '#ef4444',
    changePct: '+115%',
    windInfluence: 'Boundary layer collapse + celebratory emissions',
  },
  {
    id: 'gurgaon',
    name: 'Gurgaon Cyber City Corridor',
    lat: 28.4941, lng: 77.0884,
    sensorId: 'S008',
    baselinePM25: 54,
    diwaliNightPM25: 142,
    smogQuantity: '142 µg/m³ (Moderate Smog)',
    smogCategory: 'Moderate Smog' as const,
    smogRadius: 1500,
    color: '#f59e0b',
    changePct: '+163%',
    windInfluence: 'Elevated wind (4.8 km/h) reduced peak accumulation',
  },
];

export default function DiwaliIntelligence() {
  const [year, setYear] = useState(2024);
  const [neighborhood, setNeighborhood] = useState('RK Puram');
  const [pollutant, setPollutant] = useState<Pollutant>('pm25');
  const [selectedSmogZone, setSelectedSmogZone] = useState<any>(DIWALI_SMOG_ZONES[0]);
  const [smogFilter, setSmogFilter] = useState<'all' | 'Severe Smog' | 'Heavy Smog' | 'Moderate Smog'>('all');

  const [firecrackerActivity, setFirecrackerActivity] = useState<'low' | 'medium' | 'high' | 'extreme'>('high');
  const [windSpeed, setWindSpeed] = useState(2.8);
  const [plumeActive, setPlumeActive] = useState(true);

  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const smogLayerRef = useRef<any[]>([]);

  const data = DIWALI_DATA.readings[year]?.[neighborhood];
  const availableYears = Object.keys(DIWALI_DATA.readings).map(Number).filter(y => DIWALI_DATA.readings[y]?.[neighborhood]);

  const comparisonData = data ? [
    { period: 'Before Diwali', value: data.before[pollutant], samples: data.before.samples, window: DIWALI_DATA.periods.before.window },
    { period: 'Diwali Night', value: data.during[pollutant], samples: data.during.samples, window: DIWALI_DATA.periods.during.window },
    { period: 'After Diwali', value: data.after[pollutant], samples: data.after.samples, window: DIWALI_DATA.periods.after.window },
  ] : [];

  const multiYearData = availableYears.map(y => ({
    year: y,
    before: DIWALI_DATA.readings[y]?.[neighborhood]?.before?.[pollutant] ?? 0,
    during: DIWALI_DATA.readings[y]?.[neighborhood]?.during?.[pollutant] ?? 0,
    after: DIWALI_DATA.readings[y]?.[neighborhood]?.after?.[pollutant] ?? 0,
  }));

  // Firecracker simulation calculation
  const activityFactors = { low: 1.25, medium: 1.75, high: 2.3, extreme: 3.1 };
  const windDispersionFactor = Math.max(0.35, 1 - (windSpeed - 1.5) * 0.08);
  const simulatedPeak = data ? Math.round(data.before[pollutant] * activityFactors[firecrackerActivity] * windDispersionFactor) : 0;

  // Initialize Leaflet Map for Diwali Smog Geographic Distribution
  useEffect(() => {
    if (!mapRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    try {
      if (typeof L !== 'undefined') {
        const map = L.map(mapRef.current, {
          center: [28.66, 77.18],
          zoom: 11,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;

        renderSmogLayers(map);
      }
    } catch (err) {
      console.error('Diwali Map Leaflet error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    renderSmogLayers(mapInstanceRef.current);
  }, [smogFilter, plumeActive]);

  function renderSmogLayers(map: any) {
    smogLayerRef.current.forEach(l => l.remove());
    smogLayerRef.current = [];

    const filteredZones = DIWALI_SMOG_ZONES.filter(z => {
      if (smogFilter === 'all') return true;
      return z.smogCategory === smogFilter;
    });

    filteredZones.forEach(zone => {
      const isSevere = zone.smogCategory === 'Severe Smog';
      const isHeavy = zone.smogCategory === 'Heavy Smog';

      // Smog plume contour ring
      const smogCircle = L.circle([zone.lat, zone.lng], {
        radius: zone.smogRadius,
        fillColor: zone.color,
        fillOpacity: isSevere ? 0.35 : isHeavy ? 0.25 : 0.15,
        color: zone.color,
        weight: isSevere ? 2.5 : 1.5,
        opacity: 0.8,
        dashArray: isSevere ? '6 4' : undefined,
        className: plumeActive ? 'pollution-wave' : undefined,
      }).addTo(map);

      smogCircle.bindTooltip(`
        <div style="font-family:Inter,sans-serif; padding:5px;">
          <div style="font-weight:800; color:${zone.color}; font-size:12px;">
            ${zone.smogCategory.toUpperCase()} [${zone.changePct}]
          </div>
          <div style="font-weight:700; color:#fff; font-size:13px; margin-top:2px;">${zone.name}</div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:3px;">
            Smog Quantity: <strong style="color:${zone.color};">${zone.smogQuantity}</strong><br/>
            Baseline: ${zone.baselinePM25} µg/m³ → Diwali Peak: ${zone.diwaliNightPM25} µg/m³<br/>
            Sensor Node: <strong>${zone.sensorId}</strong>
          </div>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });

      smogLayerRef.current.push(smogCircle);

      // Blinking beacon on Severe & Heavy Smog zones
      const beaconIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative; width:44px; height:44px;">
            ${isSevere ? `
              <div class="critical-sonar" style="
                position:absolute; inset:0; border-radius:50%;
                background:rgba(159, 18, 57, 0.5);
                border:2px solid #9f1239;
              "></div>
            ` : ''}
            <div class="${isSevere ? 'critical-blink' : 'moderate-blink'}" style="
              position:absolute; top:10px; left:10px;
              width:24px; height:24px; border-radius:50%;
              background:${zone.color}; border:2px solid #ffffff;
              display:flex; align-items:center; justify-content:center;
              color:#fff; font-weight:800; font-size:11px;
              box-shadow:0 0 14px ${zone.color};
            ">
              🎆
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const beaconMarker = L.marker([zone.lat, zone.lng], { icon: beaconIcon }).addTo(map);
      beaconMarker.on('click', () => setSelectedSmogZone(zone));
      smogLayerRef.current.push(beaconMarker);
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hud-panel p-5 flex items-center justify-between flex-wrap gap-4 border-orange-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
            <h1 className="text-2xl font-black text-white tracking-wide">
              Diwali Smog Geographic Intelligence & Sensor Analytics
            </h1>
            <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-mono">
              ATMOSPHERIC INVENTORY
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Spatial smog classification map · Sensor-linked quantities · Pre/During/Post event comparative analytics
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-navy-950/80 px-3 py-1.5 rounded-xl border border-navy-700">
            <span className="text-xs text-slate-400 font-medium">Event Year:</span>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer">
              {DIWALI_DATA.years.map(y => <option key={y} value={y} className="bg-navy-900">{y}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-navy-950/80 px-3 py-1.5 rounded-xl border border-navy-700">
            <span className="text-xs text-slate-400 font-medium">Neighborhood:</span>
            <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer">
              {DIWALI_DATA.neighborhoods.map(n => <option key={n} value={n} className="bg-navy-900">{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Mandatory Scientific Integrity Disclaimer */}
      <div className="hud-panel p-4 border-amber-500/40 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Scientific Integrity & Attribution Standard:</strong> Optical and BAM particulate sensors measure total mass concentration, not particle origin.
            Spikes observed during Diwali night represent <em>temporal associations</em>. Without chemical speciation and certified source-apportionment receptor models, total PM2.5 cannot be definitively attributed to fireworks alone; vehicular exhaust, regional stubble burning, industrial emissions, and temperature inversions play significant concurrent roles.
            Smog simulation overlays are labelled strictly as <strong>EDUCATIONAL / HYPOTHETICAL</strong>.
          </div>
        </div>
      </div>

      {/* NEW: INTERACTIVE DIWALI SMOG GEOGRAPHIC DISTRIBUTION MAP */}
      <div className="hud-panel p-5 space-y-4 border-cyan-500/30">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-navy-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">
              Diwali Night Firecracker Smog Intensity Map (Classified by IoT Sensor Nodes)
            </h2>
          </div>

          {/* Filter by Smog Intensity Category */}
          <div className="flex items-center gap-1.5 bg-navy-950/80 p-1 rounded-xl border border-navy-700">
            {[
              { id: 'all', label: 'All Regions (7)' },
              { id: 'Severe Smog', label: '🟣 Severe (&gt;300)' },
              { id: 'Heavy Smog', label: '🔴 Heavy (200-300)' },
              { id: 'Moderate Smog', label: '🟠 Moderate (&lt;200)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSmogFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  smogFilter === f.id
                    ? 'bg-navy-800 text-white shadow-md border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map canvas */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-navy-700" style={{ height: '440px' }}>
            <div ref={mapRef} className="w-full h-full" style={{ height: '440px' }} />

            {/* In-map floating badge */}
            <div className="absolute top-3 left-3 z-10 hud-panel p-2.5 text-[11px] space-y-1 shadow-xl">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles size={12} className="text-orange-400" />
                Smog Quantity Classification
              </div>
              <div className="text-[#9f1239] font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9f1239] critical-blink" />
                Severe Smog (&gt;300 µg/m³ PM2.5)
              </div>
              <div className="text-red-400 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Heavy Smog (200–300 µg/m³)
              </div>
              <div className="text-yellow-400 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                Moderate Smog (100–200 µg/m³)
              </div>
            </div>
          </div>

          {/* Selected Smog Area Inspector */}
          <div className="hud-panel p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-navy-700/60 pb-2 mb-3">
                <div>
                  <span className="text-[10px] text-orange-400 font-mono tracking-wider">SMOG MONITORING SECTOR</span>
                  <h3 className="font-bold text-white text-base leading-tight">{selectedSmogZone.name}</h3>
                </div>
                <span className={`badge ${
                  selectedSmogZone.smogCategory === 'Severe Smog'
                    ? 'bg-red-900/40 text-red-300 border border-red-500/50 critical-blink'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {selectedSmogZone.smogCategory.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                  <div className="text-slate-400 text-[11px]">Diwali Night Smog Density</div>
                  <div className="text-2xl font-black mt-1 font-mono text-red-400">
                    {selectedSmogZone.diwaliNightPM25} <span className="text-xs font-normal text-slate-400">µg/m³ PM2.5</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 font-medium">
                    Quantity: {selectedSmogZone.smogQuantity}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-navy-800/40">
                    <span className="text-slate-400">Reporting Node:</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedSmogZone.sensorId} (IoT Online)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-navy-800/40">
                    <span className="text-slate-400">Baseline Level (Pre-Diwali):</span>
                    <span className="font-mono text-slate-300">{selectedSmogZone.baselinePM25} µg/m³</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-navy-800/40">
                    <span className="text-slate-400">Diwali Surge Magnitude:</span>
                    <span className="font-mono text-red-400 font-bold">{selectedSmogZone.changePct} surge</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-navy-800/40">
                    <span className="text-slate-400">Effective Smog Radius:</span>
                    <span className="font-mono text-slate-300">~{(selectedSmogZone.smogRadius / 1000).toFixed(1)} km</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-navy-950/80 border border-navy-800 text-[11px] text-slate-400 leading-tight mt-2">
                  <span className="text-cyan-400 font-semibold">Meteorological Context: </span>
                  {selectedSmogZone.windInfluence}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-500 italic">
              Data classified based on continuous 48-sample hourly telemetry during Diwali event window.
            </div>
          </div>
        </div>
      </div>

      {/* Pre/During/Post Comparative KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonData.map((item, i) => {
            const isDuring = item.period === 'Diwali Night';
            const prev = i > 0 ? comparisonData[i - 1].value : null;
            return (
              <div
                key={item.period}
                className={`hud-panel p-5 ${
                  isDuring ? 'border-2 border-orange-500/50 glow-red' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-white">{item.period}</div>
                    <div className="text-xs text-slate-500">{item.window} · {item.samples} samples</div>
                  </div>
                  {isDuring ? (
                    <span className="badge bg-red-500/20 text-red-400 border border-red-500/40 critical-blink">
                      PEAK EVENT
                    </span>
                  ) : null}
                  {prev !== null && <PctChange before={prev} during={item.value} />}
                </div>

                <div className="text-3xl font-black font-mono" style={{ color: POLLUTANT_COLORS[pollutant] }}>
                  {item.value}
                </div>
                <div className="text-xs text-slate-400 mt-1">{POLLUTANT_LABELS[pollutant]}</div>
                <div className="mt-3 pt-2 border-t border-navy-800 text-[11px] text-slate-500">
                  Aggregation: Average over {item.samples} hourly samples
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar comparison */}
        <div className="hud-panel p-5">
          <div className="section-title text-sm mb-3">
            <Sparkles size={16} className="text-orange-400" />
            3-Phase Comparison — {neighborhood} ({year})
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" fill={POLLUTANT_COLORS[pollutant]} radius={[4, 4, 0, 0]} name={POLLUTANT_LABELS[pollutant]} fillOpacity={0.88} />
              {pollutant === 'pm25' && <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'NAAQS Standard (60)', fill: '#22c55e', fontSize: 10 }} />}
              {pollutant === 'pm25' && <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Unhealthy (150)', fill: '#ef4444', fontSize: 10 }} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-year comparison */}
        <div className="hud-panel p-5">
          <div className="section-title text-sm mb-3">
            <TrendingUp size={16} className="text-cyan-400" />
            Multi-Year Historical Trend ({neighborhood})
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={multiYearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <Bar dataKey="before" fill="#22c55e" name="Before Diwali" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="during" fill="#ef4444" name="Diwali Night" fillOpacity={0.88} radius={[2, 2, 0, 0]} />
              <Bar dataKey="after" fill="#f97316" name="Post Diwali" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Scenario Lab / Firecracker Plume Modeler */}
      <div className="hud-panel p-5 space-y-4 border-orange-500/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-orange-400" />
            <h2 className="text-base font-bold text-white">
              Hypothetical Emission & Plume Dispersion Scenario Laboratory
            </h2>
            <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px]">
              EDUCATIONAL / HYPOTHETICAL
            </span>
          </div>

          <button
            onClick={() => setPlumeActive(!plumeActive)}
            className="btn-secondary text-xs"
          >
            {plumeActive ? 'Pause Animation' : 'Resume Animation'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Celebratory Emission Intensity</label>
            <div className="flex gap-1">
              {(['low', 'medium', 'high', 'extreme'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFirecrackerActivity(lvl)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    firecrackerActivity === lvl
                      ? 'bg-orange-500 text-navy-950 font-bold shadow-md'
                      : 'bg-navy-900 border border-navy-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-slate-700 font-bold mb-1.5">
              <span>Night Wind Velocity Telemetry:</span>
              <span className="font-mono text-cyan-700 font-bold">{windSpeed} km/h</span>
            </div>
            {/* Live Presets instead of range slider */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Stagnant', v: 1.5 },
                { label: 'Calm', v: 3.5 },
                { label: 'Moderate', v: 7.0 },
                { label: 'Cleansing', v: 12.0 },
              ].map(w => (
                <button
                  key={w.label}
                  onClick={() => setWindSpeed(w.v)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all border text-center ${
                    windSpeed === w.v
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 font-bold shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {w.label} ({w.v})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Atmospheric Inversion Level</label>
            <select className="select-field text-xs w-full">
              <option>Shallow Mixing Layer (Winter Inversion)</option>
              <option>Moderate Boundary Layer</option>
            </select>
          </div>

          <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-800 text-center">
            <div className="text-[11px] text-slate-400">Hypothetical Modeled Peak</div>
            <div className="text-2xl font-black font-mono text-red-400 mt-0.5">
              {simulatedPeak} <span className="text-xs font-normal text-slate-400">µg/m³</span>
            </div>
            <div className="text-[10px] text-slate-500">SIMULATED SCENARIO</div>
          </div>
        </div>
      </div>
    </div>
  );
}
