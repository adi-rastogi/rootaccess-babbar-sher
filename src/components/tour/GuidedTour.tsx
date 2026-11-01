import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, ChevronRight } from 'lucide-react';

interface TourStep {
  id: number;
  route: string;
  title: string;
  titleHi: string;
  caption: string;
  captionHi: string;
  narration: string;
  narrationHi: string;
  duration: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1, route: '/dashboard',
    title: '🌿 Welcome to PollutionMitra',
    titleHi: '🌿 पॉल्यूशनमित्र में आपका स्वागत है',
    caption: 'Air Quality, Street by Street',
    captionHi: 'वायु गुणवत्ता, हर गली और चौराहे पर',
    narration: 'Welcome to PollutionMitra — your AI-powered neighborhood environmental intelligence platform. PollutionMitra helps citizens understand air quality at the street level, track pollution patterns, and make healthier decisions. This guided tour will walk you through all major features. All data shown is simulated for this demonstration.',
    narrationHi: 'पॉल्यूशनमित्र में आपका स्वागत है — आपका एआई-संचालित मोहल्ला पर्यावरण इंटेलिजेंस प्लेटफॉर्म। पॉल्यूशनमित्र नागरिकों को गली स्तर पर वायु गुणवत्ता समझने, प्रदूषण पैटर्न ट्रैक करने और स्वस्थ निर्णय लेने में मदद करता है। यह गाइडेड टूर आपको सभी प्रमुख फीचर्स से परिचित कराएगा।',
    duration: 8000,
  },
  {
    id: 2, route: '/dashboard',
    title: '📊 Environmental Dashboard',
    titleHi: '📊 पर्यावरण डैशबोर्ड और लाइव एक्यूआई',
    caption: 'Real-time AQI, PM2.5, PM10 and sensor network status',
    captionHi: 'रीयल-टाइम एक्यूआई, पीएम2.5, पीएम10 और सेंसर नेटवर्क स्थिति',
    narration: 'The main dashboard shows a real-time command center for environmental data. You can see the Air Quality Index, PM2.5, PM10, temperature, humidity, and wind speed. The neighborhood selector at the top updates all values for your chosen area. All values here are demo data — clearly marked as simulated.',
    narrationHi: 'मुख्य डैशबोर्ड रीयल-टाइम पर्यावरण कमांड सेंटर दिखाता है। आप एयर क्वालिटी इंडेक्स, पीएम2.5, पीएम10, तापमान, नमी और हवा की गति देख सकते हैं। ऊपर दिए गए एरिया सेलेक्टर से आप अपने पसंदीदा इलाके का डेटा देख सकते हैं।',
    duration: 9000,
  },
  {
    id: 3, route: '/map',
    title: '🗺️ Wind-Aware Pollution Flow Map',
    titleHi: '🗺️ वायु-प्रवाह प्रदूषण फैलाव मानचित्र',
    caption: 'Our primary innovation — interactive GIS pollution visualization',
    captionHi: 'हमारा मुख्य नवाचार — इंटरैक्टिव जीआईएस प्रदूषण विज़ुअलाइज़ेशन',
    narration: 'This is one of our two primary innovations — Wind-Aware Pollution Flow Mapping. The interactive map shows real OpenStreetMap tiles with pollution heatmap overlays, sensor markers, and illustrative wind direction vectors. Each sensor marker shows live PM2.5 values. Click any sensor for detailed readings.',
    narrationHi: 'यह हमारा प्रमुख नवाचार है — हवा के रुख के साथ प्रदूषण का फैलाव नक्शा। यह इंटरैक्टिव जीआईएस मैप प्रदूषण का हीटमैप, सेंसर मार्कर्स और हवा की दिशा दिखाता है। हर सेंसर पर क्लिक करके आप उस गली का विस्तृत पीएम2.5 डेटा देख सकते हैं।',
    duration: 11000,
  },
  {
    id: 4, route: '/sensors',
    title: '📡 Smart Sensor Network',
    titleHi: '📡 स्मार्ट आईओटी सेंसर नेटवर्क',
    caption: 'Our second primary innovation — IoT environmental monitoring',
    captionHi: 'हमारा दूसरा मुख्य नवाचार — आईओटी पर्यावरणीय निगरानी',
    narration: 'Our second core innovation is the Smart Sensor Network. Each sensor in the network reports PM2.5, PM10, temperature, humidity, battery status, and calibration information. Sensors are classified as Online, Offline, Suspected Malfunction, or Needs Calibration.',
    narrationHi: 'हमारा दूसरा मुख्य नवाचार है स्मार्ट सेंसर नेटवर्क। नेटवर्क का हर सेंसर पीएम2.5, पीएम10, तापमान, नमी, बैटरी और कैलिब्रेशन स्थिति रिपोर्ट करता है। इससे फॉल्टी या ऑफलाइन सेंसर तुरंत पहचाने जा सकते हैं।',
    duration: 9000,
  },
  {
    id: 5, route: '/critical-zones',
    title: '🚨 Critical Pollution Zones',
    titleHi: '🚨 क्रिटिकल प्रदूषण हॉटस्पॉट क्षेत्र',
    caption: 'Automated zone identification with transparent alert rationale',
    captionHi: 'पारदर्शी अलर्ट कारणों के साथ स्वचालित अति-संवेदनशील क्षेत्र पहचान',
    narration: 'The Critical Zones module automatically identifies areas requiring environmental attention. Every alert includes the measured value, the threshold it exceeded, the timestamp, severity level, and the reason for the alert.',
    narrationHi: 'क्रिटिकल ज़ोन मॉड्यूल स्वचालित रूप से उन इलाकों की पहचान करता है जहां प्रदूषण खतरनाक स्तर पर है। हर चेतावनी में मापा गया मान, सुरक्षित सीमा, समय और अलर्ट का ठोस वैज्ञानिक कारण पारदर्शी रूप से दर्ज होता है।',
    duration: 9000,
  },
  {
    id: 6, route: '/satellite',
    title: '🛰️ Pan-India Satellite Intelligence',
    titleHi: '🛰️ अखिल भारतीय उपग्रह खुफिया नक्शा',
    caption: 'ISRO INSAT-3DR AOD, Sentinel-5P NO2 & Farm Fires',
    captionHi: 'इसरो उपग्रह एरोसोल धुंध, नाइट्रोजन डाइऑक्साइड और पराली की आग',
    narration: 'The Pan-India Satellite section combines ISRO INSAT-3DR geostationary scans with Copernicus Sentinel-5P TROPOMI and NASA VIIRS fire anomaly detectors, tracking regional smog across the entire Indo-Gangetic Plain.',
    narrationHi: 'उपग्रह खुफिया सेक्शन इसरो के इनसैट-3डीआर और यूरोपियन सेंटिनल-5पी डेटा को मिलाकर पूरे भारत में फैले स्मॉग, औद्योगिक गैसों और पंजाब-हरियाणा में पराली जलाने की थर्मल हॉटस्पॉट्स को लाइव ट्रैक करता है।',
    duration: 10000,
  },
  {
    id: 7, route: '/diwali',
    title: '🎆 Diwali Smog & Acoustic Detector',
    titleHi: '🎆 दिवाली स्मॉग व पटाखे धमाका डिटेक्टर',
    caption: 'Chemical Speciation & Acoustic Shockwave Forensic Intelligence',
    captionHi: 'रासायनिक स्पेक्ट्रोस्कोपी और अल्ट्रासोनिक ध्वनि शॉकवेव डिटेक्टर',
    narration: 'The Diwali Intelligence module features our unique AI Pyrotechnic Chemical & Acoustic Burst Detector. It differentiates illegal fireworks from traffic exhaust by detecting Barium (+840%) and Strontium surges paired with >95 dB acoustic shockwaves.',
    narrationHi: 'दिवाली इंटेलिजेंस सेक्शन में हमारा अनूठा एआई पायरोटेक्निक केमिकल और साउंड शॉकवेव डिटेक्टर है। यह बेरियम और स्ट्रॉन्शियम केमिकल तथा 95 डेसिबल से अधिक के धमाकों को पकड़कर पटाखों के प्रदूषण को सामान्य ट्रैफिक से अलग करता है।',
    duration: 11000,
  },
  {
    id: 8, route: '/weather',
    title: '🌤️ Weather Intelligence & Inversion',
    titleHi: '🌤️ मौसम विज्ञान और तापमान उलटाव (इनवर्जन)',
    caption: 'Meteorological integration and pollution correlation',
    captionHi: 'मौसम डेटा और प्रदूषण फैलाव का सहसंबंध',
    narration: 'The Weather Intelligence module integrates meteorological telemetry. The interactive wind compass shows direction and speed, illustrating how winter thermal inversion traps cold air and fine particulates near ground level.',
    narrationHi: 'मौसम इंटेलिजेंस सेक्शन हवा की रफ्तार और तापमान दिखाता है। यह समझाता है कि कैसे सर्दियों में थर्मल इनवर्जन की वजह से ठंडी हवा जमीन के पास भारी होकर जहरीले धुएं को जमा कर देती है।',
    duration: 9000,
  },
  {
    id: 9, route: '/community',
    title: '👥 Community Pollution Reporting',
    titleHi: '👥 जनभागीदारी व नागरिक प्रदूषण रिपोर्टिंग',
    caption: 'Citizen environmental monitoring with moderation',
    captionHi: 'सत्यापित नागरिक निगरानी और त्वरित समाधान कार्रवाई',
    narration: 'Citizens can report visible pollution sources including garbage burning, construction dust, and industrial smoke. Reports go through transparent moderation workflows to mobilize municipal enforcement.',
    narrationHi: 'नागरिक कूड़ा जलाने, निर्माण धूल और औद्योगिक धुएं की तुरंत फोटो और जीपीएस लोकेशन के साथ रिपोर्ट कर सकते हैं। सत्यापित रिपोर्टों पर नगर निगम द्वारा एंटी-स्मॉग गन और जांच दल भेजे जाते हैं।',
    duration: 9000,
  },
  {
    id: 10, route: '/rewards',
    title: '🏆 PollutionMitra Rewards & XP',
    titleHi: '🏆 पॉल्यूशनमित्र रिवॉर्ड्स और ग्रीन पॉइंट्स',
    caption: 'Quality-weighted gamification for environmental participation',
    captionHi: 'पर्यावरण सुधार में भागीदारी के लिए ग्रीन रिवॉर्ड्स',
    narration: 'The Rewards system incentivizes quality environmental reporting. Contributors earn XP points, level up badges, and climb their ward leaderboard for verified civic contributions.',
    narrationHi: 'रिवॉर्ड्स सिस्टम नागरिकों को सकारात्मक योगदान के लिए प्रोत्साहित करता है। सही प्रदूषण रिपोर्टिंग और वृक्षारोपण पर एक्सपी पॉइंट्स और ग्रीन वार्ड बैज मिलते हैं।',
    duration: 9000,
  },
  {
    id: 11, route: '/routes',
    title: '🚲 Smart Eco-Mobility Routes',
    titleHi: '🚲 स्मार्ट इको-मोबिलिटी स्वच्छ मार्ग',
    caption: 'Minimize cumulative inhaled particulate dosage',
    captionHi: 'फेफड़ों में जाने वाले जहरीले कणों की मात्रा को कम करें',
    narration: 'Smart Eco-Routes calculates walking and cycling corridors that reduce cumulative inhaled particulate dosage by up to 58%, routing commuters through tree-lined green paths rather than congested highways.',
    narrationHi: 'स्मार्ट इको-रूट्स पैदल और साइकिल चलने वालों के लिए ऐसे रास्ते चुनता है जहां सांस में जाने वाला प्रदूषण 58% तक कम हो जाता है, जिससे अस्थमा और हृदय रोगियों की सुरक्षा होती है।',
    duration: 10000,
  },
  {
    id: 12, route: '/copilot',
    title: '🤖 AI Environmental Copilot',
    titleHi: '🤖 एआई पर्यावरण कोपायलट',
    caption: 'Intelligent atmospheric and clinical health assistant',
    captionHi: 'बुद्धिमान वायु गुणवत्ता और स्वास्थ्य सलाहकार',
    narration: 'The AI Copilot answers questions about live sensor readings, clinical N95 mask advice, morning exercise safety, and Diwali forensics with natural conversation and voice interaction.',
    narrationHi: 'हमारा एआई कोपायलट आपके सभी सवालों का उत्तर देता है — जैसे आज कौन सा मास्क पहनें, सुबह दौड़ना सुरक्षित है या नहीं, और दिवाली डिटेक्टर कैसे काम करता है।',
    duration: 10000,
  },
  {
    id: 13, route: '/innovations',
    title: '💡 Upcoming Innovations & 3D Canyon',
    titleHi: '💡 3डी लिडार शहरी कैन्यन और नवाचार',
    caption: 'Computer vision, acoustic intelligence, and urban aerodynamics',
    captionHi: 'कंप्यूटर विज़न, ध्वनि विश्लेषण और 3डी बिल्डिंग वायु-भंवर मॉडल',
    narration: 'Explore our cutting-edge prototypes including YOLOv8 traffic CCTV emission quantification, multilingual voice interaction, and 3D LiDAR urban micro-canyon vortex simulations.',
    narrationHi: 'यहां आप हमारे उन्नत प्रोटोटाइप देख सकते हैं — जैसे एआई ट्रैफिक कैमरा विश्लेषण, बहुभाषी वॉयस और ऊंची इमारतों के बीच फंसे धुएं का 3डी लिडार वायु-भंवर सिमुलेशन।',
    duration: 11000,
  },
  {
    id: 14, route: '/dashboard',
    title: '🌿 PollutionMitra — Summary',
    titleHi: '🌿 पॉल्यूशनमित्र — निष्कर्ष एवं विज़न',
    caption: 'Air Quality, Street by Street',
    captionHi: 'वायु गुणवत्ता, हर गली और चौराहे पर',
    narration: 'Thank you for exploring PollutionMitra. By combining street-level IoT, satellite remote sensing, chemical speciation, and clean-air mobility routing, we make clean air actionable for every citizen.',
    narrationHi: 'पॉल्यूशनमित्र का दौरा करने के लिए धन्यवाद। जमीनी आईओटी सेंसर, उपग्रह डेटा, केमिकल स्पेक्ट्रोस्कोपी और स्वच्छ मार्ग नेविगेशन को जोड़कर हम हर नागरिक के लिए स्वच्छ हवा को सुलभ बनाते हैं।',
    duration: 12000,
  },
];

interface GuidedTourProps {
  onClose: () => void;
}

export default function GuidedTour({ onClose }: GuidedTourProps) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
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

  const currentTitle = lang === 'hi' ? currentStep.titleHi : currentStep.title;
  const currentCaption = lang === 'hi' ? currentStep.captionHi : currentStep.caption;
  const currentNarration = lang === 'hi' ? currentStep.narrationHi : currentStep.narration;

  const speak = (text: string) => {
    if (!voiceAvailable || muted) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speed;
    utt.pitch = 1;
    utt.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const startStep = (idx: number) => {
    const step = TOUR_STEPS[idx];
    if (!step) return;
    navigate(step.route);
    speak(lang === 'hi' ? step.narrationHi : step.narration);
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

  // Re-speak if language changes while playing
  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    if (voiceAvailable && !muted && playing) {
      window.speechSynthesis.cancel();
      const textToSpeak = newLang === 'hi' ? currentStep.narrationHi : currentStep.narration;
      const utt = new SpeechSynthesisUtterance(textToSpeak);
      utt.rate = speed;
      utt.lang = newLang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utt);
    }
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="badge badge-demo">GUIDED TOUR</span>
                  <span className="text-xs text-slate-400">Step {stepIndex + 1} of {TOUR_STEPS.length}</span>

                  {/* Language Selector: English / Hindi */}
                  <div className="flex items-center bg-navy-800 rounded-lg p-0.5 border border-navy-700 ml-2">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                        lang === 'en'
                          ? 'bg-cyan-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Switch to English"
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange('hi')}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                        lang === 'hi'
                          ? 'bg-amber-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="हिन्दी में समझें"
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">{currentTitle}</h2>
                {showCaptions && (
                  <p className="text-sm text-cyan-400 mt-1">{currentCaption}</p>
                )}
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 ml-4 flex-shrink-0 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Narration text (captions) */}
            {showCaptions && (
              <div className="bg-navy-800 rounded-xl p-3 mb-4 max-h-24 overflow-y-auto border border-navy-700">
                <p className="text-sm text-slate-200 leading-relaxed font-normal">{currentNarration}</p>
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

