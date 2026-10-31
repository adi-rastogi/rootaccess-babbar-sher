import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, ChevronRight } from 'lucide-react';

interface TourStep {
  id: number;
  route: string;
  title: string;
  caption: string;
  narration: string;
  duration: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1, route: '/dashboard',
    title: '🌿 Welcome to PollutionMitra',
    caption: 'Air Quality, Street by Street',
    narration: 'Welcome to PollutionMitra — your AI-powered neighborhood environmental intelligence platform. PollutionMitra helps citizens understand air quality at the street level, track pollution patterns, and make healthier decisions. This guided tour will walk you through all major features. All data shown is simulated for this demonstration.',
    duration: 8000,
  },
  {
    id: 2, route: '/dashboard',
    title: '📊 Environmental Dashboard',
    caption: 'Real-time AQI, PM2.5, PM10 and sensor network status',
    narration: 'The main dashboard shows a real-time command center for environmental data. You can see the Air Quality Index, PM2.5, PM10, temperature, humidity, and wind speed. The neighborhood selector at the top updates all values for your chosen area. All values here are demo data — clearly marked as simulated.',
    duration: 9000,
  },
  {
    id: 3, route: '/map',
    title: '🗺️ Wind-Aware Pollution Flow Map',
    caption: 'Our primary innovation — interactive GIS pollution visualization',
    narration: 'This is one of our two primary innovations — Wind-Aware Pollution Flow Mapping. The interactive map shows real OpenStreetMap tiles with pollution heatmap overlays, sensor markers, and illustrative wind direction vectors. Each sensor marker shows live PM2.5 values. Click any sensor for detailed readings. Wind arrows show meteorological direction — they indicate potential dispersion patterns, though actual pollutant trajectories require validated dispersion modelling.',
    duration: 11000,
  },
  {
    id: 4, route: '/sensors',
    title: '📡 Smart Sensor Network',
    caption: 'Our second primary innovation — IoT environmental monitoring',
    narration: 'Our second core innovation is the Smart Sensor Network. Each sensor in the network reports PM2.5, PM10, temperature, humidity, battery status, and calibration information. Sensors are classified as Online, Offline, Suspected Malfunction, or Needs Calibration. The architecture supports real IoT hardware connectivity through MQTT protocol. Currently showing eight demo sensors across Delhi neighborhoods.',
    duration: 9000,
  },
  {
    id: 5, route: '/critical-zones',
    title: '🚨 Critical Pollution Zones',
    caption: 'Automated zone identification with transparent alert rationale',
    narration: 'The Critical Zones module automatically identifies areas requiring environmental attention. Every alert includes the measured value, the threshold it exceeded, the timestamp, severity level, and the reason for the alert. The system provides transparent rationale — never labelling an area critical without supporting sensor data. The bar chart shows PM2.5 versus Indian air quality standards.',
    duration: 9000,
  },
  {
    id: 6, route: '/diwali',
    title: '🎆 Diwali Pollution Analytics',
    caption: 'Before / During / After comparison with scientific honesty',
    narration: 'The Diwali Intelligence module analyzes pollution patterns around the festival. You can compare Before, During, and After periods across years and neighborhoods. Critically, we include a scientific honesty notice: PM2.5 sensors measure total concentration — they cannot attribute increases specifically to firecrackers. Traffic, industry, biomass burning, and meteorology all contribute. The Firecracker Smog Visualizer is explicitly labelled as educational and hypothetical.',
    duration: 11000,
  },
  {
    id: 7, route: '/weather',
    title: '🌤️ Weather Intelligence',
    caption: 'Meteorological integration and pollution correlation',
    narration: 'The Weather Intelligence module integrates real meteorological data with pollution monitoring. The interactive wind compass shows current wind direction and speed. We display correlations between wind speed and PM2.5 levels — noting these are illustrative associations, not proven causal relationships. A 7-day forecast and hourly temperature charts help contextualize environmental conditions. In production, this connects to WeatherAPI or OpenWeather.',
    duration: 9000,
  },
  {
    id: 8, route: '/community',
    title: '👥 Community Pollution Reporting',
    caption: 'Citizen environmental monitoring with moderation',
    narration: 'Citizens can report visible pollution sources including smoke, dust, construction, and industrial emissions. Each report goes through a moderation workflow: Submitted, Under Review, Verified, or Rejected. Community observations are clearly distinguished from air quality measurements. Location is approximate to protect privacy. Verified reports earn reward points.',
    duration: 9000,
  },
  {
    id: 9, route: '/rewards',
    title: '🏆 PollutionMitra Rewards',
    caption: 'Quality-weighted gamification for environmental participation',
    narration: 'The Rewards system incentivizes quality environmental reporting. Contributors earn Experience Points: 10 XP for a valid report, an additional 40 XP when verified, 15 XP for useful photo evidence, and 50 XP for verified community cleanups. The system rewards quality and verification — not report volume. A leaderboard shows top contributors by neighborhood.',
    duration: 9000,
  },
  {
    id: 10, route: '/forecast',
    title: '📈 Neighborhood Forecasting',
    caption: 'Pollution forecasts with uncertainty and confidence intervals',
    narration: 'The Forecasting module shows predicted pollution levels up to 48 hours ahead. Crucially, we show confidence intervals that widen with the forecast horizon — representing genuine uncertainty. Forecast outputs are clearly labelled SIMULATED in this demo. In production, this would use a trained scikit-learn or LSTM model evaluated on historical data, with reported accuracy metrics including R-squared and mean absolute error.',
    duration: 10000,
  },
  {
    id: 11, route: '/simulator',
    title: '⚗️ Environmental Scenario Lab',
    caption: 'Interactive pollution simulation laboratory',
    narration: 'The Environmental Scenario Lab lets users explore hypothetical pollution conditions. Adjust wind speed, direction, temperature, humidity, rainfall, traffic, industrial and festival emissions. Click Run Simulation to see estimated PM2.5, PM10, and AQI results. The output is an educational approximation — not a validated atmospheric dispersion model. Save multiple scenarios and compare them side by side.',
    duration: 10000,
  },
  {
    id: 12, route: '/copilot',
    title: '🤖 AI Environmental Copilot',
    caption: 'Data-grounded environmental analyst',
    narration: 'The AI Environmental Copilot answers questions about current conditions, sensor readings, Diwali patterns, weather effects, and eco-routes — using this platform\'s data. In this demo, it uses a deterministic database-grounded response system, not an external AI API. In production, it would connect to a server-side LLM with secure API key management. You can also speak your questions using the microphone button if your browser supports speech recognition.',
    duration: 10000,
  },
  {
    id: 13, route: '/routes',
    title: '🚲 Smart Eco-Routes',
    caption: 'Pollution-aware walking and cycling routes',
    narration: 'Smart Eco-Routes helps citizens find lower-exposure walking and cycling paths. The system compares three route options: a lower estimated exposure green route, a moderate amber route, and a higher exposure red route. Exposure estimates are calculated by interpolating nearby sensor readings along the route — clearly labelled as illustrative indicators, not measurements of inhaled dose. In production, this connects to OSRM or GraphHopper for real road-network routing.',
    duration: 10000,
  },
  {
    id: 14, route: '/innovations',
    title: '💡 Upcoming Innovations',
    caption: 'PLANNED future capabilities — clearly labelled as future scope',
    narration: 'The Upcoming Innovations page shows six planned capabilities: AI CCTV Traffic Intelligence using YOLO and OpenCV, Advanced Multilingual Voice Assistant in Hindi and Punjabi, Advanced 3D Pollution Simulation with urban modelling, Advanced Smart Mobility with detailed cycling infrastructure, City-Wide Environmental Intelligence at city scale, and Intelligent Environmental Alerts with personalized notifications. Every item is clearly labelled PLANNED — none are implemented in the current demo.',
    duration: 11000,
  },
  {
    id: 15, route: '/dashboard',
    title: '🌿 PollutionMitra — Summary',
    caption: 'Air Quality, Street by Street',
    narration: 'Thank you for exploring PollutionMitra. This platform demonstrates two primary environmental innovations: Wind-Aware Pollution Flow Mapping and Smart Sensor Network with Critical Zone Identification — supported by Diwali analytics, weather intelligence, community reporting, rewards, forecasting, simulation, AI Copilot, and eco-routing. All current data is clearly labelled DEMO. The full-stack vision includes FastAPI backend, PostgreSQL with PostGIS, real IoT sensor connectivity, and validated AI models. PollutionMitra — Air Quality, Street by Street.',
    duration: 13000,
  },
];

interface GuidedTourProps {
  onClose: () => void;
}

export default function GuidedTour({ onClose }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const progressRef = useRef<any>(null);

  const currentStep = TOUR_STEPS[stepIndex];
  const voiceAvailable = 'speechSynthesis' in window;

  const speak = (text: string) => {
    if (!voiceAvailable || muted) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speed;
    utt.pitch = 1;
    utt.lang = 'en-IN';
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const startStep = (idx: number) => {
    const step = TOUR_STEPS[idx];
    if (!step) return;
    navigate(step.route);
    speak(step.narration);
    setProgress(0);

    // Progress bar
    clearInterval(progressRef.current);
    const interval = 100;
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / step.duration) * 100);
      if (elapsed >= step.duration) {
        clearInterval(progressRef.current);
        if (idx + 1 < TOUR_STEPS.length) {
          setStepIndex(idx + 1);
        } else {
          setPlaying(false);
        }
      }
    }, interval);
  };

  useEffect(() => {
    if (playing) {
      startStep(stepIndex);
    } else {
      clearInterval(progressRef.current);
      if (voiceAvailable) window.speechSynthesis.cancel();
    }
    return () => {
      clearInterval(progressRef.current);
    };
  }, [stepIndex, playing]);

  useEffect(() => {
    return () => {
      if (voiceAvailable) window.speechSynthesis.cancel();
      clearInterval(progressRef.current);
    };
  }, []);

  const handlePrev = () => {
    clearInterval(progressRef.current);
    if (voiceAvailable) window.speechSynthesis.cancel();
    setStepIndex(i => Math.max(0, i - 1));
    setPlaying(true);
  };

  const handleNext = () => {
    clearInterval(progressRef.current);
    if (voiceAvailable) window.speechSynthesis.cancel();
    setStepIndex(i => Math.min(TOUR_STEPS.length - 1, i + 1));
    setPlaying(true);
  };

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
      if (voiceAvailable) window.speechSynthesis.cancel();
    } else {
      setPlaying(true);
    }
  };

  const handleMute = () => {
    setMuted(!muted);
    if (!muted && voiceAvailable) window.speechSynthesis.cancel();
    else if (muted) speak(currentStep.narration);
  };

  const handleRestart = () => {
    clearInterval(progressRef.current);
    if (voiceAvailable) window.speechSynthesis.cancel();
    setStepIndex(0);
    setPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Semi-transparent overlay at top to dim content slightly */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Tour HUD */}
      <div className="relative w-full max-w-3xl mx-4 mb-6 pointer-events-auto">
        {/* Step info card */}
        <div className="bg-navy-900/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
          {/* Progress bar */}
          <div className="h-1 bg-navy-800 relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-demo">GUIDED TOUR</span>
                  <span className="text-xs text-slate-500">Step {stepIndex + 1} of {TOUR_STEPS.length}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                {showCaptions && (
                  <p className="text-sm text-cyan-400 mt-1">{currentStep.caption}</p>
                )}
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 ml-4 flex-shrink-0 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Narration text (captions) */}
            {showCaptions && (
              <div className="bg-navy-800 rounded-xl p-3 mb-4 max-h-24 overflow-y-auto">
                <p className="text-sm text-slate-300 leading-relaxed">{currentStep.narration}</p>
              </div>
            )}

            {/* Step dots */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setStepIndex(i); setPlaying(true); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === stepIndex ? 'bg-cyan-400 w-4' :
                    i < stepIndex ? 'bg-emerald-500' : 'bg-navy-700'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleRestart} className="btn-secondary text-xs py-1.5 px-2.5">
                <RotateCcw size={14} />
                Restart
              </button>
              <button onClick={handlePrev} disabled={stepIndex === 0} className="btn-secondary text-xs py-1.5 px-2.5 disabled:opacity-40">
                <SkipBack size={14} />
                Prev
              </button>
              <button onClick={handlePlayPause} className="btn-primary text-xs py-1.5 px-4">
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? 'Pause' : 'Resume'}
              </button>
              <button onClick={handleNext} disabled={stepIndex === TOUR_STEPS.length - 1} className="btn-secondary text-xs py-1.5 px-2.5 disabled:opacity-40">
                Next
                <SkipForward size={14} />
              </button>
              <div className="flex-1" />
              <button
                onClick={handleMute}
                className={`btn-secondary text-xs py-1.5 px-2.5 ${muted ? 'text-slate-500' : 'text-emerald-400'}`}
                title={voiceAvailable ? (muted ? 'Unmute narration' : 'Mute narration') : 'Voice not supported in this browser'}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {voiceAvailable ? (muted ? 'Unmute' : 'Narration') : 'No Voice'}
              </button>
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`btn-secondary text-xs py-1.5 px-2.5 ${showCaptions ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                {showCaptions ? 'Hide Text' : 'Show Text'}
              </button>
              <select
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="select-field text-xs py-1.5 px-2"
              >
                <option value={0.75}>0.75×</option>
                <option value={1}>1×</option>
                <option value={1.25}>1.25×</option>
                <option value={1.5}>1.5×</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

