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
  'Which neighborhood has the highest PM2.5?',
  'Why is Narela marked as critical?',
  'How is wind affecting pollution?',
  'Compare Diwali pollution across years',
  'Which sensors are offline?',
  'Show me eco-route options',
  'Explain the pollution simulator',
];

function getResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('narela') || q.includes('critical')) return COPILOT_RESPONSES.narela;
  if (q.includes('diwali') || q.includes('festival') || q.includes('firecracker')) return COPILOT_RESPONSES.diwali;
  if (q.includes('wind') || q.includes('weather') || q.includes('dispersion')) return COPILOT_RESPONSES.wind;
  if (q.includes('route') || q.includes('cycling') || q.includes('walk')) return COPILOT_RESPONSES.routes;
  return COPILOT_RESPONSES.default;
}

export default function CopilotModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `**Welcome to PollutionMitra AI Environmental Copilot** 🌿

I'm a **deterministic demo assistant** grounded in this platform's DEMO dataset. I answer environmental questions using the simulated sensor data, Diwali analytics, weather information, and route estimates shown across PollutionMitra.

**What I can help with:**
- Current demo sensor readings and alerts
- Diwali pollution pattern analysis (educational, DEMO data)
- Wind & weather effects on pollution (illustrative associations)
- Eco-route comparisons (DEMO estimates)
- Critical zone explanations

**Important:** I am not connected to a real LLM API. In production, this would use a server-side LLM integration (API key secured, never exposed in frontend). All data I reference is DEMO/SIMULATED.

Try a question below, or type your own! →`,
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

