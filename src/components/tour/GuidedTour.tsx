import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Play, Pause, SkipForward, SkipBack, RotateCcw,
  Volume2, VolumeX, ChevronRight, Globe, CheckCircle2, Sparkles
} from 'lucide-react';

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
    narration: 'Welcome to PollutionMitra — your AI-powered neighborhood environmental intelligence platform. PollutionMitra helps citizens understand air quality at the street level, track pollution patterns, and make healthier decisions. This guided tour will walk you through all major features.',
    narrationHi: 'पॉल्यूशनमित्र में आपका स्वागत है — आपका एआई-संचालित मोहल्ला पर्यावरण इंटेलिजेंस प्लेटफॉर्म। पॉल्यूशनमित्र नागरिकों को गली स्तर पर वायु गुणवत्ता समझने, प्रदूषण पैटर्न ट्रैक करने और स्वस्थ निर्णय लेने में मदद करता है। यह गाइडेड टूर आपको सभी मुख्य फीचर्स दिखाएगा।',
    duration: 8500,
  },
  {
    id: 2, route: '/dashboard',
    title: '📊 Environmental Dashboard & Live Telemetry',
    titleHi: '📊 लाइव पर्यावरण डैशबोर्ड और एक्यूआई',
    caption: 'Real-time AQI, PM2.5, PM10 and sensor network status',
    captionHi: 'रीयल-टाइम एक्यूआई, पीएम2.5, पीएम10 और सेंसर नेटवर्क स्थिति',
    narration: 'The main dashboard serves as your environmental command center. You can monitor the Air Quality Index, PM2.5, PM10, temperature, humidity, and wind speed. Selecting any neighborhood updates all metrics instantly.',
    narrationHi: 'मुख्य डैशबोर्ड रीयल-टाइम पर्यावरण नियंत्रण केंद्र है। आप एयर क्वालिटी इंडेक्स, पीएम 2.5, पीएम 10, तापमान, नमी और हवा की गति देख सकते हैं। ऊपर दिए गए एरिया सेलेक्टर से आप अपने पसंदीदा इलाके का डेटा तुरंत देख सकते हैं।',
    duration: 9000,
  },
  {
    id: 3, route: '/map',
    title: '🗺️ Wind-Aware Pollution Flow Map',
    titleHi: '🗺️ वायु-प्रवाह प्रदूषण फैलाव मानचित्र',
    caption: 'Interactive GIS street-level pollution visualization',
    captionHi: 'इंटरैक्टिव जीआईएस सड़क-स्तरीय प्रदूषण मानचित्र',
    narration: 'Our Wind-Aware Pollution Flow Map renders real OpenStreetMap tiles with spatial heatmap overlays, IoT sensor markers, and wind direction vectors showing potential dispersion trajectories across neighborhoods.',
    narrationHi: 'यह हमारा प्रमुख नवाचार है — हवा के रुख के साथ प्रदूषण का फैलाव नक्शा। यह इंटरैक्टिव जीआईएस मैप प्रदूषण का हीटमैप, सेंसर मार्कर्स और हवा की दिशा दिखाता है। हर सेंसर पर क्लिक करके आप उस गली का विस्तृत पीएम 2.5 डेटा देख सकते हैं।',
    duration: 10000,
  },
  {
    id: 4, route: '/sensors',
    title: '📡 Smart IoT Sensor Network',
    titleHi: '📡 स्मार्ट आईओटी सेंसर नेटवर्क',
    caption: 'IoT environmental monitoring with calibration audits',
    captionHi: 'आईओटी पर्यावरणीय निगरानी व स्वचालित कैलिब्रेशन',
    narration: 'The Smart Sensor Network monitors optical PM2.5, PM10, temperature, humidity, and battery health across all Delhi wards, with automated hygrothermal humidity calibration curves.',
    narrationHi: 'स्मार्ट सेंसर नेटवर्क दिल्ली के सभी वार्डों में पीएम 2.5, पीएम 10, तापमान, नमी और बैटरी की स्थिति की निगरानी करता है। सर्दियों के कोहरे में यह ऑटोमैटिक नमी करेक्शन लगाकर सही आंकड़े देता है।',
    duration: 9000,
  },
  {
    id: 5, route: '/canyon',
    title: '🏙️ 3D LiDAR Micro-Canyon Dispersion',
    titleHi: '🏙️ 3डी लिडार शहरी कैन्यन फैलाव मॉडल',
    caption: 'Aerodynamic street vortex trapping & building geometry',
    captionHi: 'इमारतों के बीच वायु-भंवर और सड़क स्तर पर जहरीला धुआं',
    narration: 'The 3D LiDAR Micro-Canyon module models urban aerodynamic vortex trapping based on Oke 1988 meteorology. When building height exceeds street width (H/W > 0.7), wind enters the skimming regime, creating a stationary recirculating eddy that traps vehicle exhaust at pedestrian sidewalk level — up to 5x higher than rooftop air.',
    narrationHi: '3डी लिडार शहरी कैन्यन सेक्शन ऊंची इमारतों के बीच हवा के भंवर और धुएं के जमाव को दिखाता है। जब इमारतों की ऊंचाई सड़क की चौड़ाई से ज्यादा होती है, तो हवा छत के ऊपर से निकल जाती है और सड़क स्तर पर एक गोल भंवर बन जाता है, जिससे नीचे चलने वाले नागरिकों को छत के मुकाबले 5 गुना अधिक जहरीली हवा सांस में लेनी पड़ती है।',
    duration: 12000,
  },
  {
    id: 6, route: '/critical-zones',
    title: '🚨 Critical Hotspot Zones',
    titleHi: '🚨 क्रिटिकल प्रदूषण हॉटस्पॉट क्षेत्र',
    caption: 'Automated zone identification with transparent rationale',
    captionHi: 'पारदर्शी अलर्ट कारणों के साथ स्वचालित अति-संवेदनशील क्षेत्र पहचान',
    narration: 'The Critical Zones module automatically identifies areas requiring urgent mitigation. Every alert includes measured values, standard NAAQS thresholds, severity levels, and transparent evidence.',
    narrationHi: 'क्रिटिकल ज़ोन मॉड्यूल स्वचालित रूप से उन इलाकों की पहचान करता है जहां प्रदूषण खतरनाक स्तर पर है। हर चेतावनी में मापा गया मान, सुरक्षित सीमा, समय और अलर्ट का ठोस वैज्ञानिक कारण पारदर्शी रूप से दर्ज होता है।',
    duration: 9000,
  },
  {
    id: 7, route: '/satellite',
    title: '🛰️ Pan-India Satellite Radar',
    titleHi: '🛰️ अखिल भारतीय उपग्रह खुफिया नक्शा',
    caption: 'ISRO INSAT-3DR AOD, Sentinel-5P NO2 & Farm Fires',
    captionHi: 'इसरो उपग्रह एरोसोल धुंध, नाइट्रोजन डाइऑक्साइड और पराली की आग',
    narration: 'The Satellite Intelligence section fuses ISRO INSAT-3DR geostationary scans with Copernicus Sentinel-5P TROPOMI and NASA VIIRS thermal fire anomalies, tracking regional smog across India.',
    narrationHi: 'उपग्रह खुफिया सेक्शन इसरो के इनसैट 3डीआर और यूरोपियन सेंटिनल 5पी डेटा को मिलाकर पूरे भारत में फैले स्मॉग, औद्योगिक गैसों और पंजाब-हरियाणा में पराली जलाने की थर्मल हॉटस्पॉट्स को लाइव ट्रैक करता है।',
    duration: 10000,
  },
  {
    id: 8, route: '/diwali',
    title: '🎆 Diwali Chemical & Acoustic Detector',
    titleHi: '🎆 दिवाली स्मॉग व पटाखे धमाका डिटेक्टर',
    caption: 'Chemical Speciation & Acoustic Shockwave Forensic Intelligence',
    captionHi: 'रासायनिक स्पेक्ट्रोस्कोपी और अल्ट्रासोनिक ध्वनि शॉकवेव डिटेक्टर',
    narration: 'Our proprietary Diwali detector isolates illegal fireworks from traffic exhaust by identifying stoichiometric surges in Barium (+840%) and Strontium paired with >95 dB acoustic microphone shockwaves.',
    narrationHi: 'दिवाली इंटेलिजेंस सेक्शन में हमारा अनूठा एआई पायरोटेक्निक केमिकल और साउंड शॉकवेव डिटेक्टर है। यह बेरियम और स्ट्रॉन्शियम केमिकल तथा 95 डेसिबल से अधिक के धमाकों को पकड़कर पटाखों के प्रदूषण को सामान्य ट्रैफिक से अलग करता है।',
    duration: 11000,
  },
  {
    id: 9, route: '/health',
    title: '🫁 Precision Predictive Health Engine',
    titleHi: '🫁 सटीक व्यक्तिगत स्वास्थ्य एवं पल्मोनरी सुरक्षा',
    caption: 'Personalized vulnerability cohorts & diurnal safety windows',
    captionHi: 'व्यक्तिगत स्वास्थ्य जोखिम प्रोफाइल और सुरक्षित व्यायाम समय',
    narration: 'Precision Health alerts tailor advisories for pediatric, asthma, cardiac, and geriatric cohorts. It visualizes particulate deposition depth in lungs, recommends certified N95 masks, and calculates indoor HEPA CADR.',
    narrationHi: 'सटीक स्वास्थ्य सेक्शन बच्चों, अस्थमा, हृदय रोगियों और बुजुर्गों के लिए अलग-अलग सलाह देता है। यह फेफड़ों में कणों के असर को समझाता है, एन 95 मास्क की प्रभावशीलता बताता है और कमरे के लिए एयर प्यूरीफायर की क्षमता की गणना करता है।',
    duration: 11000,
  },
  {
    id: 10, route: '/weather',
    title: '🌤️ Weather Intelligence & Inversion',
    titleHi: '🌤️ मौसम विज्ञान और तापमान उलटाव (इनवर्जन)',
    caption: 'Meteorological telemetry and thermal inversion dynamics',
    captionHi: 'मौसम डेटा और प्रदूषण फैलाव का सहसंबंध',
    narration: 'The Weather module integrates meteorological wind velocity and temperature, illustrating how winter thermal inversion traps stagnant cold air and fine particulates near ground level.',
    narrationHi: 'मौसम इंटेलिजेंस सेक्शन हवा की रफ्तार और तापमान दिखाता है। यह समझाता है कि कैसे सर्दियों में थर्मल इनवर्जन की वजह से ठंडी हवा जमीन के पास भारी होकर जहरीले धुएं को जमा कर देती है।',
    duration: 9000,
  },
  {
    id: 11, route: '/community',
    title: '👥 Citizen Reporting & Balcony Host Hub',
    titleHi: '👥 जनभागीदारी, रिपोर्टिंग व बालकनी सेंसर',
    caption: 'Crowdsourced ground surveillance with multi-citizen verification',
    captionHi: 'सत्यापित नागरिक निगरानी और त्वरित समाधान कार्रवाई',
    narration: 'Citizens can report visible pollution sources and pledge residential balconies to host community sensors. Multi-citizen confirmations trigger prioritized municipal anti-smog gun dispatches.',
    narrationHi: 'नागरिक कूड़ा जलाने, निर्माण धूल और औद्योगिक धुएं की तुरंत फोटो और जीपीएस लोकेशन के साथ रिपोर्ट कर सकते हैं और बालकनी सेंसर होस्ट कर सकते हैं। सत्यापित रिपोर्टों पर नगर निगम द्वारा एंटी-स्मॉग गन भेजी जाती है।',
    duration: 9500,
  },
  {
    id: 12, route: '/routes',
    title: '🚲 Smart Eco-Mobility Routes',
    titleHi: '🚲 स्मार्ट इको-मोबिलिटी स्वच्छ मार्ग',
    caption: 'Minimize cumulative inhaled particulate dosage',
    captionHi: 'फेफड़ों में जाने वाले जहरीले कणों की मात्रा को कम करें',
    narration: 'Smart Eco-Routes calculates walking and cycling corridors that reduce cumulative inhaled particulate dosage by up to 58%, guiding commuters along tree-canopied residential lanes.',
    narrationHi: 'स्मार्ट इको-रूट्स पैदल और साइकिल चलने वालों के लिए ऐसे रास्ते चुनता है जहां सांस में जाने वाला प्रदूषण 58 प्रतिशत तक कम हो जाता है, जिससे अस्थमा और हृदय रोगियों की सुरक्षा होती है।',
    duration: 10000,
  },
  {
    id: 13, route: '/copilot',
    title: '🤖 AI Environmental Copilot',
    titleHi: '🤖 एआई पर्यावरण कोपायलट',
    caption: 'Natural conversational assistant for air quality inquiries',
    captionHi: 'बुद्धिमान वायु गुणवत्ता और स्वास्थ्य सलाहकार',
    narration: 'The AI Copilot answers questions about live sensor readings, clinical N95 mask advice, morning exercise safety, and Diwali forensics with natural conversation and voice interaction.',
    narrationHi: 'हमारा एआई कोपायलट आपके सभी सवालों का उत्तर देता है — जैसे आज कौन सा मास्क पहनें, सुबह दौड़ना सुरक्षित है या नहीं, और दिवाली डिटेक्टर कैसे काम करता है।',
    duration: 9500,
  },
  {
    id: 14, route: '/dashboard',
    title: '🌿 PollutionMitra — Mission Summary',
    titleHi: '🌿 पॉल्यूशनमित्र — निष्कर्ष एवं विज़न',
    caption: 'Air Quality, Street by Street',
    captionHi: 'वायु गुणवत्ता, हर गली और चौराहे पर',
    narration: 'Thank you for exploring PollutionMitra. By fusing hyper-local IoT networks, satellite remote sensing, chemical speciation, and micro-canyon CFD modeling, we make clean air actionable for every citizen.',
    narrationHi: 'पॉल्यूशनमित्र का दौरा करने के लिए धन्यवाद। जमीनी आईओटी सेंसर, उपग्रह डेटा, केमिकल स्पेक्ट्रोस्कोपी और 3डी लिडार शहरी मॉडलों को जोड़कर हम हर नागरिक के लिए स्वच्छ हवा को सुलभ बनाते हैं।',
    duration: 12000,
  },
];

interface GuidedTourProps {
  onClose: () => void;
}

export default function GuidedTour({ onClose }: GuidedTourProps) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [hasChosenLang, setHasChosenLang] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Dedicated Audio Element for guaranteed 100% native speech
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<any>(null);

  const currentStep = TOUR_STEPS[stepIndex];

  const currentTitle = lang === 'hi' ? currentStep.titleHi : currentStep.title;
  const currentCaption = lang === 'hi' ? currentStep.captionHi : currentStep.caption;
  const currentNarration = lang === 'hi' ? currentStep.narrationHi : currentStep.narration;

  // Fallback speech synthesizer if audio tag fails
  const playSpeechFallback = (targetLang: 'en' | 'hi', stepIdx: number) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const step = TOUR_STEPS[stepIdx];
      if (!step) return;
      const text = targetLang === 'hi' ? step.narrationHi : step.narration;
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = speed;
      utt.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN';
      const voices = window.speechSynthesis.getVoices();
      if (targetLang === 'hi') {
        const hiVoice = voices.find(v =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('lekha') ||
          v.name.toLowerCase().includes('hindi')
        );
        if (hiVoice) utt.voice = hiVoice;
      } else {
        const enVoice = voices.find(v =>
          v.lang.toLowerCase().startsWith('en-in') ||
          v.name.toLowerCase().includes('rishi') ||
          v.name.toLowerCase().includes('india')
        );
        if (enVoice) utt.voice = enVoice;
      }
      window.speechSynthesis.speak(utt);
    } catch {
      // Speech synthesis error fallback
    }
  };

  // Primary Audio Player: plays crystal-clear native audio files (Lekha for Hindi, Rishi for English)
  const playAudioVoice = (targetLang: 'en' | 'hi', stepIdx: number) => {
    if (muted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.playbackRate = speed;
        audio.currentTime = 0;
        // Prioritize WAV: byte-0 instant playback without range header requirement
        audio.src = `/audio/step_${stepIdx + 1}_${targetLang}.wav`;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('WAV play failed, attempting M4A fallback:', err);
            audio.src = `/audio/step_${stepIdx + 1}_${targetLang}.m4a`;
            audio.play().catch((m4aErr) => {
              console.warn('M4A fallback failed, attempting Web Speech:', m4aErr);
              playSpeechFallback(targetLang, stepIdx);
              runFallbackTimer(stepIdx, targetLang);
            });
          });
        }
      } else {
        playSpeechFallback(targetLang, stepIdx);
        runFallbackTimer(stepIdx, targetLang);
      }
    } catch (e) {
      console.warn('Audio play error:', e);
      playSpeechFallback(targetLang, stepIdx);
      runFallbackTimer(stepIdx, targetLang);
    }
  };

  const runFallbackTimer = (idx: number, targetLang: 'en' | 'hi', customDuration?: number) => {
    clearInterval(progressRef.current);
    const dur = customDuration || 14000;
    const interval = 100;
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / dur) * 100);
      if (elapsed >= dur) {
        clearInterval(progressRef.current);
        if (idx + 1 < TOUR_STEPS.length) {
          const nextIdx = idx + 1;
          setStepIndex(nextIdx);
          startStep(nextIdx, targetLang);
        } else {
          setPlaying(false);
          setProgress(100);
        }
      }
    }, interval);
  };

  const startStep = (idx: number, targetLang: 'en' | 'hi' = lang) => {
    const step = TOUR_STEPS[idx];
    if (!step) return;
    navigate(step.route);
    setProgress(0);
    clearInterval(progressRef.current);

    if (muted) {
      runFallbackTimer(idx, targetLang, step.duration);
    } else {
      playAudioVoice(targetLang, idx);
    }
  };

  // Synchronized timeupdate handler
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      const pct = (audio.currentTime / audio.duration) * 100;
      setProgress(pct);
    }
  };

  // Advance step when voice track finishes
  const handleEnded = () => {
    if (stepIndex + 1 < TOUR_STEPS.length) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      startStep(nextIdx, lang);
    } else {
      setPlaying(false);
      setProgress(100);
    }
  };

  // Launch tour in selected language
  const selectLanguageAndStart = (chosenLang: 'en' | 'hi') => {
    setLang(chosenLang);
    setHasChosenLang(true);
    setStepIndex(0);
    setPlaying(true);
    startStep(0, chosenLang);
  };

  // Switch language during tour
  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    if (playing) {
      startStep(stepIndex, newLang);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearInterval(progressRef.current);
    };
  }, []);

  const handlePrev = () => {
    clearInterval(progressRef.current);
    if (audioRef.current) audioRef.current.pause();
    const newIdx = Math.max(0, stepIndex - 1);
    setStepIndex(newIdx);
    setPlaying(true);
    startStep(newIdx, lang);
  };

  const handleNext = () => {
    clearInterval(progressRef.current);
    if (audioRef.current) audioRef.current.pause();
    const newIdx = Math.min(TOUR_STEPS.length - 1, stepIndex + 1);
    setStepIndex(newIdx);
    setPlaying(true);
    startStep(newIdx, lang);
  };

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
      clearInterval(progressRef.current);
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.pause();
    } else {
      setPlaying(true);
      if (audioRef.current && audioRef.current.src && !audioRef.current.ended) {
        audioRef.current.play().catch(() => startStep(stepIndex, lang));
      } else {
        startStep(stepIndex, lang);
      }
    }
  };

  const handleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
    if (newMuted) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      runFallbackTimer(stepIndex, lang);
    } else {
      clearInterval(progressRef.current);
      startStep(stepIndex, lang);
    }
  };

  const handleRestart = () => {
    clearInterval(progressRef.current);
    if (audioRef.current) audioRef.current.pause();
    setStepIndex(0);
    setPlaying(true);
    startStep(0, lang);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end">
      {/* Hidden dedicated HTML5 Audio element for 100% native speech */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
      />
      {/* 1. UPFRONT LANGUAGE SELECTION MODAL */}
      {!hasChosenLang ? (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-navy-900 border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mx-auto text-3xl">
              🌿
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                PollutionMitra Guided Tour
              </h2>
              <p className="text-sm text-amber-300 font-bold">
                पॉल्यूशनमित्र गाइडेड टूर में आपका स्वागत है
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Select your preferred tour language / कृपया टूर की भाषा चुनें:
              </p>
            </div>

            {/* Language Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => selectLanguageAndStart('hi')}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-600/30 to-navy-800 border-2 border-amber-500 hover:border-amber-400 hover:scale-[1.02] text-left transition-all cursor-pointer shadow-lg shadow-amber-500/10 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">🇮🇳</span>
                  <span className="badge bg-amber-500 text-navy-950 font-bold text-[10px]">शुद्ध हिन्दी</span>
                </div>
                <div className="text-base font-black text-white group-hover:text-amber-300">
                  हिन्दी में समझें
                </div>
                <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                  पूरी आवाज और विवरण शुद्ध हिन्दी में सुनें
                </div>
              </button>

              <button
                onClick={() => selectLanguageAndStart('en')}
                className="p-4 rounded-xl bg-gradient-to-br from-cyan-600/20 to-navy-800 border-2 border-cyan-500/50 hover:border-cyan-400 hover:scale-[1.02] text-left transition-all cursor-pointer shadow-lg shadow-cyan-500/10 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">🇬🇧</span>
                  <span className="badge bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">ENGLISH</span>
                </div>
                <div className="text-base font-black text-white group-hover:text-cyan-300">
                  English Walkthrough
                </div>
                <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Full audio tour with standard environmental terminology
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-navy-800 flex justify-center">
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Skip Tour &amp; Explore Dashboard Directly ✕
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. ACTIVE TOUR HUD */
        <div className="relative w-full max-w-3xl mx-auto mb-6 pointer-events-auto px-4">
          <div className="bg-navy-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
            {/* Progress bar */}
            <div className="h-1.5 bg-navy-800 relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="badge badge-demo">GUIDED TOUR</span>
                    <span className="text-xs text-slate-400 font-mono">
                      Step {stepIndex + 1} of {TOUR_STEPS.length}
                    </span>

                    {/* Language Switcher Pill */}
                    <div className="flex items-center bg-navy-950 rounded-lg p-0.5 border border-navy-700 ml-2">
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          lang === 'en'
                            ? 'bg-cyan-500 text-navy-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Switch to English"
                      >
                        EN
                      </button>
                      <button
                        onClick={() => handleLanguageChange('hi')}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          lang === 'hi'
                            ? 'bg-amber-500 text-navy-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="हिन्दी में समझें"
                      >
                        हिन्दी
                      </button>
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{currentTitle}</h2>
                  {showCaptions && (
                    <p className="text-xs sm:text-sm text-cyan-400 mt-0.5 font-medium">{currentCaption}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white ml-2 p-1.5 rounded-lg hover:bg-navy-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Narration text (captions) */}
              {showCaptions && (
                <div className="bg-navy-950/90 rounded-xl p-3.5 mb-4 max-h-24 overflow-y-auto border border-navy-700/80">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {currentNarration}
                  </p>
                </div>
              )}

              {/* Step indicator dots */}
              <div className="flex gap-1 mb-4 flex-wrap">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setStepIndex(i);
                      setPlaying(true);
                      startStep(i, lang);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === stepIndex ? 'bg-cyan-400 w-5' :
                      i < stepIndex ? 'bg-emerald-500 w-2' : 'bg-navy-700 w-2'
                    }`}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleRestart} className="btn-secondary text-xs py-1.5 px-2.5 cursor-pointer">
                  <RotateCcw size={13} />
                  Restart
                </button>
                <button
                  onClick={handlePrev}
                  disabled={stepIndex === 0}
                  className="btn-secondary text-xs py-1.5 px-2.5 disabled:opacity-40 cursor-pointer"
                >
                  <SkipBack size={13} />
                  Prev
                </button>
                <button onClick={handlePlayPause} className="btn-primary text-xs py-1.5 px-4 cursor-pointer">
                  {playing ? <Pause size={13} /> : <Play size={13} />}
                  {playing ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={stepIndex === TOUR_STEPS.length - 1}
                  className="btn-secondary text-xs py-1.5 px-2.5 disabled:opacity-40 cursor-pointer"
                >
                  Next
                  <SkipForward size={13} />
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleMute}
                  className={`btn-secondary text-xs py-1.5 px-2.5 cursor-pointer ${muted ? 'text-slate-500' : 'text-emerald-400'}`}
                  title={muted ? 'Unmute voice narration' : 'Mute narration'}
                >
                  {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {muted ? 'Unmute' : 'Voice On'}
                </button>
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`btn-secondary text-xs py-1.5 px-2.5 cursor-pointer ${showCaptions ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                  {showCaptions ? 'Hide Text' : 'Show Text'}
                </button>
                <select
                  value={speed}
                  onChange={e => handleSpeedChange(Number(e.target.value))}
                  className="select-field text-xs py-1 px-1.5 cursor-pointer"
                >
                  <option value={0.75}>0.75×</option>
                  <option value={1}>1×</option>
                  <option value={1.25}>1.25×</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
