import { useState } from 'react';
import { Users, MapPin, Camera, Send, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { COMMUNITY_REPORTS } from '../../data/demoData';

const CATEGORIES = [
  { id: 'smoke', label: 'Smoke / Burning', icon: '🔥' },
  { id: 'dust', label: 'Dust / Road', icon: '🌪️' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'industrial', label: 'Industrial', icon: '🏭' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️' },
  { id: 'other', label: 'Other', icon: '⚠️' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  submitted: { label: 'Submitted', color: '#94a3b8', icon: Clock },
  under_review: { label: 'Under Review', color: '#eab308', icon: Clock },
  verified: { label: 'Verified', color: '#22c55e', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#ef4444', icon: XCircle },
  resolved: { label: 'Resolved', color: '#06b6d4', icon: CheckCircle },
};

export default function CommunityReports() {
  const [reports, setReports] = useState(COMMUNITY_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'smoke', description: '', neighborhood: 'cp' });
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = reports.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = {
      id: `R${Date.now()}`,
      category: form.category,
      title: `${CATEGORIES.find(c => c.id === form.category)?.label} report`,
      neighborhood: form.neighborhood,
      lat: 28.63, lng: 77.22,
      description: form.description,
      status: 'submitted',
      xp: 10,
      timestamp: new Date().toISOString(),
      reporter: 'Demo Explorer',
      photos: 0,
    };
    setReports(prev => [newReport, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Community Pollution Reporting
            <span className="badge badge-demo">DEMO</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Citizen environmental monitoring · Moderated verification · Privacy protected</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Send size={14} />
          Submit Report
        </button>
      </div>

      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle size={18} className="text-emerald-400" />
          <div>
            <div className="text-emerald-400 font-semibold text-sm">Report submitted! +10 XP earned (DEMO)</div>
            <div className="text-slate-500 text-xs">Reports go through moderation before appearing publicly. Community reports ≠ air quality measurements.</div>
          </div>
        </div>
      )}

      {/* Submit form */}
      {showForm && (
        <div className="card border border-navy-600 animate-fade-in">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Send size={16} className="text-emerald-400" />
            New Pollution Report
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Pollution Type</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={`p-3 rounded-lg text-center border transition-all ${
                      form.category === cat.id
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-navy-600 bg-navy-900 hover:border-navy-500'
                    }`}
                  >
                    <div className="text-2xl">{cat.icon}</div>
                    <div className="text-xs text-slate-400 mt-1">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Location / Neighborhood</label>
                <select
                  value={form.neighborhood}
                  onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                  className="select-field w-full"
                >
                  <option value="cp">Connaught Place</option>
                  <option value="rk">RK Puram</option>
                  <option value="dw">Dwarka</option>
                  <option value="nm">Narela</option>
                  <option value="jn">Janakpuri</option>
                  <option value="lr">Lajpat Nagar</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Photos (DEMO — upload not wired)</label>
                <div className="border border-dashed border-navy-600 rounded-lg p-4 text-center text-slate-500 text-xs cursor-not-allowed">
                  <Camera size={20} className="mx-auto mb-1 opacity-40" />
                  Photo upload planned · Not active in demo
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what you observed — be specific about location, time, and what you saw or smelled..."
                className="input-field min-h-[80px] resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                <Send size={14} />
                Submit Report (+10 XP)
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
            <p className="text-xs text-slate-600">Community observations are not air quality measurements. Reports undergo moderation before verification. Location will be approximate to protect privacy.</p>
          </form>
        </div>
      )}

      {/* Filter & search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="select-field">
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {filtered.map(report => {
          const statusCfg = STATUS_CONFIG[report.status];
          const StatusIcon = statusCfg?.icon || Clock;
          const cat = CATEGORIES.find(c => c.id === report.category);
          return (
            <div key={report.id} className="card-hover">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="text-3xl">{cat?.icon || '⚠️'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-white text-sm">{report.title}</span>
                    <span
                      className="badge"
                      style={{ background: (statusCfg?.color || '#94a3b8') + '22', color: statusCfg?.color || '#94a3b8' }}
                    >
                      <StatusIcon size={10} />
                      {statusCfg?.label || report.status}
                    </span>
                    <span className="badge badge-demo">DEMO</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={11} />{report.neighborhood.toUpperCase()}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{report.timestamp.split('T')[0]}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{report.reporter}</span>
                    {report.photos > 0 && <span className="flex items-center gap-1"><Camera size={11} />{report.photos} photo{report.photos > 1 ? 's' : ''}</span>}
                    <span className="text-emerald-400">+{report.xp} XP {report.status === 'verified' ? 'earned' : 'pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 text-xs text-slate-500">
        Community reports are citizen observations and are NOT air quality measurements. They undergo moderation before verification.
        Photos are validated for relevance. Location accuracy is approximate. Personal details are not displayed publicly.
        Reports earn XP only after verification by a moderator.
      </div>
    </div>
  );
}

