import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Info, AlertTriangle, Wind, Droplets, Thermometer, ArrowUp, ArrowDown,
  MapPin, Radio, Flame, ShieldAlert, Layers, TrendingUp, Mic, Zap, CheckCircle2, Cpu
} from 'lucide-react';
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

// Unique Chemical Speciation & Acoustic Shockwave Fingerprint Dataset
const PYRO_WARD_DATA = {
  anand_vihar: {
    id: 'anand_vihar',
    name: 'Anand Vihar Ward (East Delhi)',
    barium: 840,
    strontium: 610,
    potassium: 1280,
    sulfur: 460,
    carbonMonoxide: 6,
    decibels: 96.4,
    confidence: 98.7,
    status: 'ACTIVE PYROTECHNIC EXPLOSION BURST',
    alertType: 'danger',
    distanceToSensor: '180m from Optical Sensor S008',
    verdict: 'Confirmed Firecracker Combustion (Heavy Barium green oxidizer surge + 96.4 dB acoustic shockwave)',
  },
  narela: {
    id: 'narela',
    name: 'Narela Ward Fringe (North Delhi)',
    barium: 920,
    strontium: 720,
    potassium: 1410,
    sulfur: 520,
    carbonMonoxide: 8,
    decibels: 101.2,
    confidence: 99.2,
    status: 'HIGH-ALTITUDE SKYSHOT PYROTECHNICS',
    alertType: 'danger',
    distanceToSensor: '240m from Node S004',
    verdict: 'Violent high-altitude fireworks burst (Strontium red flash + multi-shot potassium blast sequence)',
  },
  cp: {
    id: 'cp',
    name: 'Connaught Place Central Ward',
    barium: 15,
    strontium: 10,
    potassium: 35,
    sulfur: 22,
    carbonMonoxide: 42,
    decibels: 68.2,
    confidence: 14.5,
    status: 'NORMAL TRAFFIC COMBUSTION (NO FIRECRACKERS)',
    alertType: 'success',
    distanceToSensor: 'Central Inner Circle Station S001',
    verdict: 'Normal vehicular combustion. High CO with baseline Barium confirms non-pyrotechnic origin.',
  },
  dwarka: {
    id: 'dwarka',
    name: 'Dwarka Sector 10 Ward',
    barium: 410,
    strontium: 320,
    potassium: 620,
    sulfur: 240,
    carbonMonoxide: 14,
    decibels: 86.5,
    confidence: 89.2,
    status: 'MODERATE GROUND CRACKER SPIKE',
    alertType: 'warning',
    distanceToSensor: '380m from Node S003',
    verdict: 'Ground-level firecracker chain. Moderate barium flare-up with localized micro-pulse.',
  },
};

export default function DiwaliIntelligence() {
  const [year, setYear] = useState(2024);
  const [neighborhood, setNeighborhood] = useState('RK Puram');
  const [pollutant, setPollutant] = useState<Pollutant>('pm25');
  const [selectedSmogZone, setSelectedSmogZone] = useState<any>(DIWALI_SMOG_ZONES[0]);
  const [smogFilter, setSmogFilter] = useState<'all' | 'Severe Smog' | 'Heavy Smog' | 'Moderate Smog'>('all');

  const [firecrackerActivity, setFirecrackerActivity] = useState<'low' | 'medium' | 'high' | 'extreme'>('high');
  const [windSpeed, setWindSpeed] = useState(2.8);
  const [plumeActive, setPlumeActive] = useState(true);

  // New Unique Pyrotechnic Detector State
  const [activeWardKey, setActiveWardKey] = useState<'anand_vihar' | 'narela' | 'cp' | 'dwarka'>('anand_vihar');
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [burstCount, setBurstCount] = useState<number>(4);
  const [recentIncidents, setRecentIncidents] = useState<Array<{ id: string; time: string; ward: string; db: number; verdict: string }>>([
    { id: 'inc-1', time: '22:42:10', ward: 'Anand Vihar Ward', db: 96.4, verdict: 'Aerial Skyshot Burst' },
    { id: 'inc-2', time: '22:38:05', ward: 'Narela Fringe', db: 101.2, verdict: 'Heavy Firecracker Chain' },
    { id: 'inc-3', time: '22:29:44', ward: 'Dwarka Sec 10', db: 86.5, verdict: 'Ground Cracker Pulse' },
  ]);

  const activeWard = PYRO_WARD_DATA[activeWardKey];

  // Synthesize realistic acoustic shockwave sound using Web Audio API
  const playShockwaveSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Low sub-bass explosion thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.45);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context error or autoplay policy
    }
  };

  const handleSimulateBurst = () => {
    setIsPulsing(true);
    playShockwaveSound();
    setBurstCount(c => c + 1);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newIncident = {
      id: `inc-${Date.now()}`,
      time: timeStr,
      ward: activeWard.name.split(' (')[0],
      db: Number((activeWard.decibels + (Math.random() * 8 + 6)).toFixed(1)),
      verdict: activeWard.alertType === 'danger' ? 'Illegal Skyshot Combustion Detected' : 'Transient Noise Pulse Detected',
    };
    setRecentIncidents(prev => [newIncident, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setIsPulsing(false);
    }, 2800);
  };

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

      {/* UNIQUE DETECTOR: AI Pyrotechnic Chemical Speciation & Acoustic Burst Detector */}
      <div className="hud-panel p-6 border-2 border-amber-500/40 relative overflow-hidden bg-gradient-to-br from-navy-900/90 via-navy-950 to-navy-900">
        {/* Glow ambient background effect */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isPulsing ? 'bg-red-500/40 scale-150 animate-pulse' : 'bg-amber-500/10'
        }`} />

        <div className="relative z-10">
          {/* Active Burst Alarm Banner */}
          {isPulsing && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-600/30 border-2 border-red-500 text-white flex items-center justify-between animate-pulse shadow-xl shadow-red-900/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">💥</span>
                <div>
                  <div className="text-xs font-black tracking-wide text-red-200 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                    LIVE SHOCKWAVE PULSE DETECTED · MUNICIPAL AUDIT LOGGED
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {(activeWard.decibels + 11.4).toFixed(1)} dB SPL Acoustic Spike at {activeWard.name.split(' (')[0]} · Barium Surge +{activeWard.barium + 640}% Registered!
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-red-600 font-mono text-xs font-black text-white uppercase tracking-wider">
                ACTIVE BURST
              </span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-navy-700">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  Proprietary AI Feature · Spectral Source Apportionment
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Dual-Modality IoT
                </span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Pyrotechnic Chemical Speciation & Acoustic Burst Detector
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Optical sensors merely count generic PM particles without knowing their origin. This unique detector differentiates illegal fireworks from traffic/crop burning by fingerprinting heavy metals (<strong className="text-white">Barium</strong> &amp; <strong className="text-white">Strontium</strong>) cross-verified with hyper-localized <strong className="text-white">acoustic microphone shockwaves (&gt;85 dB)</strong>.
              </p>
            </div>

            {/* Live Burst Trigger / Counter */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Recorded Bursts</div>
                <div className={`text-xl font-black font-mono transition-all ${isPulsing ? 'text-red-400 scale-110' : 'text-amber-400'}`}>
                  {burstCount} Events
                </div>
              </div>
              <button
                onClick={handleSimulateBurst}
                disabled={isPulsing}
                className={`px-5 py-3 rounded-xl font-bold text-xs text-white shadow-lg border flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
                  isPulsing
                    ? 'bg-red-600 border-red-300 animate-pulse shadow-red-500/50'
                    : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-red-900/40 border-amber-400/30'
                }`}
              >
                <Zap className={`w-4 h-4 ${isPulsing ? 'animate-spin text-yellow-200' : 'text-yellow-300'}`} />
                {isPulsing ? '⚡ Recording Shockwave (+104.8 dB)...' : '💥 Trigger Burst Simulation'}
              </button>
            </div>
          </div>

          {/* Ward Selector Pills */}
          <div className="pt-4 pb-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Select Monitored Ward Node:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(PYRO_WARD_DATA) as Array<keyof typeof PYRO_WARD_DATA>).map((key) => {
                const ward = PYRO_WARD_DATA[key];
                const isActive = activeWardKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveWardKey(key)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-navy-800 border-amber-400 shadow-md shadow-amber-500/10'
                        : 'bg-navy-950/60 border-navy-700/60 hover:bg-navy-800/60 hover:border-navy-600 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white truncate">{ward.name.split(' (')[0]}</div>
                    <div className="text-[10px] mt-0.5 flex items-center justify-between">
                      <span className={ward.alertType === 'danger' ? 'text-red-400 font-semibold' : ward.alertType === 'warning' ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                        {ward.alertType === 'danger' ? 'High Pyro' : ward.alertType === 'warning' ? 'Moderate' : 'Clean / Traffic'}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">{ward.decibels} dB</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Node Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
            {/* Left Column: Chemical Speciation Tracers (8 cols) */}
            <div className="lg:col-span-8 bg-navy-950/70 p-4 rounded-2xl border border-navy-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Chemical Tracer Speciation (XRF Spectroscopy)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300">
                  {activeWard.distanceToSensor}
                </span>
              </div>

              <div className="space-y-3">
                {/* Barium */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${isPulsing ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
                      Barium (Ba) <span className="text-[10px] text-slate-400">(Green Flame Oxidizer)</span>
                    </span>
                    <span className={`font-mono font-bold transition-all ${isPulsing ? 'text-red-400 text-sm font-black' : 'text-emerald-300'}`}>
                      +{isPulsing ? activeWard.barium + 640 : activeWard.barium}% surge {isPulsing && '⚡ SPIKING'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPulsing
                          ? 'bg-gradient-to-r from-red-500 to-amber-300 animate-pulse'
                          : 'bg-gradient-to-r from-emerald-500 to-green-300'
                      }`}
                      style={{ width: `${Math.min(100, ((isPulsing ? activeWard.barium + 640 : activeWard.barium) / 1600) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Strontium */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${isPulsing ? 'bg-red-400 animate-ping' : 'bg-red-400'}`} />
                      Strontium (Sr) <span className="text-[10px] text-slate-400">(Red Pyrotechnic Spark)</span>
                    </span>
                    <span className={`font-mono font-bold transition-all ${isPulsing ? 'text-red-400 text-sm font-black' : 'text-red-400'}`}>
                      +{isPulsing ? activeWard.strontium + 420 : activeWard.strontium}% surge {isPulsing && '⚡'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, ((isPulsing ? activeWard.strontium + 420 : activeWard.strontium) / 1400) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Potassium */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Potassium Nitrate (KNO₃) <span className="text-[10px] text-slate-400">(Black Powder Propellant)</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">+{activeWard.potassium}% surge</span>
                  </div>
                  <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (activeWard.potassium / 1500) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbon Monoxide Traffic Baseline */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                      Carbon Monoxide (CO) <span className="text-[10px] text-slate-400">(Traffic Exhaust Baseline - Control)</span>
                    </span>
                    <span className="font-mono font-bold text-cyan-300">+{activeWard.carbonMonoxide}% shift</span>
                  </div>
                  <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (activeWard.carbonMonoxide / 100) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    *Flat CO indicates emission is from rapid deflagration (firecrackers), not vehicular internal combustion engines.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Acoustic Shockwave & Verdict (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-3">
              {/* Acoustic Decibel Meter */}
              <div className={`p-4 rounded-2xl border transition-all flex-1 ${
                isPulsing
                  ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/40'
                  : 'bg-navy-950/70 border-navy-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Mic className={`w-4 h-4 ${isPulsing ? 'text-red-400 animate-bounce' : 'text-pink-400'}`} />
                    Acoustic Shockwave
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isPulsing || activeWard.decibels > 90 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isPulsing ? '💥 PEAK SHOCKWAVE' : activeWard.decibels > 90 ? 'BLAST LEVEL' : 'AMBIENT'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-black font-mono transition-all ${
                    isPulsing
                      ? 'text-red-400 scale-110 font-black'
                      : activeWard.decibels > 90
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}>
                    {isPulsing ? (activeWard.decibels + 11.4).toFixed(1) : activeWard.decibels}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">dB SPL Peak</span>
                </div>

                {/* Animated Soundwave Visualizer */}
                <div className="flex items-end gap-1.5 h-8 mt-3 pt-1 border-t border-navy-800">
                  {[40, 65, 95, 80, 100, 75, 90, 60, 45, 85, 95, 70, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isPulsing
                          ? 'bg-red-500 animate-pulse'
                          : activeWard.decibels > 90
                          ? 'bg-amber-400'
                          : 'bg-cyan-500/60'
                      }`}
                      style={{
                        height: isPulsing ? `${Math.min(100, h * 1.3)}%` : `${h * (activeWard.decibels / 100)}%`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI Attribution Verdict */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isPulsing
                  ? 'bg-red-950/70 border-red-500 ring-2 ring-red-500/40 animate-pulse'
                  : activeWard.alertType === 'danger'
                  ? 'bg-red-950/40 border-red-500/50'
                  : activeWard.alertType === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-emerald-950/40 border-emerald-500/50'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    AI Source Attribution
                  </span>
                  <span className="font-mono font-black text-xs text-cyan-300">
                    {isPulsing ? '99.8%' : activeWard.confidence + '%'} Confidence
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-white leading-snug">
                  {isPulsing ? '🚨 CONFIRMED HIGH-ALTITUDE SKYSHOT EXPLOSION' : activeWard.status}
                </div>
                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                  {isPulsing ? 'Immediate acoustic pressure rise + stoichiometric Ba/Sr surge confirms commercial firecracker burst.' : activeWard.verdict}
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Pyrotechnic Incident Audit Log */}
          <div className="mt-4 pt-4 border-t border-navy-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Live Incident Audit Log (Last {recentIncidents.length} Telemetry Events)
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Auto-Synced with Municipal Field Unit</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {recentIncidents.map(inc => (
                <div key={inc.id} className="p-2.5 rounded-xl bg-navy-950/80 border border-navy-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="text-red-400 font-mono">{inc.db} dB</span>
                      <span className="text-slate-300 truncate">{inc.ward}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{inc.verdict}</div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 ml-2">{inc.time}</span>
                </div>
              ))}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
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
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
              <span>Night Wind Velocity Telemetry:</span>
              <span className="font-mono text-cyan-400 font-bold">{windSpeed} km/h</span>
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
                      ? 'border-cyan-400 bg-cyan-500/20 text-white font-bold shadow-md shadow-cyan-500/10'
                      : 'border-navy-700 bg-navy-900 text-slate-400 hover:text-white'
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
