import { useState } from 'react';
import {
  Heart, Activity, ShieldAlert, AlertTriangle, Wind, Info,
  CheckCircle2, Clock, Thermometer, User, ArrowRight, Zap, Droplets, Stethoscope, PhoneCall
} from 'lucide-react';

interface VulnerabilityProfile {
  id: string;
  name: string;
  emoji: string;
  riskLevel: 'VERY HIGH' | 'SEVERE' | 'MODERATE' | 'HIGH';
  ventilationRate: string;
  targetOrgan: string;
  primaryRisk: string;
  clinicalAdvisory: string;
  safeWindow: string;
  recommendedMask: string;
  indoorHEPAThreshold: string;
}

const PROFILES: Record<string, VulnerabilityProfile> = {
  pediatric: {
    id: 'pediatric',
    name: 'Infants & Children (<5 yrs)',
    emoji: '👶',
    riskLevel: 'SEVERE',
    ventilationRate: '18-24 breaths/min (~2.4x higher per kg than adults)',
    targetOrgan: 'Immature Alveoli & Developing Lung Tissue',
    primaryRisk: 'Permanent reduction in baseline FEV1 lung capacity, early childhood asthma onset, and recurrent bronchiolitis.',
    clinicalAdvisory: 'Keep all outdoor playtime cancelled during AQI >200. Run indoor HEPA purifier continuously. Ensure oral hydration to support airway mucosal barrier.',
    safeWindow: 'Strictly avoid outdoor exposure until AQI drops below 100.',
    recommendedMask: 'Pediatric-sized N95 respirator (if child >2 yrs and can breathe comfortably).',
    indoorHEPAThreshold: 'Target indoor PM2.5 <15 µg/m³',
  },
  asthma: {
    id: 'asthma',
    name: 'Chronic Asthma & COPD Patients',
    emoji: '🫁',
    riskLevel: 'SEVERE',
    ventilationRate: '14-20 breaths/min (Variable Airway Resistance)',
    targetOrgan: 'Bronchial Smooth Muscle & Hyperresponsive Airways',
    primaryRisk: 'Acute bronchospasm, refractory wheezing, exacerbation of chronic obstructive pulmonary disease requiring emergency corticosteroid intervention.',
    clinicalAdvisory: 'Keep short-acting rescue bronchodilator (Salbutamol inhaler) within immediate reach. Monitor peak expiratory flow (PEF) twice daily. Take prescribed prophylactic controller medication.',
    safeWindow: '1:30 PM - 3:30 PM (Midday Solar Convection Only)',
    recommendedMask: 'Certified N95 / FFP2 mask with low-resistance exhalation valve.',
    indoorHEPAThreshold: 'Target indoor PM2.5 <12 µg/m³',
  },
  cardiac: {
    id: 'cardiac',
    name: 'Cardiovascular & Hypertensive',
    emoji: '❤️',
    riskLevel: 'VERY HIGH',
    ventilationRate: '12-16 breaths/min',
    targetOrgan: 'Vascular Endothelium & Coronary Microcirculation',
    primaryRisk: 'Ultrafine PM0.1 translocates across the blood-air barrier, inducing systemic oxidative stress, endothelial dysfunction, arterial vasoconstriction, and elevated risk of acute myocardial infarction.',
    clinicalAdvisory: 'Avoid morning outdoor walks completely. Cold air combined with fine particulates triggers coronary artery constriction. Measure blood pressure daily.',
    safeWindow: '2:00 PM - 4:00 PM',
    recommendedMask: 'Standard N95 respirator (without valve to maintain seal).',
    indoorHEPAThreshold: 'Target indoor PM2.5 <20 µg/m³',
  },
  geriatric: {
    id: 'geriatric',
    name: 'Elderly Citizens (65+ yrs)',
    emoji: '👵',
    riskLevel: 'VERY HIGH',
    ventilationRate: '14-18 breaths/min (Reduced Mucociliary Clearance)',
    targetOrgan: 'Pulmonary Parenchyma & Autonomic Regulation',
    primaryRisk: 'Diminished cough reflex allows deep particulate impaction; secondary bacterial pneumonia and aggravated heart failure.',
    clinicalAdvisory: 'Limit exposure to balcony or garden during early morning fog. Perform mild breathing exercises indoors in a HEPA-purified room.',
    safeWindow: '1:00 PM - 4:00 PM',
    recommendedMask: 'Lightweight certified N95 with soft inner silicone lining.',
    indoorHEPAThreshold: 'Target indoor PM2.5 <15 µg/m³',
  },
  athletes: {
    id: 'athletes',
    name: 'Outdoor Athletes & Commuters',
    emoji: '🏃',
    riskLevel: 'HIGH',
    ventilationRate: '45-80 L/min (Deep Oral Inhalation bypassing Nasal Filtration)',
    targetOrgan: 'Deep Bronchial Tree & Alveolar Epithelium',
    primaryRisk: 'Vigorous mouth-breathing delivers 8x higher volume of diesel exhaust and toxic metals straight into lung alveoli, causing transient acute exercise-induced pulmonary edema.',
    clinicalAdvisory: 'Shift high-intensity cardio training to indoor gym facilities with active mechanical filtration. Never run along arterial ring roads.',
    safeWindow: '1:00 PM - 4:30 PM only',
    recommendedMask: 'High-flow sports training mask with certified N99 electro-spun filter inserts.',
    indoorHEPAThreshold: 'Gym CADR >300 CFM',
  },
};

const HOURLY_SAFETY_WINDOWS = [
  { time: '05:00 - 09:00', status: 'CRITICAL', aqiRange: '320 - 450', color: 'bg-red-500/20 text-red-400 border-red-500/40', advice: 'Severe winter thermal inversion traps ground emissions. Maximum pulmonary damage window. Stay indoors.' },
  { time: '09:00 - 13:00', status: 'HIGH RISK', aqiRange: '240 - 310', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', advice: 'Peak office vehicular traffic creates heavy nitrogen dioxide and carbon monoxide corridors.' },
  { time: '13:00 - 16:30', status: 'SAFEST WINDOW', aqiRange: '130 - 190', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', advice: 'Solar convection expands planetary boundary layer (PBLH >1,100m), naturally dispersing ground smoke.' },
  { time: '16:30 - 20:30', status: 'HIGH RISK', aqiRange: '260 - 340', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', advice: 'Evening rush hour combined with ambient cooling triggers rapid particulate accumulation.' },
  { time: '20:30 - 05:00', status: 'CRITICAL', aqiRange: '340 - 480', color: 'bg-red-500/20 text-red-400 border-red-500/40', advice: 'Nocturnal boundary layer collapse (<200m). Industrial night transit and cold air stagnation.' },
];

export default function PrecisionHealthAlerts() {
  const [selectedProfileKey, setSelectedProfileKey] = useState<string>('asthma');
  const [roomArea, setRoomArea] = useState<number>(200);

  const activeProfile = PROFILES[selectedProfileKey];

  // Calculate required CADR in CFM (Room Area sq ft * 8 ft ceiling * 4 Air Changes per Hour / 60)
  const requiredCADR = Math.round((roomArea * 8 * 4) / 60);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs">
              CLINICAL EPIDEMIOLOGICAL ENGINE
            </span>
            <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs">
              ICMR / WHO BENCHMARKED
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Stethoscope className="text-red-400" />
            Precision Predictive Health Advisory &amp; Vulnerability Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Personalized pulmonary exposure risk · Biomechanical deposition depth · Time-windowed exercise safety
          </p>
        </div>

        {/* Rapid SOS Emergency Hotline */}
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 px-3.5 py-2 rounded-xl">
          <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-slate-400">Pulmonary SOS Helpline: </span>
            <span className="text-red-300 font-mono font-bold">1075 / AIIMS OPD</span>
          </div>
        </div>
      </div>

      {/* Vulnerability Profile Selector Tabs */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <User size={14} className="text-cyan-400" />
          Select Clinical Vulnerability Cohort:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {Object.keys(PROFILES).map((key) => {
            const profile = PROFILES[key];
            const isSelected = selectedProfileKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedProfileKey(key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-navy-800 border-red-500/70 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30'
                    : 'bg-navy-950/70 border-navy-700 hover:bg-navy-800/60 hover:border-navy-600 text-slate-400'
                }`}
              >
                <div className="text-2xl mb-1">{profile.emoji}</div>
                <div className="text-xs font-bold text-white truncate">{profile.name.split(' (')[0]}</div>
                <div className="text-[10px] text-red-400 font-mono font-bold mt-0.5">{profile.riskLevel} RISK</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Clinical Vulnerability Profile Dashboard */}
      <div className="hud-panel p-6 border-2 border-red-500/40 bg-gradient-to-br from-navy-900/90 via-navy-950 to-navy-900 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-navy-700">
          <div className="flex items-center gap-3.5">
            <span className="text-4xl p-3 rounded-2xl bg-navy-950 border border-navy-800">
              {activeProfile.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{activeProfile.name}</h2>
                <span className="badge bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                  {activeProfile.riskLevel} EXPOSURE HAZARD
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                <strong>Target Tissue:</strong> <span className="text-cyan-300 font-semibold">{activeProfile.targetOrgan}</span> · {activeProfile.ventilationRate}
              </p>
            </div>
          </div>

          <div className="bg-navy-950/90 p-3 rounded-xl border border-navy-800 text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Indoor Safety Baseline</div>
            <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">{activeProfile.indoorHEPAThreshold}</div>
          </div>
        </div>

        {/* Detailed Clinical Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Pathophysiological Risk */}
          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-700/80 space-y-1.5">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle size={14} />
              Pathophysiological Risk
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {activeProfile.primaryRisk}
            </p>
          </div>

          {/* Actionable Medical Protocol */}
          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-700/80 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 size={14} />
              Prescribed Protective Protocol
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {activeProfile.clinicalAdvisory}
            </p>
          </div>

          {/* Mask & Safe Window */}
          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-700/80 space-y-2">
            <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert size={14} />
              Barrier Protection &amp; Window
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 block text-[11px]">Recommended Respirator:</span>
              <strong className="text-white">{activeProfile.recommendedMask}</strong>
            </div>
            <div className="text-xs text-slate-300 pt-1 border-t border-navy-800">
              <span className="text-slate-400 block text-[11px]">Daily Outdoor Safety Window:</span>
              <strong className="text-emerald-300 font-mono">{activeProfile.safeWindow}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Biomechanical Aerosol Deposition Depth Visualizer */}
      <div className="hud-panel p-5 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-navy-700 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="text-cyan-400" size={18} />
            <h2 className="text-base font-bold text-white">
              Aerosol Biomechanics: Particle Size vs Respiratory Deposition Depth
            </h2>
          </div>
          <span className="text-xs text-slate-400">Based on International Commission on Radiological Protection (ICRP)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PM10 */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 font-mono">PM10 (Coarse Dust · 10 µm)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Upper Nasal</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Deposition Zone:</strong> Nasopharyngeal tract &amp; trachea.
              Trapped by nasal hairs and mucosal ciliary escalator. Causes rhinitis, sneezing, and ocular irritation.
            </div>
            <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-amber-400 h-full w-[45%]" />
            </div>
          </div>

          {/* PM2.5 */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 font-mono">PM2.5 (Fine Combustion · 2.5 µm)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Bronchioles</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Deposition Zone:</strong> Secondary and terminal bronchioles.
              Cannot be expelled by coughing. Induces chronic bronchitis, alveolar macrophage fatigue, and asthma exacerbations.
            </div>
            <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-rose-500 h-full w-[78%]" />
            </div>
          </div>

          {/* PM0.1 */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 font-mono">PM0.1 (Ultrafine · &lt;0.1 µm)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Bloodstream</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Deposition Zone:</strong> Alveolar sacs &amp; capillary vessels.
              Passes directly through the air-blood barrier into systemic circulation, inducing plaque rupture and cardiac arrhythmias.
            </div>
            <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-purple-500 h-full w-[96%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Pulmonary Safety Window Timeline */}
      <div className="hud-panel p-5 border border-navy-700 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-400" size={18} />
            <h2 className="text-base font-bold text-white">
              Diurnal Atmospheric Pulmonary Safety Windows (Today's Thermal Schedule)
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono">Synced with Planetary Boundary Layer Height (PBLH)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {HOURLY_SAFETY_WINDOWS.map((win, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border flex flex-col justify-between ${win.color}`}>
              <div>
                <div className="text-xs font-mono font-bold">{win.time}</div>
                <div className="text-xs font-black mt-1 uppercase tracking-wide">{win.status}</div>
                <div className="text-[11px] font-mono mt-0.5 font-bold">AQI ~{win.aqiRange}</div>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-tight">
                {win.advice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Indoor HEPA CADR Calculator & Mask Filtration Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* HEPA CADR Calculator */}
        <div className="hud-panel p-5 border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wind size={16} className="text-cyan-400" />
              Indoor HEPA Air Purifier CADR Calculator
            </h3>
            <span className="text-xs font-mono text-cyan-300 font-bold">ANSI/AHAM AC-1 Benchmark</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Room Floor Area:</span>
                <span className="font-mono text-cyan-300 font-bold">{roomArea} sq. ft.</span>
              </div>
              <input
                type="range"
                min="80"
                max="800"
                step="20"
                value={roomArea}
                onChange={e => setRoomArea(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Required CADR Rating</div>
                <div className="text-xl font-black font-mono text-cyan-300 mt-1">{requiredCADR} CFM</div>
                <div className="text-[10px] text-slate-500 mt-0.5">({Math.round(requiredCADR * 1.7)} m³/hr)</div>
              </div>
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Air Changes</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-1">4.0 ACH</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Every 15 minutes clean cycle</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              *Calculated assuming standard 8.0 ft ceiling height. For rooms with active window draft or older doors, increase CADR requirement by +25%.
            </p>
          </div>
        </div>

        {/* Mask Filtration Efficacy Matrix */}
        <div className="hud-panel p-5 border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-emerald-400" />
              Respirator &amp; Mask Efficacy Matrix
            </h3>
            <span className="text-xs font-mono text-slate-400">NIOSH / BIS Standards</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-300 block">Certified N95 / FFP2 Respirator</span>
                <span className="text-[10px] text-slate-400">Electrostatic melt-blown microfiber · Airtight seal</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">95.4% Protection</span>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-300 block">N99 / P100 Clinical Respirator</span>
                <span className="text-[10px] text-slate-400">Extreme micro-particulate barrier · Low breathability</span>
              </div>
              <span className="font-mono font-bold text-purple-400 text-sm">99.2% Protection</span>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-300 block">Standard 3-Ply Surgical Mask</span>
                <span className="text-[10px] text-slate-400">High lateral air bypass leakage · Liquid splash only</span>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">38.0% Protection</span>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-red-400 block">Cotton / Cloth Bandana Mask</span>
                <span className="text-[10px] text-slate-400">Large fiber weave pore size (&gt;50 µm) · No electrostatic</span>
              </div>
              <span className="font-mono font-bold text-red-400 text-sm">&lt;12.5% Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
