import { Info, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../App';

export default function DemoBanner() {
  const { demoMode, setDemoMode } = useApp();

  if (!demoMode) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-medium border-b border-slate-800 flex-shrink-0 z-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex-shrink-0 inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
          <Sparkles size={11} />
          Demo Mode
        </span>
        <span className="text-slate-200 truncate">
          Interactive Evaluation Mode — Particulate telemetry, wind vectors, and model forecasts are simulated for demonstration.
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <button
          onClick={() => setDemoMode(false)}
          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 border border-slate-700"
        >
          <CheckCircle2 size={12} className="text-emerald-400" />
          Switch to Live Feed
        </button>
        <button
          onClick={() => setDemoMode(false)}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          title="Dismiss Banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
