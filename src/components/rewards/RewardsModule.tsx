import { Trophy, Star, Shield, Flame, Leaf, Target } from 'lucide-react';
import { DEMO_USER, LEADERBOARD } from '../../data/demoData';

export default function RewardsModule() {
  const user = DEMO_USER;
  const progressPct = (user.xp / user.nextLevelXp) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          PollutionMitra Rewards
          <span className="badge badge-demo">DEMO gamification</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Quality-weighted community contribution rewards · XP for verified reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile card */}
        <div className="card lg:col-span-1 flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-400 mb-3">
            DE
          </div>
          <h2 className="text-white font-bold text-lg">{user.name}</h2>
          <div className="badge bg-emerald-500/20 text-emerald-400 mt-1">Level {user.level} — Eco Guardian</div>
          <div className="text-slate-400 text-sm mt-1">Rank #{user.rank} of 1,248 contributors</div>

          {/* XP progress */}
          <div className="w-full mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{user.xp} XP</span>
              <span>{user.nextLevelXp} XP (Level {user.level + 1})</span>
            </div>
            <div className="h-2.5 bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 text-center mt-1">{Math.round(progressPct)}% to next level</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 w-full mt-6">
            {[
              { label: 'Reports', value: '14' },
              { label: 'Verified', value: '9' },
              { label: 'Cleanups', value: '2' },
            ].map(s => (
              <div key={s.label} className="bg-navy-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="card">
          <div className="section-title"><Trophy size={16} className="text-yellow-400" />Achievements</div>
          <div className="grid grid-cols-4 gap-3">
            {user.badges.map(badge => (
              <div
                key={badge.id}
                className={`flex flex-col items-center text-center p-3 rounded-lg border ${
                  badge.earned
                    ? 'border-yellow-500/30 bg-yellow-500/10'
                    : 'border-navy-700 bg-navy-900 opacity-40'
                }`}
                title={badge.name}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-xs text-slate-400 mt-1 leading-tight">{badge.name}</span>
                {!badge.earned && <span className="text-xs text-slate-600 mt-0.5">Locked</span>}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 mb-2">XP Rules (Configurable)</div>
            {[
              { action: 'Valid report submitted', xp: '+10 XP' },
              { action: 'Report verified by moderator', xp: '+40 XP' },
              { action: 'Useful photo evidence', xp: '+15 XP' },
              { action: 'Verified community cleanup', xp: '+50 XP' },
            ].map(r => (
              <div key={r.action} className="flex justify-between text-xs">
                <span className="text-slate-400">{r.action}</span>
                <span className="text-emerald-400 font-mono">{r.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution history */}
        <div className="card">
          <div className="section-title"><Star size={16} className="text-cyan-400" />Recent Contributions</div>
          <div className="space-y-2">
            {user.contributions.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-navy-900 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-slate-200">{c.type}</div>
                  <div className="text-xs text-slate-500">{c.date}</div>
                </div>
                <span className="text-emerald-400 text-xs font-bold">+{c.xp} XP</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-600">XP rewards quality and verification — not report volume. Future rewards: eco-products, certificates, partner benefits.</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="section-title">
          <Trophy size={16} className="text-yellow-400" />
          Monthly Leaderboard
          <span className="badge badge-demo ml-auto">DEMO</span>
        </div>
        <div className="space-y-2">
          {LEADERBOARD.map(entry => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                entry.name === 'Demo Explorer'
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-navy-900 hover:bg-navy-800'
              }`}
            >
              <span className="text-lg w-8 text-center font-bold text-slate-400">
                {entry.badge || `#${entry.rank}`}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {entry.name}
                  {entry.name === 'Demo Explorer' && <span className="badge badge-demo text-xs">You</span>}
                </div>
                <div className="text-xs text-slate-500">{entry.neighborhood} · Level {entry.level}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">{entry.xp.toLocaleString()} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

