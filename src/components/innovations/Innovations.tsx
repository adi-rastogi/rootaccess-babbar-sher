import { Lightbulb, Camera, Mic, Box, Bike, Globe, Bell, ChevronRight } from 'lucide-react';

const INNOVATIONS = [
  {
    id: 'cctv',
    icon: Camera,
    emoji: '🎥',
    title: 'AI CCTV Traffic Intelligence',
    status: 'PLANNED',
    description: 'Real-time vehicle detection and classification using YOLO + OpenCV computer vision to estimate traffic-related emissions.',
    capabilities: [
      'Vehicle detection with bounding boxes',
      'Multi-class vehicle classification (car, truck, bus, 2-wheeler)',
      'Vehicle counting and tracking',
      'Traffic density and congestion analysis',
      'Estimated vehicle emission calculation',
    ],
    useCase: 'Camera feed from a busy intersection shows 340 vehicles/hour, classified into vehicle types, with estimated PM2.5 emission contribution per vehicle class.',
    tech: 'YOLO v8 · OpenCV · FastAPI · WebSocket streaming',
    color: '#06b6d4',
    gradient: 'from-cyan-900/40 to-navy-900',
  },
  {
    id: 'voice',
    icon: Mic,
    emoji: '🎙️',
    title: 'Advanced Multilingual Voice Assistant',
    status: 'PLANNED',
    description: 'Natural conversational voice interface in Hindi and Punjabi with neighborhood-specific environmental awareness.',
    capabilities: [
      'Hindi voice recognition and synthesis',
      'Punjabi language support',
      'Natural conversational environmental Q&A',
      'Neighborhood-specific contextual responses',
      'Voice-based community pollution reporting',
    ],
    useCase: '"Meri colony mein aaj pollution kaisa hai?" — Hindi voice query answered with neighborhood-specific PM2.5 and health advisory.',
    tech: 'Whisper / Google Speech API · multilingual TTS · intent classification',
    color: '#a855f7',
    gradient: 'from-purple-900/40 to-navy-900',
  },
  {
    id: '3d-sim',
    icon: Box,
    emoji: '🏙️',
    title: 'Advanced 3D Pollution Simulation',
    status: 'PLANNED',
    description: 'Three-dimensional urban atmospheric dispersion modelling with building effects and multiple simultaneous pollution sources.',
    capabilities: [
      '3D urban building model integration',
      'Advanced Gaussian plume / CFD dispersion',
      'Multi-source simultaneous emission modelling',
      'Time-of-day and seasonal meteorological profiles',
      'Validation against sensor network observations',
    ],
    useCase: 'Simulate how emissions from an industrial cluster disperse through a high-rise neighborhood depending on building canyon effects and wind profiles.',
    tech: 'OpenFOAM / AERMOD · CityGML · Three.js 3D visualization',
    color: '#f59e0b',
    gradient: 'from-amber-900/40 to-navy-900',
  },
  {
    id: 'mobility',
    icon: Bike,
    emoji: '🚲',
    title: 'Advanced Smart Mobility',
    status: 'PLANNED',
    description: 'Comprehensive cycling infrastructure mapping, pedestrian accessibility analysis, and personalized multi-modal lower-exposure travel.',
    capabilities: [
      'Dedicated cycling lane infrastructure mapping',
      'Pedestrian accessibility grading',
      'Route safety data integration',
      'Personalized exposure profile optimization',
      'Multi-modal recommendations (walk + metro + cycle)',
    ],
    useCase: 'User with asthma gets a personalized lower-exposure commute combining 10min cycling on a dedicated lane + metro to avoid PM2.5 hotspot.',
    tech: 'OpenStreetMap cycling data · Valhalla routing · personalization ML',
    color: '#22c55e',
    gradient: 'from-emerald-900/40 to-navy-900',
  },
  {
    id: 'city-intel',
    icon: Globe,
    emoji: '🌆',
    title: 'City-Wide Environmental Intelligence',
    status: 'PLANNED',
    description: 'Scaled sensor network covering entire city areas with authority dashboards, multi-city analytics, and smart-city platform integration.',
    capabilities: [
      'City-scale dense sensor deployment',
      'Government environmental authority dashboards',
      'Multi-city comparative analytics',
      'Smart city platform API integration',
      'Real-time citywide pollution heatmaps',
    ],
    useCase: 'Delhi government environmental officers monitor real-time air quality across 200+ sensor points, receive auto-generated compliance reports, and compare with Gurugram and Noida.',
    tech: 'MQTT broker cluster · TimescaleDB · Grafana dashboards · city APIs',
    color: '#6366f1',
    gradient: 'from-indigo-900/40 to-navy-900',
  },
  {
    id: 'alerts',
    icon: Bell,
    emoji: '🔔',
    title: 'Intelligent Environmental Alerts',
    status: 'PLANNED',
    description: 'Personalized, location-specific, forecast-based push notifications with community updates and critical-zone warnings.',
    capabilities: [
      'Personalized threshold-based push notifications',
      'Location-specific real-time alerts',
      'Forecast-based advance warnings',
      'Critical zone community broadcast',
      'Health-advisory integration (sensitive groups)',
    ],
    useCase: 'User with respiratory condition gets a push notification: "PM2.5 in your area predicted to reach 180 µg/m³ in 3 hours. Consider staying indoors."',
    tech: 'Firebase FCM · forecast model pipeline · personalization engine',
    color: '#ef4444',
    gradient: 'from-red-900/40 to-navy-900',
  },
];

export default function Innovations() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium mb-4">
          <Lightbulb size={16} />
          Technology Roadmap
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Upcoming Innovations</h1>
        <p className="text-slate-400 leading-relaxed">
          The following features are <strong className="text-yellow-400">PLANNED / FUTURE SCOPE</strong>.
          None of these capabilities are implemented in the current demo.
          They represent the full-scale vision for PollutionMitra.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INNOVATIONS.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border border-navy-700 overflow-hidden bg-gradient-to-br ${item.gradient} hover:border-opacity-60 transition-all duration-300 group`}
              style={{ '--tw-border-opacity': '0.4' } as any}
            >
              {/* Visual header */}
              <div
                className="p-8 flex items-center justify-center text-7xl relative overflow-hidden"
                style={{ background: item.color + '11' }}
              >
                <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle, ${item.color}, transparent 70%)` }} />
                <span className="relative">{item.emoji}</span>
                <div className="absolute top-3 right-3">
                  <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} style={{ color: item.color }} />
                    <h2 className="font-bold text-white text-lg">{item.title}</h2>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Planned Capabilities</div>
                  <ul className="space-y-1.5">
                    {item.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-navy-900/60 rounded-xl p-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Example Use Case</div>
                  <p className="text-xs text-slate-400 italic leading-relaxed">"{item.useCase}"</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600 font-mono">{item.tech}</div>
                  <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all hover:text-white"
                    style={{ borderColor: item.color + '40', color: item.color, background: item.color + '11' }}
                  >
                    Explore Concept
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-xl font-bold text-white mb-2">Building the Future of Environmental Intelligence</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          PollutionMitra's vision is a fully integrated, AI-powered, neighborhood-level environmental intelligence platform
          that empowers citizens, researchers, and city authorities to understand, predict, and act on air quality at the finest granularity.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
          {['Open Data', 'Scientific Integrity', 'Privacy First', 'Community Driven', 'Multilingual'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-navy-900 rounded-full border border-navy-700">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

