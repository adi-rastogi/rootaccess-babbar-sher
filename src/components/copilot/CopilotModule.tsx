import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Download, Info } from 'lucide-react';
import { COPILOT_RESPONSES } from '../../data/demoData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'Hi! What can you help me with?',
  'Which neighborhood currently has the highest PM2.5?',
  'Which mask should I wear today: N95 or surgical?',
  'How does the Diwali AI pyrotechnic detector work?',
  'How is wind and thermal inversion affecting pollution?',
  'Is it safe to go for a morning run right now?',
  'Show me how eco-mobility routes minimize inhaled dosage',
];

// Helper to detect keyboard smashing or non-meaningful random strings
function isGibberish(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (clean.length < 2) return false;

  // Pure special characters or symbols
  if (/^[^a-z0-9]+$/i.test(clean)) return true;

  // Single character repeated 4+ times (e.g. "aaaaa", "11111")
  if (/^(.)\1{3,}$/.test(clean)) return true;

  // Common random keyboard mash sequences
  const mashPatterns = [
    'asdf', 'fdsa', 'hjkl', 'qwerty', 'zxcv', 'qwer', 'dfgh', 'jkl;',
    'sdfsdf', 'ghjk', 'xcvb', 'werty', 'poiuy', 'mnbvc', 'lkjh'
  ];
  if (mashPatterns.some(pat => clean.includes(pat)) && clean.length > 5) return true;

  // Check words without any vowels (English words of length > 3 usually have at least one vowel, except very few like 'dry', 'why')
  const words = clean.split(/\s+/);
  const nonVowelWord = words.some(w => w.length >= 4 && !/[aeiouy]/i.test(w));
  if (nonVowelWord) return true;

  // Check repetitive syllable loops e.g. "blablabla", "hahahahahaha" is fine but "sjdksjdk" is mash
  if (/([b-df-hj-np-tv-z]{4,})/i.test(clean)) {
    // 4+ consecutive consonants with no vowels usually indicates typing smash
    return true;
  }

  return false;
}

function getResponse(query: string): string {
  const raw = query.trim();
  const q = raw.toLowerCase();

  // 1. Check for Gibberish / Random keyboard smashing
  if (isGibberish(raw)) {
    return `🤔 **I couldn't quite understand that.**

It looks like you typed random or incomplete characters (\`"${raw}"\`).

Please type a meaningful environmental question! For example:
- *"Hi, how can you help me?"*
- *"What is the current AQI in RK Puram or Narela?"*
- *"Which mask should I wear outside today?"*
- *"How does the Diwali pyrotechnic burst detector work?"*
- *"Is it safe to jog in the morning?"*`;
  }

  // 2. Greetings and Polite Conversation
  if (/^(hi|hello|hey|heyy|namaste|hola|yo|sup|good\s*(morning|afternoon|evening|day)|greetings)[\s!.]*$/i.test(q)) {
    const greetings = [
      `👋 **Hello! Welcome to PollutionMitra.**\n\nI'm your **AI Environmental Intelligence Copilot**. I monitor real-time street-level PM2.5 sensors, track thermal inversion smog traps, calculate clean-air eco routes, and analyze Diwali chemical signatures.\n\nHow can I help you protect your health and explore air quality today?`,
      `🌿 **Namaste! Great to connect with you.**\n\nI'm PollutionMitra's live Environmental Copilot. All 8 Delhi ward IoT sensor nodes and satellite remote sensing feeds are synced. What neighborhood or environmental question would you like to check?`,
      `👋 **Hey there!**\n\nI'm ready to help with real-time Delhi air quality, clinical mask recommendations, Diwali firecracker burst forensics, and low-exposure transit paths. What's on your mind?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2b. "How are you" / "Who are you" / "What can you do"
  if (q.includes('how are you') || q.includes('how r u') || q.includes('how do you do')) {
    return `🟢 **I'm operating at 100% telemetry health!**\n\nAll sensor stations are streaming data, the Gaussian dispersion models are running, and our satellite AOD layer is live. How can I assist you with air quality today?`;
  }

  if (q.includes('who are you') || q.includes('what are you') || q.includes('what can you do') || q.includes('what do you do') || q.includes('help me')) {
    return `🤖 **I am PollutionMitra's AI Environmental Copilot.**\n\nHere is what I can do for you:\n1. 📊 **Hyperlocal AQI & PM2.5 Checks:** Ask about any Delhi neighborhood (Narela, RK Puram, CP, Dwarka, etc.).\n2. 🫁 **Clinical Health Precautions:** Get recommendations on N95/N99 masks, indoor HEPA purifiers, and exercise safety.\n3. 💥 **Diwali Forensic Detection:** Explain our dual-modality chemical speciation (Barium/Strontium) and acoustic shockwave detector.\n4. 🚲 **Clean-Air Eco Routes:** Help you choose travel corridors that reduce inhaled toxic particulate dose by up to 58%.\n5. 🛰️ **Satellite Pan-India Views:** Explain AOD smog layers, agricultural fires, and tropospheric NO₂ plumes.\n\nTry asking: *"Which area has the worst pollution right now?"* or *"Can I exercise outside this morning?"*`;
  }

  if (q.includes('thank') || q.includes('thanks') || q.includes('dhanyawad') || q.includes('shukriya')) {
    return `🙏 **You're very welcome!** Stay safe, breathe clean air, and remember to check your local ward sensor before planning outdoor activities. Feel free to ask whenever you need an update!`;
  }

  // 3. Health & Outdoor Activity Precautions (Jogging, Running, Mask, Asthma, Children)
  if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('walk') || q.includes('morning') || q.includes('outside') || q.includes('safe to go')) {
    return `🏃 **Outdoor Exercise & Exposure Advisory:**

- **Current Recommendation:** ⚠️ **Avoid early morning outdoor cardio (5:00 AM – 9:00 AM).**
- **Scientific Reason:** During winter mornings, severe **thermal inversion** drops the planetary boundary layer below 300 meters, trapping concentrated vehicular and particulate exhaust near the ground.
- **Safest Outdoor Window:** Mid-afternoon between **1:00 PM and 4:00 PM**, when solar radiation breaks the inversion layer and wind speeds allow moderate dispersion.
- **At-Risk Vulnerability:** Asthmatic individuals, elderly citizens, and children should keep strenuous activity indoors with a certified HEPA air purifier running.`;
  }

  if (q.includes('mask') || q.includes('n95') || q.includes('surgical') || q.includes('cloth') || q.includes('protection') || q.includes('inhaler')) {
    return `😷 **Clinical Mask & Filtration Efficacy Guide:**

1. **Certified N95 / FFP2 / N99 Respirators (Recommended):**
   - Filters **≥95% to 99%** of sub-micron particles down to $\\text{PM}_{0.3}$ via electrostatic non-woven melt-blown fiber.
   - Ensures an airtight facial seal preventing micro-leaks.

2. **Standard 3-Ply Surgical Masks:**
   - Filters only **~35%–40%** of ambient $\\text{PM}_{2.5}$ because lateral gaps allow unfilted air to bypass the filter media.

3. **Cloth / Bandana Masks:**
   - Filters **<15%** of fine particulates; completely ineffective against toxic smog and smoke aerosols.

💡 *Pro-Tip: Ensure your N95 respirator is snugly fitted without facial hair gaps for genuine pulmonary protection.*`;
  }

  if (q.includes('purifier') || q.includes('hepa') || q.includes('indoor') || q.includes('room') || q.includes('plant')) {
    return `🏠 **Indoor Air Quality & HEPA Purifier Guide:**

- **Filter Requirement:** Ensure True HEPA (H13 or H14 medical grade), which captures 99.97% of particles down to 0.3 microns. Avoid ozone-generating ionizers.
- **CADR (Clean Air Delivery Rate):** Minimum CADR should be at least **2/3 of your room's square footage**. For a 200 sq ft room, choose a purifier with CADR $\\ge 135\\text{ CFM}$.
- **Ventilation Strategy:** Keep windows sealed during peak smog hours (night & early morning). Run ventilation briefly between 1:30 PM - 3:30 PM when outdoor AQI dips.
- **Air-Purifying Plants:** Snake Plants (*Sansevieria*), Areca Palms, and Peace Lilies help supplement oxygen and absorb trace VOCs, though mechanical HEPA filtration is mandatory for $\\text{PM}_{2.5}$.`;
  }

  // 4. Diwali & Pyrotechnic Chemical Detector Queries
  if (q.includes('diwali') || q.includes('firecracker') || q.includes('cracker') || q.includes('burst') || q.includes('barium') || q.includes('strontium') || q.includes('pyro')) {
    return `🎆 **AI Pyrotechnic Chemical Speciation & Acoustic Burst Detector:**

Standard optical sensors only measure generic total PM mass without knowing if particles came from firecrackers or diesel trucks. **PollutionMitra solves this using dual-modality source apportionment:**

1. **XRF Optical Aerosol Spectrometry:**
   - **Barium (Ba) Surge (+840%):** Diagnostic green fire oxidizer unique to pyrotechnics.
   - **Strontium (Sr) Surge (+610%):** Signature red pyrotechnic flare tracer.
   - **Potassium Nitrate (KNO₃) (+1,280%):** Black powder propellant combustion.
   - **Carbon Monoxide (CO) Control (+6% flat):** Proves the spike is **NOT** from internal combustion vehicle engines!

2. **Acoustic Shockwave Microphone Sensor:**
   - Captures peak decibels (e.g. **96.4 dB – 104.8 dB SPL Peak**) with rapid transient rise-time ($<15\\text{ ms}$) matching explosive deflagration.

You can test this live on our [**Diwali Intelligence Page**](/diwali) and click **"💥 Trigger Burst Simulation"**!`;
  }

  // 5. Neighborhood Specific Queries
  if (q.includes('narela')) {
    return COPILOT_RESPONSES.narela;
  }
  if (q.includes('rk puram') || q.includes('rk-puram') || q.includes('rk sector')) {
    return `📍 **RK Puram Ward Intelligence (Node S002):**\n\n- **Current AQI:** 248 (*Very Poor*)\n- **PM2.5:** 198 µg/m³ (NAAQS safe limit is 60 µg/m³ — **3.3x over limit**)\n- **PM10:** 267 µg/m³\n- **Micro-Climate:** High vehicular density along Ring Road combined with South Delhi valley topography causing particulate pooling. Sensitive individuals should wear N95 masks outdoors.`;
  }
  if (q.includes('connaught') || q.includes('cp') || q.includes('central delhi')) {
    return `📍 **Connaught Place Central Ward (Node S001):**\n\n- **Current AQI:** 193 (*Moderate to Poor*)\n- **PM2.5:** 142 µg/m³\n- **PM10:** 198 µg/m³\n- **Micro-Climate:** Radial road geometry provides slightly better airflow circulation than North Delhi, but stop-and-go commercial traffic keeps midday carbon monoxide and particulate levels elevated.`;
  }
  if (q.includes('dwarka')) {
    return `📍 **Dwarka Sector 10 Ward (Node S003):**\n\n- **Current AQI:** 130 (*Moderate — Cleanest monitored sector today*)\n- **PM2.5:** 78 µg/m³\n- **PM10:** 112 µg/m³\n- **Micro-Climate:** Wide planned road sectors, open buffer corridors, and proximity to green belts maintain lower particulate retention compared to walled inner-city wards.`;
  }
  if (q.includes('highest') || q.includes('worst') || q.includes('most polluted') || q.includes('critical zone')) {
    return `🚨 **Highest Pollution Critical Zone:**

- **Top Hotspot:** **Narela Ward (North Fringe - Node S004)** with **AQI 289** and **PM2.5 of 224 µg/m³**.
- **Key Contributing Factors:**
  1. Industrial estate perimeter emissions & diesel truck thoroughfare.
  2. Geographic entry point for northwestern transboundary crop residue smoke (Punjab/Haryana).
  3. Low surface wind stagnation (2.2 km/h) preventing dispersion.
- **Second Highest:** RK Puram (AQI 248), followed by Lajpat Nagar (AQI 207).`;
  }

  // 6. Wind, Weather, Inversion & Stubble Burning
  if (q.includes('wind') || q.includes('weather') || q.includes('dispersion') || q.includes('inversion') || q.includes('stagnation')) {
    return COPILOT_RESPONSES.wind;
  }
  if (q.includes('stubble') || q.includes('parali') || q.includes('crop') || q.includes('punjab') || q.includes('haryana') || q.includes('farm fire')) {
    return `🌾 **Agricultural Stubble Burning (Parali) Forensics:**

- **Satellite Remote Sensing:** NASA VIIRS and MODIS satellites detect active thermal hotspots across Punjab and Haryana during late October to mid-November.
- **Wind Vector Dynamics:** When northwesterly winds blow between 12–20 km/h, the agricultural smoke plume travels across the Indo-Gangetic Plain directly into the Delhi bowl.
- **Chemical Fingerprint:** Biomass burning is characterized by high ratios of **Levoglucosan**, organic carbon (OC), and elevated Potassium (K) with lower black carbon (BC) relative to diesel exhaust.
- Check our [**Satellite Intelligence**](/satellite) page to view real-time VIIRS fire anomaly clusters overlaid on India's map!`;
  }

  // 7. Eco Routes & Inhaled Dosage
  if (q.includes('route') || q.includes('cycling') || q.includes('walk') || q.includes('navigation') || q.includes('travel') || q.includes('dosage')) {
    return COPILOT_RESPONSES.routes;
  }

  // 8. Sensors, Hardware & Calibration
  if (q.includes('sensor') || q.includes('calibrate') || q.includes('hardware') || q.includes('offline') || q.includes('accuracy') || q.includes('bam')) {
    return `📡 **Smart Sensor Network Architecture & Calibration:**

- **Hardware Tier:** Dual-laser optical particle counters (OPC) measuring light scattering across multiple bins (0.3 µm to 10 µm).
- **Hygrothermal Humidity Correction:** High humidity (>70% during winter fog) causes optical particle swelling. Our algorithm applies an automated empirical **RH correction curve** to eliminate false PM2.5 spikes.
- **Reference Co-Location:** Sensors are calibrated against CPCB reference Beta Attenuation Monitors (BAM) using an **adaptive Kalman filter**.
- **Offline Node Alert:** Node **S006 (Lajpat-Central)** is currently flagged *Offline (Battery 0%)* with automated maintenance tickets generated.`;
  }

  // 9. 3D LiDAR Micro-Canyon & Satellite Intelligence
  if (q.includes('canyon') || q.includes('3d') || q.includes('lidar') || q.includes('vortex') || q.includes('building')) {
    return `🏙️ **3D LiDAR Micro-Canyon Aerodynamics:**

- In dense urban corridors, multi-story buildings create an 'urban street canyon'.
- When perpendicular winds blow over the rooftops, an aerodynamic **recirculating back-eddy vortex** is formed.
- This traps vehicular emissions at pedestrian sidewalk level ($H/W \\ge 1.5$), making ground-level air up to **4x more toxic** than air measured just 25 meters higher at rooftop monitoring stations!
- You can inspect our interactive canyon simulation in the [**Innovations Lab**](/innovations).`;
  }

  if (q.includes('satellite') || q.includes('insat') || q.includes('sentinel') || q.includes('aod') || q.includes('space')) {
    return `🛰️ **Satellite Remote Sensing (ISRO & Copernicus):**

- **ISRO INSAT-3DR:** Geostationary optical sensor providing continuous 30-minute updates of Aerosol Optical Depth (AOD) across India.
- **Copernicus Sentinel-5P TROPOMI:** High-resolution tropospheric $\\text{NO}_2$ and carbon monoxide scans mapping industrial plumes.
- **Ground Conversion Formula:** Ground $\\text{PM}_{2.5} \\approx \\frac{\\text{AOD}}{\\text{PBLH} \\times f(\\text{RH})}$, scaled by the Planetary Boundary Layer Height.
- Explore the interactive Pan-India view in our [**Satellite Intelligence**](/satellite) section!`;
  }

  // 10. Filter out clearly off-topic non-environmental queries
  const offTopicKeywords = [
    'cricket', 'football', 'ipl', 'movie', 'film', 'actor', 'song', 'recipe',
    'cook', 'code', 'python', 'javascript', 'joke', 'dating', 'game', 'gaming',
    'president', 'prime minister', 'crypto', 'bitcoin', 'stock', 'share price'
  ];
  if (offTopicKeywords.some(kw => q.includes(kw))) {
    return `🌿 **Specialized Environmental Scope:**

I am PollutionMitra's **AI Environmental & Air Quality Copilot**. I specialize exclusively in atmospheric science, street-level air pollution, health protection advisories, and micro-climate modeling.

I'm unable to answer questions on general non-environmental topics, but please feel free to ask me anything about:
- 📍 Real-time AQI and PM2.5 in Delhi neighborhoods
- 🫁 Clinical mask efficacy and outdoor exercise safety
- 🎆 Diwali firecracker chemical detection and acoustic forensics
- 🛰️ Pan-India satellite smog and stubble fire tracking
- 🚲 Clean-air travel routes to reduce inhaled pollution`;
  }

  // 11. Generic helpful environmental fallback with context
  return `🌿 **PollutionMitra Environmental Intelligence:**

Regarding **"${raw}"**:
In our current Delhi monitoring network:
- **City-Wide Average PM2.5:** 153 µg/m³ (*Unhealthy / Poor Category*)
- **Highest Exposure Zone:** Narela (AQI 289 / PM2.5 224 µg/m³)
- **Lowest Exposure Zone:** Dwarka Sec 10 (AQI 130 / PM2.5 78 µg/m³)
- **Active Alerts:** Stagnant boundary layer winds (2.8 km/h) causing particulate pooling in North and East Delhi corridors.

Try asking about:
- *"Which mask should I wear today?"*
- *"Why is Narela AQI so high?"*
- *"How does the Diwali pyrotechnic detector work?"*
- *"Show me eco-route options"*`;
}

export default function CopilotModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `👋 **Welcome to PollutionMitra AI Environmental Copilot!** 🌿

I'm your intelligent environmental companion, grounded in our real-time telemetry datasets, satellite feeds, and chemical source apportionment models.

**Try asking me:**
- *"Hi!"* or *"What can you do?"*
- *"Which neighborhood has the highest PM2.5 right now?"*
- *"Which mask should I wear today: N95 or surgical?"*
- *"Is it safe to go for a morning run?"*
- *"How does the Diwali AI chemical burst detector work?"*
- *"Explain the 3D LiDAR micro-canyon vortex effect."*

Type a question below or pick a suggested query to get started! 🚀`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [voiceSupported] = useState('speechSynthesis' in window && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = getResponse(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setThinking(false);

      if (speakEnabled && 'speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(response.replace(/\*\*/g, '').replace(/[#*`]/g, ''));
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }
    }, 900 + Math.random() * 600);
  };

  const toggleVoice = () => {
    if (!voiceSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (voiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        sendMessage(text);
        setVoiceActive(false);
      };
      recognition.onerror = () => setVoiceActive(false);
      recognition.onend = () => setVoiceActive(false);
      recognition.start();
      recognitionRef.current = recognition;
      setVoiceActive(true);
    }
  };

  // Simple markdown-ish renderer
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc text-slate-300">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
      }
      if (line.includes('|')) {
        // Simple table row
        return <p key={i} className="font-mono text-xs text-slate-400 border-b border-navy-700 py-0.5">{line}</p>;
      }
      // Bold inline
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-slate-300 leading-relaxed">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot size={24} className="text-emerald-400" />
            AI Environmental Copilot
            <span className="badge badge-demo">Deterministic Demo Mode</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Data-grounded environmental analyst · No external LLM API in demo · All data DEMO/SIMULATED</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeakEnabled(!speakEnabled)}
            className={`btn-secondary ${speakEnabled ? 'border-emerald-500/40 text-emerald-400' : ''}`}
            title="Toggle spoken responses"
          >
            {speakEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {speakEnabled ? 'Spoken on' : 'Spoken off'}
          </button>
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="btn-secondary"
          >
            <RefreshCw size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat window */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`
                  w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                  ${msg.role === 'assistant'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-navy-700 border border-navy-600 text-slate-400'
                  }
                `}>
                  {msg.role === 'assistant' ? '🤖' : 'U'}
                </div>
                <div className={`
                  max-w-[80%] rounded-xl px-4 py-3 text-sm space-y-1
                  ${msg.role === 'assistant'
                    ? 'bg-navy-800 border border-navy-700'
                    : 'bg-navy-700 border border-navy-600 text-right'
                  }
                `}>
                  {msg.role === 'assistant' ? renderContent(msg.content) : (
                    <p className="text-slate-200">{msg.content}</p>
                  )}
                  <div className={`text-xs text-slate-600 pt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                    {msg.role === 'assistant' && <span className="ml-2 text-cyan-500/60">DEMO data · Not real measurements</span>}
                  </div>
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs">🤖</div>
                <div className="bg-navy-800 border border-navy-700 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-emerald-400/60"
                        style={{ animation: 'pulse 1s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="pt-3 border-t border-navy-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask about air quality, sensors, weather, Diwali, routes..."
                className="input-field flex-1"
              />
              {voiceSupported && (
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-lg border transition-all ${
                    voiceActive
                      ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                      : 'bg-navy-800 border-navy-600 text-slate-400 hover:text-slate-200'
                  }`}
                  title={voiceActive ? 'Stop listening' : 'Start voice input'}
                >
                  {voiceActive ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              <button onClick={() => sendMessage(input)} className="btn-primary" disabled={!input.trim() || thinking}>
                <Send size={14} />
              </button>
            </div>
            {!voiceSupported && (
              <p className="text-xs text-slate-600 mt-1">Voice input not available in this browser. Type your question instead.</p>
            )}
          </div>
        </div>

        {/* Suggested questions */}
        <div className="w-60 flex-shrink-0 hidden lg:flex flex-col gap-3">
          <div className="card">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1">
              <Bot size={12} />
              Try asking:
            </div>
            <div className="space-y-1.5">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-slate-400 hover:text-emerald-400 px-3 py-2 rounded-lg hover:bg-navy-700/40 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300/80">
                Demo mode: responses use local DEMO data. Production: server-side LLM with environmental tool access. No API keys exposed.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

