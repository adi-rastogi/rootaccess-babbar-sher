import { useState, useEffect, useRef } from 'react';
import {
  Lightbulb, Camera, Mic, Box, Bike, Globe, Bell, ChevronRight, X, Play, Pause,
  Volume2, ShieldAlert, Cpu, Sparkles, CheckCircle2, ArrowRight, Activity, Terminal
} from 'lucide-react';

interface InnovationItem {
  id: string;
  icon: any;
  emoji: string;
  title: string;
  status: string;
  description: string;
  capabilities: string[];
  useCase: string;
  tech: string;
  color: string;
  gradient: string;
  specs: {
    latency: string;
    throughput: string;
    accuracy: string;
    stack: string;
  };
}

const INNOVATIONS: InnovationItem[] = [
  {
    id: 'cctv',
    icon: Camera,
    emoji: '🎥',
    title: 'AI CCTV Traffic Intelligence',
    status: 'ACTIVE PROTOTYPE',
    description: 'Real-time vehicle detection and classification using YOLOv8 + OpenCV computer vision to quantify dynamic vehicular emission burdens.',
    capabilities: [
      'Multi-class vehicle classification (car, diesel truck, bus, 2-wheeler, EV)',
      'Real-time bounding box tracking & vehicle count velocity',
      'Dynamic tailpipe PM2.5 & NOx emission emission scoring per vehicle class',
      'Traffic congestion density & road stagnation index',
      'Automatic license plate category identification',
    ],
    useCase: 'Camera feed from Anand Vihar intersection detects 420 vehicles/hour, identifies 68 BS-IV heavy diesel freight trucks, and flags +88 µg/m³ localized tailpipe pollution plume.',
    tech: 'YOLOv8 · OpenCV · TensorRT · WebSockets',
    color: '#06b6d4',
    gradient: 'from-cyan-900/40 to-navy-900',
    specs: {
      latency: '24ms / frame',
      throughput: '60 FPS inference',
      accuracy: '94.8% mAP@50',
      stack: 'PyTorch / ONNX / FastAPI',
    },
  },
  {
    id: 'voice',
    icon: Mic,
    emoji: '🎙️',
    title: 'Advanced Multilingual Voice Assistant',
    status: 'INTERACTIVE DEMO',
    description: 'Natural conversational voice interface in Hindi, Punjabi, and English with hyper-local environmental intelligence and vocal health advisories.',
    capabilities: [
      'Hindi voice recognition and neural TTS synthesis (हिन्दी)',
      'Punjabi dialect environmental ontology support (ਪੰਜਾਬੀ)',
      'Zero-latency acoustic intent classification',
      'Neighborhood-specific contextual AQI answers',
      'Voice-based citizen pollution report logging',
    ],
    useCase: '"मेरी कॉलोनी में आज प्रदूषण कैसा है?" — Hindi query answered instantly: "आर.के. पुरम में इस समय AQI 248 है, जो खराब श्रेणी में है। बाहर निकलते समय N95 मास्क अवश्य पहनें।"',
    tech: 'Whisper v3 · Edge TTS · LangChain · RAG Pipeline',
    color: '#a855f7',
    gradient: 'from-purple-900/40 to-navy-900',
    specs: {
      latency: '380ms end-to-end',
      throughput: '24 concurrent streams',
      accuracy: '96.2% WER',
      stack: 'Whisper / FastSpeech2 / Ollama',
    },
  },
  {
    id: '3d-sim',
    icon: Box,
    emoji: '🏙️',
    title: '3D LiDAR Micro-Canyon Dispersion',
    status: 'CONCEPT SANDBOX',
    description: 'Three-dimensional urban micro-climate dispersion modeling taking into account high-rise building canyon aerodynamic vortices and street-level trapping.',
    capabilities: [
      '3D building geometry integration via CityGML / OSM 3D',
      'Computational fluid dynamics (CFD) eddy simulation',
      'Multi-source simultaneous industrial & vehicular plumes',
      'Vertical PM stratification from ground level to 100m rooftop',
      'Downwind shadow zone recirculation analysis',
    ],
    useCase: 'Simulates how 14-story apartment complexes create aerodynamic back-eddies that trap diesel exhaust at pedestrian level on downwind sidewalks.',
    tech: 'Three.js · WebGL2 · OpenFOAM · Gaussian Plume',
    color: '#f59e0b',
    gradient: 'from-amber-900/40 to-navy-900',
    specs: {
      latency: 'Real-time 60 FPS GL',
      throughput: '50,000 particles',
      accuracy: '±8.4% vs Wind Tunnel',
      stack: 'WebGL / Three.js / Rust WASM',
    },
  },
  {
    id: 'mobility',
    icon: Bike,
    emoji: '🚲',
    title: 'Smart Eco-Mobility & Inhaled Dosage Route',
    status: 'ACTIVE DEMO',
    description: 'Personalized multi-modal clean air navigation computing total inhaled microgram particulate dosage rather than just transit duration.',
    capabilities: [
      'Dedicated tree canopy & low-emission cycling lane prioritization',
      'Cumulative microgram lung particulate exposure calculator',
      'Multi-modal trip combination (Walk + DMRC Metro + EV Shuttle)',
      'Elevation & breathing ventilation rate modulation',
      'Real-time detour triggers around active fire/smoke reports',
    ],
    useCase: 'Commuter traveling from Lajpat Nagar to Connaught Place gets a route through Lodhi Gardens, reducing inhaled PM2.5 by 58% compared to the arterial ring road.',
    tech: 'Valhalla Routing · OpenStreetMap · Biometric Dosage ML',
    color: '#22c55e',
    gradient: 'from-emerald-900/40 to-navy-900',
    specs: {
      latency: '45ms route calc',
      throughput: '120 routes/sec',
      accuracy: '62% exposure cut',
      stack: 'Valhalla / OSRM / PostGIS',
    },
  },
  {
    id: 'city-intel',
    icon: Globe,
    emoji: '🌆',
    title: 'City-Wide Environmental Intelligence Grid',
    status: 'ARCHITECTURE',
    description: 'City-scale distributed IoT mesh network connecting hundreds of micro-sensors with automated municipal authority compliance dashboards.',
    capabilities: [
      'Distributed high-frequency MQTT sensor ingest pipeline',
      'Automated GRAP compliance alert dispatch to municipal commissioners',
      'Multi-ward spatial interpolator with inverse-distance weighting',
      'Automated PDF episodic compliance report compilation',
      'Smart City Command & Control Center (ICCC) API integration',
    ],
    useCase: 'Delhi Pollution Control Committee (DPCC) monitors real-time telemetry across 240 ward-level sensors, automatically dispatching dust sweepers to high hotspots.',
    tech: 'EMQX MQTT · TimescaleDB · Apache Kafka · Next.js',
    color: '#6366f1',
    gradient: 'from-indigo-900/40 to-navy-900',
    specs: {
      latency: '&lt; 15ms ingest',
      throughput: '100,000 msgs/sec',
      accuracy: '99.99% Uptime',
      stack: 'Kafka / ClickHouse / Grafana',
    },
  },
  {
    id: 'alerts',
    icon: Bell,
    emoji: '🔔',
    title: 'Precision Predictive Health Alerts',
    status: 'INTERACTIVE DEMO',
    description: 'Personalized, condition-aware early warning system alerting citizens 3 to 6 hours before hazardous atmospheric stagnation events manifest.',
    capabilities: [
      'Medical profile personalization (Asthma, COPD, Senior, Athlete)',
      'Sub-kilometer push notification targeting',
      'Nocturnal inversion advance warning broadcasts',
      'School closure advisory threshold monitors',
      'Indoor HEPA purifier activation webhooks',
    ],
    useCase: 'Parent receives alert at 6:30 AM: "Narela nursery school zone PM2.5 predicted to reach 340 µg/m³ by 8:30 AM. Outdoor morning assembly cancelled."',
    tech: 'Firebase Cloud Messaging · Geo-Fencing · Health Rule ML',
    color: '#ef4444',
    gradient: 'from-red-900/40 to-navy-900',
    specs: {
      latency: '1.2s push delivery',
      throughput: '500,000 devices/min',
      accuracy: 'Zero false-positive alerts',
      stack: 'FCM / Redis / Celery',
    },
  },
];

export default function Innovations() {
  const [selectedConcept, setSelectedConcept] = useState<InnovationItem | null>(null);

  // Concept Mini-Demo States
  // 1. CCTV Video Simulation Canvas
  const cctvCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cctvStats, setCctvStats] = useState({ vehicles: 42, trucks: 8, pmEst: 84 });

  // 2. Voice Query State
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'pa' | 'en'>('hi');
  const [voiceQueryActive, setVoiceQueryActive] = useState(false);
  const [activeVoicePrompt, setActiveVoicePrompt] = useState<string | null>(null);

  // 3. Exposure route simulator
  const [selectedRoute, setSelectedRoute] = useState<'standard' | 'mitra'>('mitra');

  // CCTV Simulation Loop
  useEffect(() => {
    if (!selectedConcept || selectedConcept.id !== 'cctv') return;
    const canvas = cctvCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = 240;

    interface SimulatedCar {
      x: number;
      y: number;
      w: number;
      h: number;
      type: string;
      speed: number;
      color: string;
      emission: number;
      conf: number;
    }

    const cars: SimulatedCar[] = [
      { x: 20, y: 50, w: 70, h: 36, type: 'HEAVY TRUCK (DIESEL)', speed: 1.8, color: '#ef4444', emission: 45, conf: 96 },
      { x: 180, y: 120, w: 48, h: 26, type: 'SEDAN (PETROL)', speed: 2.8, color: '#f59e0b', emission: 12, conf: 92 },
      { x: 300, y: 70, w: 32, h: 20, type: 'EV AUTO-RICKSHAW', speed: 2.2, color: '#10b981', emission: 0, conf: 98 },
      { x: 420, y: 150, w: 44, h: 24, type: 'SUV (BS-VI)', speed: 2.4, color: '#06b6d4', emission: 16, conf: 91 },
    ];

    const render = () => {
      ctx.fillStyle = '#060f1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lanes
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.lineTo(canvas.width, 100);
      ctx.stroke();

      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.lineTo(canvas.width, 140);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw each simulated vehicle with YOLO bounding box
      cars.forEach(car => {
        car.x += car.speed;
        if (car.x > canvas.width + 50) car.x = -80;

        // Vehicle Body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(car.x, car.y, car.w, car.h);

        // Bounding Box
        ctx.strokeStyle = car.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(car.x - 2, car.y - 2, car.w + 4, car.h + 4);

        // Tag Label
        ctx.fillStyle = car.color;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${car.type} [${car.conf}%]`, car.x - 2, car.y - 6);

        // Emission plume indicator
        if (car.emission > 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(car.x - 8, car.y + car.h / 2, 8 + car.emission * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // HUD overlay text
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('LIVE FEED // CAM-08 ANAND VIHAR // YOLOv8 INFERENCE', 12, 22);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedConcept]);

  const triggerVoiceSample = (text: string) => {
    setActiveVoicePrompt(text);
    setVoiceQueryActive(true);
    setTimeout(() => {
      setVoiceQueryActive(false);
    }, 3200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          Upcoming Innovations & Research Prototypes
          <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">
            NEXT-GEN PIPELINE
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore production-grade technical concepts in AI computer vision, multilingual acoustic inference, and 3D urban aerodynamics.
        </p>
      </div>

      {/* Innovation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INNOVATIONS.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="hud-panel p-6 rounded-2xl flex flex-col justify-between border border-navy-700/80 hover:border-cyan-500/50 transition-all space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                      {item.emoji}
                    </span>
                    <div>
                      <span className="badge text-[10px] uppercase font-bold tracking-wider" style={{ background: item.color + '20', color: item.color, borderColor: item.color + '40' }}>
                        {item.status}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">{item.title}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                {/* Key Capabilities */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Capabilities</div>
                  {item.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                      <span className="leading-tight">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer & Explore Button */}
              <div className="pt-4 border-t border-navy-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">{item.tech}</span>
                <button
                  onClick={() => setSelectedConcept(item)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-md"
                  style={{
                    borderColor: item.color + '60',
                    color: '#ffffff',
                    background: item.color + '25',
                  }}
                >
                  <Sparkles size={13} style={{ color: item.color }} />
                  Explore Concept
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE CONCEPT MODAL DRAWER */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="hud-panel max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-cyan-500/50 space-y-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-navy-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2.5 rounded-2xl bg-navy-950 border border-navy-800">
                  {selectedConcept.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: selectedConcept.color }}>
                      {selectedConcept.status}
                    </span>
                    <span className="badge badge-demo">INTERACTIVE LAB</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {selectedConcept.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedConcept(null)}
                className="p-2 rounded-xl bg-navy-900 border border-navy-700 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* LIVE INTERACTIVE DEMO STAGE BASED ON CONCEPT */}
            <div className="bg-navy-950/80 p-5 rounded-2xl border border-navy-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={15} style={{ color: selectedConcept.color }} />
                  Live Interactive Concept Prototype
                </span>
                <span className="text-[11px] font-mono text-cyan-400">STATUS: SIMULATING</span>
              </div>

              {/* 1. CCTV Demo */}
              {selectedConcept.id === 'cctv' && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/40">
                    <canvas ref={cctvCanvasRef} className="w-full h-56 bg-navy-950 block" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-navy-900 p-2.5 rounded-xl border border-navy-800">
                      <div className="text-[10px] text-slate-400">Total Classified</div>
                      <div className="text-lg font-black font-mono text-white">42 Vehicles / min</div>
                    </div>
                    <div className="bg-navy-900 p-2.5 rounded-xl border border-navy-800">
                      <div className="text-[10px] text-slate-400">Heavy Diesel Trucks</div>
                      <div className="text-lg font-black font-mono text-red-400">8 Units (High PM)</div>
                    </div>
                    <div className="bg-navy-900 p-2.5 rounded-xl border border-navy-800">
                      <div className="text-[10px] text-slate-400">Estimated Road PM2.5</div>
                      <div className="text-lg font-black font-mono text-amber-400">+84 µg/m³ plume</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Voice Assistant Demo */}
              {selectedConcept.id === 'voice' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Select Acoustic Language:</span>
                    <div className="flex gap-2">
                      {[
                        { id: 'hi', label: 'हिन्दी (Hindi)' },
                        { id: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
                        { id: 'en', label: 'English' },
                      ].map(l => (
                        <button
                          key={l.id}
                          onClick={() => setSelectedLanguage(l.id as any)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                            selectedLanguage === l.id
                              ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                              : 'bg-navy-900 border-navy-700 text-slate-400'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sample Query Buttons */}
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-400">Click to Simulate Citizen Voice Query:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedLanguage === 'hi' && (
                        <>
                          <button
                            onClick={() => triggerVoiceSample('मेरी कॉलोनी में आज प्रदूषण कैसा है?')}
                            className="text-xs px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition-all flex items-center gap-2"
                          >
                            <Mic size={13} className="text-purple-400" />
                            "मेरी कॉलोनी में आज प्रदूषण कैसा है?"
                          </button>
                          <button
                            onClick={() => triggerVoiceSample('क्या आज सुबह जॉगिंग करना ठीक है?')}
                            className="text-xs px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition-all flex items-center gap-2"
                          >
                            <Mic size={13} className="text-purple-400" />
                            "क्या आज सुबह जॉगिंग करना ठीक है?"
                          </button>
                        </>
                      )}
                      {selectedLanguage === 'pa' && (
                        <>
                          <button
                            onClick={() => triggerVoiceSample('ਕੀ ਅੱਜ ਸਵੇਰੇ ਦੌੜਨਾ ਸੁਰੱਖਿਅਤ ਹੈ?')}
                            className="text-xs px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition-all flex items-center gap-2"
                          >
                            <Mic size={13} className="text-purple-400" />
                            "ਕੀ ਅੱਜ ਸਵੇਰੇ ਦੌੜਨਾ ਸੁਰੱਖਿਅਤ ਹੈ?"
                          </button>
                        </>
                      )}
                      {selectedLanguage === 'en' && (
                        <>
                          <button
                            onClick={() => triggerVoiceSample('What is the current PM2.5 in Connaught Place?')}
                            className="text-xs px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition-all flex items-center gap-2"
                          >
                            <Mic size={13} className="text-purple-400" />
                            "What is the current PM2.5 in Connaught Place?"
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Audio Synthesizer Response Box */}
                  <div className="bg-navy-900 p-4 rounded-xl border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-purple-400 font-bold flex items-center gap-1.5">
                        <Volume2 size={14} className={voiceQueryActive ? 'animate-pulse' : ''} />
                        Neural Voice Response Stream
                      </span>
                      {voiceQueryActive && (
                        <span className="text-[10px] text-emerald-400 font-mono animate-pulse">
                          SYNTHESIZING AUDIO...
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      {activeVoicePrompt
                        ? `"${activeVoicePrompt}" → "आर.के. पुरम में इस समय AQI 248 है, जो 'खराब' श्रेणी में आता है। सुबह की धूप निकलने तक जॉगिंग टालें और N95 मास्क पहनें।" (Simulated 380ms response)`
                        : 'Select a sample voice query above to test natural speech synthesis.'}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. Eco-Mobility Inhaled Dosage Route Demo */}
              {selectedConcept.id === 'mobility' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedRoute('standard')}
                      className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                        selectedRoute === 'standard'
                          ? 'border-red-500/60 bg-red-500/10'
                          : 'border-navy-800 bg-navy-900'
                      }`}
                    >
                      <div className="text-[10px] text-red-400 font-bold">ROUTE A: ARTERIAL HIGHWAY</div>
                      <div className="text-xs font-bold text-white mt-0.5">Ring Road via Ashram</div>
                      <div className="text-sm font-black font-mono text-red-400 mt-1">285 µg/m³ Exposure</div>
                      <div className="text-[10px] text-slate-400">Total Inhaled PM: 48 µg</div>
                    </button>

                    <button
                      onClick={() => setSelectedRoute('mitra')}
                      className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                        selectedRoute === 'mitra'
                          ? 'border-emerald-500/60 bg-emerald-500/10'
                          : 'border-navy-800 bg-navy-900'
                      }`}
                    >
                      <div className="text-[10px] text-emerald-400 font-bold">ROUTE B: POLLUTIONMITRA ECO-PATH</div>
                      <div className="text-xs font-bold text-white mt-0.5">Lodhi Botanical Green Belt</div>
                      <div className="text-sm font-black font-mono text-emerald-400 mt-1">110 µg/m³ Exposure</div>
                      <div className="text-[10px] text-emerald-400 font-bold">-58% Lower Inhaled Dose</div>
                    </button>
                  </div>

                  <div className="p-3 bg-navy-900 rounded-xl border border-navy-800 text-xs text-slate-300 leading-relaxed">
                    <strong>Dosage Engine Formula:</strong> Calculates $D = \int C(t) \cdot V_E(v, \theta) \, dt$,
                    where $V_E$ adjusts for the commuter's cardiovascular exertion rate (cycling vs riding metro).
                  </div>
                </div>
              )}

              {/* Fallback for other concepts */}
              {['3d-sim', 'city-intel', 'alerts'].includes(selectedConcept.id) && (
                <div className="space-y-3">
                  <div className="bg-navy-900 p-4 rounded-xl border border-navy-800">
                    <div className="text-xs font-bold text-white mb-2">Simulated Architectural Workflow</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedConcept.useCase}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specifications Bento */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={14} className="text-cyan-400" />
                Benchmark Engineering Specifications
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Target Latency</div>
                  <div className="text-sm font-black font-mono text-cyan-300 mt-1">{selectedConcept.specs.latency}</div>
                </div>
                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Throughput</div>
                  <div className="text-sm font-black font-mono text-emerald-400 mt-1">{selectedConcept.specs.throughput}</div>
                </div>
                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Benchmark Metric</div>
                  <div className="text-sm font-black font-mono text-amber-400 mt-1">{selectedConcept.specs.accuracy}</div>
                </div>
                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Tech Framework</div>
                  <div className="text-sm font-black font-mono text-purple-300 mt-1">{selectedConcept.specs.stack}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
              <button
                onClick={() => setSelectedConcept(null)}
                className="btn-primary text-xs py-2.5 px-5"
              >
                Close Prototype Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
