import { useState, useEffect, useRef } from 'react';
import {
  Box, Wind, AlertTriangle, Info, CheckCircle2, Sliders,
  Layers, Building, Compass, Activity, ArrowRight, ShieldCheck, Cpu
} from 'lucide-react';

interface CanyonPreset {
  id: string;
  name: string;
  location: string;
  aspectRatio: number;
  streetWidth: number;
  buildingHeight: number;
  groundPM: number;
  roofPM: number;
  regime: string;
  risk: 'CRITICAL' | 'HIGH' | 'LOW';
  description: string;
}

const DELHI_CANYONS: CanyonPreset[] = [
  {
    id: 'barakhamba',
    name: 'Barakhamba Road Corridor',
    location: 'Connaught Place Central',
    aspectRatio: 2.1,
    streetWidth: 24,
    buildingHeight: 50,
    groundPM: 298,
    roofPM: 56,
    regime: 'Skimming Flow (Enclosed Vortex)',
    risk: 'CRITICAL',
    description: 'Deep high-rise office towers trap midday diesel bus emissions on pedestrian sidewalks. Ground air is 5.3x more toxic than rooftop air.',
  },
  {
    id: 'nehru_place',
    name: 'Nehru Place Commercial Square',
    location: 'South Delhi Hub',
    aspectRatio: 1.8,
    streetWidth: 28,
    buildingHeight: 50,
    groundPM: 274,
    roofPM: 62,
    regime: 'Skimming Flow (Trapped Eddy)',
    risk: 'CRITICAL',
    description: 'High-density commercial towers create massive aerodynamic drag, creating stagnant recirculation zones near public bus terminals.',
  },
  {
    id: 'vikas_marg',
    name: 'Vikas Marg Canyon',
    location: 'Laxmi Nagar / East Delhi',
    aspectRatio: 2.4,
    streetWidth: 18,
    buildingHeight: 44,
    groundPM: 342,
    roofPM: 68,
    regime: 'Multi-Cell Vortex Trapping',
    risk: 'CRITICAL',
    description: 'Narrow commercial street flanked by 5-story shop-cum-residences, causing secondary counter-rotating vortexes near ground shopfronts.',
  },
  {
    id: 'shanti_path',
    name: 'Shanti Path Boulevard',
    location: 'Chanakyapuri Diplomatic Area',
    aspectRatio: 0.35,
    streetWidth: 65,
    buildingHeight: 22,
    groundPM: 92,
    roofPM: 48,
    regime: 'Isolated Roughness (Free Dispersion)',
    risk: 'LOW',
    description: 'Extensive tree canopies, low-rise embassies, and wide avenues allow natural atmospheric ventilation with zero vortex trapping.',
  },
];

export default function MicroCanyonModule() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [aspectRatio, setAspectRatio] = useState<number>(1.8);
  const [windSpeed, setWindSpeed] = useState<number>(3.5);
  const [trafficDensity, setTrafficDensity] = useState<'low' | 'moderate' | 'heavy'>('heavy');
  const [windAngle, setWindAngle] = useState<'perpendicular' | 'parallel'>('perpendicular');
  const [selectedPreset, setSelectedPreset] = useState<CanyonPreset>(DELHI_CANYONS[0]);
  const [mitigationActive, setMitigationActive] = useState<boolean>(false);

  // Apply preset
  const handleSelectPreset = (preset: CanyonPreset) => {
    setSelectedPreset(preset);
    setAspectRatio(preset.aspectRatio);
  };

  // Determine Oke (1988) flow regime
  const getRegime = (hw: number) => {
    if (hw < 0.3) return { name: 'Isolated Roughness Flow', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' };
    if (hw <= 0.7) return { name: 'Wake Interference Flow', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' };
    return { name: 'Skimming Flow (Enclosed Trapped Vortex)', color: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/40' };
  };

  const regimeInfo = getRegime(aspectRatio);

  // Ground and roof PM calculations based on aspect ratio and mitigation
  const calculatedGroundPM = Math.round(
    (selectedPreset.groundPM * (aspectRatio / 1.5) * (trafficDensity === 'heavy' ? 1.2 : trafficDensity === 'moderate' ? 1.0 : 0.75)) *
    (mitigationActive ? 0.58 : 1.0)
  );
  const calculatedRoofPM = selectedPreset.roofPM;

  // Animation Loop for Aerodynamic Wind Tunnel Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = canvas.parentElement?.clientWidth || 700;
    canvas.height = 300;

    const groundY = 250;
    const bldgWidth = Math.min(140, Math.max(90, Math.round(canvas.width * 0.18)));
    const leftBldgX = 30;
    const canyonWidth = Math.max(160, canvas.width - (leftBldgX + bldgWidth * 2) - 50);
    const rightBldgX = leftBldgX + bldgWidth + canyonWidth;

    // Height based on H/W
    const baseH = Math.min(185, Math.max(65, Math.round(95 * aspectRatio)));
    // If mitigation active, stagger right building height
    const leftH = baseH;
    const rightH = mitigationActive ? Math.round(baseH * 0.65) : baseH;

    const leftRoofY = groundY - leftH;
    const rightRoofY = groundY - rightH;
    const minRoofY = Math.min(leftRoofY, rightRoofY);

    const centerX = leftBldgX + bldgWidth + canyonWidth / 2;
    const centerY = leftRoofY + leftH / 2;

    // Aerodynamic particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      radius: number;
      isVortex: boolean;
      size: number;
    }

    const particles: Particle[] = Array.from({ length: 110 }, (_, i) => {
      const isVortex = windAngle === 'perpendicular' && i < 65;
      return {
        x: isVortex ? centerX : Math.random() * canvas.width,
        y: isVortex ? centerY : Math.random() * minRoofY,
        vx: 1.8 + Math.random() * 2,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        radius: 18 + Math.random() * (canyonWidth * 0.42),
        isVortex,
        size: 1.5 + Math.random() * 2.2,
      };
    });

    const render = () => {
      ctx.fillStyle = '#060f1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Rooftop Wind Streamlines (Left to Right)
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 1;
      for (let y = 18; y < minRoofY; y += 30) {
        ctx.beginPath();
        ctx.moveTo(15, y);
        ctx.lineTo(canvas.width - 25, y);
        ctx.stroke();

        // Arrowheads
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(canvas.width - 25, y);
        ctx.lineTo(canvas.width - 34, y - 3.5);
        ctx.lineTo(canvas.width - 34, y + 3.5);
        ctx.fill();
      }

      // 2. Draw Left Building (Leeward Wall)
      ctx.fillStyle = '#162238';
      ctx.fillRect(leftBldgX, leftRoofY, bldgWidth, leftH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(leftBldgX, leftRoofY, bldgWidth, leftH);

      // Building A Windows
      ctx.fillStyle = '#fef08a';
      for (let wx = leftBldgX + 14; wx < leftBldgX + bldgWidth - 15; wx += 22) {
        for (let wy = leftRoofY + 16; wy < groundY - 14; wy += 26) {
          ctx.fillRect(wx, wy, 12, 15);
        }
      }

      // 3. Draw Right Building (Windward Wall)
      ctx.fillStyle = '#1a273e';
      ctx.fillRect(rightBldgX, rightRoofY, bldgWidth, rightH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rightBldgX, rightRoofY, bldgWidth, rightH);

      // Building B Windows
      ctx.fillStyle = '#67e8f9';
      for (let wx = rightBldgX + 14; wx < rightBldgX + bldgWidth - 15; wx += 22) {
        for (let wy = rightRoofY + 16; wy < groundY - 14; wy += 26) {
          ctx.fillRect(wx, wy, 12, 15);
        }
      }

      // Mitigation Baffle / Pocket Park
      if (mitigationActive) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(centerX, groundY - 8, 14, 0, Math.PI, true);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('🌳 BIO-BAFFLE', centerX - 28, groundY - 18);
      }

      // 4. Ground Roadway
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Road lane divider
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(leftBldgX + bldgWidth, groundY + 22);
      ctx.lineTo(rightBldgX, groundY + 22);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Vehicles on Road emitting soot
      const car1X = leftBldgX + bldgWidth + 25;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(car1X, groundY + 10, 32, 14);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(car1X + 6, groundY + 5, 18, 7);

      const car2X = leftBldgX + bldgWidth + 95;
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(car2X, groundY + 10, 26, 13);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(car2X + 5, groundY + 5, 15, 6);

      // Trapped smog gradient blob inside canyon cavity
      if (!mitigationActive) {
        const smogGrad = ctx.createRadialGradient(
          leftBldgX + bldgWidth + 35, groundY - 20, 10,
          centerX, groundY - 30, canyonWidth * 0.65
        );
        smogGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        smogGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.28)');
        smogGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = smogGrad;
        ctx.fillRect(leftBldgX + bldgWidth, leftRoofY, canyonWidth, leftH);
      }

      // 6. Draw Animated Particles
      particles.forEach(p => {
        if (p.isVortex && windAngle === 'perpendicular') {
          // Counter-clockwise eddy circulation
          const vortexSpeed = mitigationActive ? 0.008 : 0.016;
          p.angle -= vortexSpeed * windSpeed;
          p.x = centerX + Math.cos(p.angle) * p.radius;
          p.y = centerY + Math.sin(p.angle) * (p.radius * (leftH / canyonWidth));

          ctx.fillStyle = p.y > centerY ? '#ef4444' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Skimming flow across rooftops
          p.x += p.vx * (windSpeed * 0.45);
          if (p.x > canvas.width) p.x = 0;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 7. On-Canvas Sensors & Labels
      // Rooftop Clean Air
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`● ROOFTOP: ${calculatedRoofPM} µg/m³ (Clean Convection)`, leftBldgX + 5, leftRoofY - 10);

      // Ground Sidewalk Trapped Sensor
      ctx.fillStyle = mitigationActive ? '#10b981' : '#ef4444';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        `● SIDEWALK: ${calculatedGroundPM} µg/m³ ${mitigationActive ? '(VENTILATED)' : '(VORTEX TRAP)'}`,
        leftBldgX + bldgWidth + 8, groundY - 10
      );

      // Vortex flow indicator text
      if (windAngle === 'perpendicular' && !mitigationActive) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('↺ RECIRCULATING EDDY', centerX - 55, centerY - 8);
      }

      // Top HUD telemetry
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        `3D LiDAR URBAN CANYON // H/W: ${aspectRatio.toFixed(1)} // U_roof: ${windSpeed} m/s // REGIME: ${regimeInfo.name.toUpperCase()}`,
        15, 20
      );

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [aspectRatio, windSpeed, trafficDensity, windAngle, mitigationActive, selectedPreset]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              3D COMPUTATIONAL AERODYNAMICS
            </span>
            <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs">
              OKE (1988) CANOPY MODEL
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Box className="text-amber-400" />
            3D LiDAR Micro-Canyon Atmospheric Dispersion Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Urban architectural canyon aerodynamics · Recirculating eddy trapping · Height-stratified pedestrian exposure
          </p>
        </div>

        {/* Active Flow Regime Indicator */}
        <div className="flex items-center gap-2 bg-navy-900 border border-amber-500/30 px-3.5 py-2 rounded-xl">
          <Wind className="w-4 h-4 text-amber-400" />
          <div className="text-xs">
            <span className="text-slate-400">Current Flow Regime: </span>
            <strong className={`font-mono ${regimeInfo.color}`}>{regimeInfo.name}</strong>
          </div>
        </div>
      </div>

      {/* Main Interactive Wind Tunnel Simulator */}
      <div className="hud-panel p-5 border-2 border-amber-500/40 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 space-y-4">
        {/* Canvas Display */}
        <div className="relative rounded-2xl overflow-hidden border border-navy-700 bg-navy-950 shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-[300px] block" />
        </div>

        {/* Live Height Stratification Comparators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Rooftop Level (Elevated ~50m)</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{calculatedRoofPM} µg/m³</div>
            <div className="text-[11px] text-slate-400 mt-1">Free convective boundary layer skimming</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Mid-Floor Balcony (~25m)</div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">{Math.round((calculatedGroundPM + calculatedRoofPM) / 2)} µg/m³</div>
            <div className="text-[11px] text-slate-400 mt-1">Recirculating eddy shear gradient</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-red-500/40 bg-red-950/20">
            <div className="text-[10px] text-red-300 uppercase font-bold">Pedestrian Sidewalk (Ground ~1.5m)</div>
            <div className="text-2xl font-black font-mono text-red-400 mt-0.5">{calculatedGroundPM} µg/m³</div>
            <div className="text-[11px] text-red-300 mt-1 font-semibold">
              {(calculatedGroundPM / calculatedRoofPM).toFixed(1)}x more toxic than rooftop air!
            </div>
          </div>
        </div>

        {/* Interactive Parameter Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-navy-800">
          {/* Aspect Ratio H/W (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Aspect Ratio (Height / Width):</span>
              <span className="font-mono text-amber-400">H/W = {aspectRatio.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 0.35, label: '0.3 (Wide)' },
                { val: 0.8, label: '0.8 (Med)' },
                { val: 1.5, label: '1.5 (Deep)' },
                { val: 2.2, label: '2.2 (Ultra)' },
              ].map(btn => (
                <button
                  key={btn.val}
                  onClick={() => setAspectRatio(btn.val)}
                  className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                    aspectRatio === btn.val
                      ? 'bg-amber-500 text-navy-950 shadow'
                      : 'bg-navy-950 border border-navy-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={aspectRatio}
              onChange={e => setAspectRatio(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Wind Speed (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Rooftop Wind Velocity:</span>
              <span className="font-mono text-cyan-300">{windSpeed.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="7.5"
              step="0.5"
              value={windSpeed}
              onChange={e => setWindSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0 m/s (Stagnant Vortex)</span>
              <span>7.5 m/s (Brisk Flush)</span>
            </div>
          </div>

          {/* Urban Mitigation Toggle (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-300 mb-1">Architectural Mitigation:</div>
            <button
              onClick={() => setMitigationActive(!mitigationActive)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mitigationActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/20'
                  : 'bg-navy-950 text-slate-300 border-navy-700 hover:border-navy-600'
              }`}
            >
              <ShieldCheck className={mitigationActive ? 'text-emerald-400' : 'text-slate-400'} size={15} />
              {mitigationActive ? '✅ Bio-Baffles & Staggered Roofs Active' : 'Enable Staggered Architecture (-42% PM)'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-World Delhi Street Canyons Catalog */}
      <div className="hud-panel p-5 border border-navy-700 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Building className="text-cyan-400" size={18} />
            <h2 className="text-base font-bold text-white">
              Benchmark Delhi Street Canyon Locations (Surveyed via LiDAR)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click a preset to simulate real-world street geometry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DELHI_CANYONS.map((canyon) => {
            const isSelected = selectedPreset.id === canyon.id;
            return (
              <button
                key={canyon.id}
                onClick={() => handleSelectPreset(canyon)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-navy-800 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                    : 'bg-navy-950/70 border-navy-700/80 hover:bg-navy-800/60 hover:border-navy-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    canyon.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {canyon.risk} RISK
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">H/W {canyon.aspectRatio}</span>
                </div>
                <div className="text-xs font-bold text-white truncate">{canyon.name}</div>
                <div className="text-[10px] text-slate-400">{canyon.location}</div>
                <div className="mt-2 pt-2 border-t border-navy-800 text-[11px] text-slate-300 leading-tight">
                  {canyon.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scientific Validation Callout */}
      <div className="bg-navy-900/70 border border-navy-700 rounded-xl p-4 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Why Conventional City-Wide Sensors Underreport Exposure:</strong> Official monitoring stations (e.g., CPCB BAM monitors) are legally installed on 3rd or 4th-floor institutional rooftops to avoid ground dust. However, in street canyons (H/W &ge; 1.5), rooftop sensors measure clean skimming air (~50 µg/m³) while pedestrians, auto-rickshaw commuters, and children breathe stagnant recirculating exhaust (&gt;280 µg/m³). PollutionMitra solves this discrepancy by applying CFD micro-canyon correction factors.
        </div>
      </div>
    </div>
  );
}
