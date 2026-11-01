import { useState } from 'react';
import {
  Users, MapPin, Camera, Send, CheckCircle, Clock, XCircle, Search,
  ThumbsUp, ShieldCheck, Radio, Award, AlertTriangle, Truck, Building2
} from 'lucide-react';
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

// Initial extended reports with citizen confirmation counts
const ENHANCED_REPORTS = COMMUNITY_REPORTS.map((r, i) => ({
  ...r,
  confirmations: 4 + (i * 3),
  hasConfirmed: false,
  municipalAction: i === 0 ? 'MCD Anti-Smog Gun Dispatched (ETA 12m)' : i === 1 ? 'Site Inspection Notice Issued' : null,
}));

export default function CommunityReports() {
  const [reports, setReports] = useState(ENHANCED_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgedSuccess, setPledgedSuccess] = useState(false);
  const [form, setForm] = useState({ category: 'smoke', description: '', neighborhood: 'cp' });
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = reports.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const handleConfirmReport = (reportId: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const hasConfirmed = !r.hasConfirmed;
        return {
          ...r,
          confirmations: hasConfirmed ? r.confirmations + 1 : r.confirmations - 1,
          hasConfirmed,
        };
      }
      return r;
    }));
  };

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
      reporter: 'You (Citizen Explorer)',
      photos: 0,
      confirmations: 1,
      hasConfirmed: true,
      municipalAction: 'Automated Alert Sent to Ward Zonal Officer',
    };
    setReports(prev => [newReport, ...prev]);
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 3500);
  };

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPledgedSuccess(true);
    setTimeout(() => {
      setPledgedSuccess(false);
      setShowPledgeModal(false);
    }, 2800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Community Pollution Reporting & Citizen Sensor Hub
            <span className="badge badge-demo">HYPERLOCAL PARTICIPATION</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Crowdsourced ground surveillance · Multi-citizen verification · Municipal rapid dispatch tracker
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPledgeModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Radio size={14} className="text-cyan-400 animate-pulse" />
            Host Balcony Sensor
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Send size={14} />
            Report Pollution Incident
          </button>
        </div>
      </div>

      {/* Citizen Sensor Host Banner */}
      <div className="hud-panel p-4 border border-cyan-500/30 bg-gradient-to-r from-navy-900 via-navy-950 to-cyan-950/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 flex-shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Citizen Balcony Sensor Network · 68 Active Nodes Across Delhi
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                COMMUNITY EXPANSION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Host an outdoor PM2.5 monitor on your terrace or balcony. Enjoy free solar power kits and automated CPCB reference calibration.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPledgeModal(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition-all flex-shrink-0 cursor-pointer"
        >
          Register Balcony Node →
        </button>
      </div>

      {/* Host Balcony Modal */}
      {showPledgeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-cyan-500/50 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="text-cyan-400" size={18} />
                Pledge Residential Balcony Sensor
              </h3>
              <button onClick={() => setShowPledgeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {pledgedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">Balcony Node Application Received!</div>
                <p className="text-xs text-slate-300">
                  Your node ID <code className="text-cyan-300">PM-CITIZEN-069</code> has been pre-registered. Our field coordinator will verify GPS line-of-sight. +50 Green XP Awarded!
                </p>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Your Neighborhood / Sector</label>
                  <select className="select-field w-full">
                    <option>Connaught Place (Inner/Outer)</option>
                    <option>RK Puram Sector 1-12</option>
                    <option>Dwarka Sector 1-23</option>
                    <option>Narela Industrial / Residential</option>
                    <option>Rohini Sector 1-18</option>
                    <option>Janakpuri West / East</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Installation Elevation</label>
                  <select className="select-field w-full">
                    <option>Balcony (1st - 3rd Floor, ~6m to 12m)</option>
                    <option>Terrace / Rooftop (4th Floor+, &gt;15m)</option>
                    <option>Ground Floor Lawn / Courtyard</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Power &amp; Wi-Fi Availability</label>
                  <div className="space-y-1.5 text-slate-300">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-cyan-500" />
                      Continuous 2.4 GHz Wi-Fi signal reachable on balcony
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-cyan-500" />
                      Direct sunlight for mini solar backup battery panel
                    </label>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    Confirm Node Pledge (+50 XP)
                  </button>
                  <button type="button" onClick={() => setShowPledgeModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-emerald-400 font-semibold text-sm">Report submitted successfully! +10 XP earned</div>
            <div className="text-slate-400 text-xs">A designated ward officer has been notified. Community members can now verify your observation.</div>
          </div>
        </div>
      )}

      {/* Submit form */}
      {showForm && (
        <div className="hud-panel p-5 border border-emerald-500/40 animate-fade-in">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Send size={16} className="text-emerald-400" />
            File New Citizen Pollution Incident
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2 font-semibold">Incident Classification</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                      form.category === cat.id
                        ? 'border-emerald-500/70 bg-emerald-500/15 shadow-sm shadow-emerald-500/20'
                        : 'border-navy-700 bg-navy-950/70 hover:border-navy-600'
                    }`}
                  >
                    <div className="text-2xl">{cat.icon}</div>
                    <div className="text-xs text-slate-300 font-medium mt-1">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Affected Neighborhood / Ward</label>
                <select
                  value={form.neighborhood}
                  onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                  className="select-field w-full"
                >
                  <option value="cp">Connaught Place</option>
                  <option value="rk">RK Puram</option>
                  <option value="dw">Dwarka Sector 10</option>
                  <option value="nm">Narela Industrial Fringe</option>
                  <option value="jn">Janakpuri</option>
                  <option value="lr">Lajpat Nagar</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Photographic Evidence</label>
                <div className="border border-dashed border-navy-700 rounded-xl p-3 text-center text-slate-400 text-xs bg-navy-950/60">
                  <Camera size={18} className="mx-auto mb-1 text-cyan-400" />
                  Auto-Geotagging Enabled · Timestamped Metadata
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Incident Details &amp; Odor Character</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what you observed — e.g. open garbage burning behind market, heavy diesel soot from unauthorized generator, or sulfurous odor..."
                className="input-field min-h-[80px] resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                <Send size={14} />
                Submit Incident Report (+10 XP)
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident reports by ward, keyword, or smoke type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="select-field">
          <option value="all">All Incident Statuses</option>
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
            <div key={report.id} className="hud-panel p-5 border border-navy-700 hover:border-cyan-500/40 transition-all">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="text-3xl p-2.5 rounded-xl bg-navy-950 border border-navy-800 flex-shrink-0">
                  {cat?.icon || '⚠️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{report.title}</span>
                      <span
                        className="badge flex items-center gap-1 text-[10px]"
                        style={{ background: (statusCfg?.color || '#94a3b8') + '22', color: statusCfg?.color || '#94a3b8', borderColor: (statusCfg?.color || '#94a3b8') + '40' }}
                      >
                        <StatusIcon size={10} />
                        {statusCfg?.label || report.status}
                      </span>
                    </div>

                    {/* Interactive Citizen Confirmation Button */}
                    <button
                      onClick={() => handleConfirmReport(report.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        report.hasConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow'
                          : 'bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700'
                      }`}
                      title="Confirm you also smell or see this pollution source"
                    >
                      <ThumbsUp size={12} className={report.hasConfirmed ? 'text-emerald-400' : 'text-slate-400'} />
                      <span>{report.confirmations} Verified by Citizens</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{report.description}</p>

                  {/* Municipal Action Status if active */}
                  {report.municipalAction && (
                    <div className="mb-2 p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
                      <Truck size={13} className="text-cyan-400 flex-shrink-0" />
                      <span><strong>Municipal Action:</strong> {report.municipalAction}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 border-t border-navy-800/60">
                    <span className="flex items-center gap-1 font-semibold text-slate-300"><MapPin size={11} className="text-cyan-400" />{report.neighborhood.toUpperCase()}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{report.timestamp.split('T')[0]}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{report.reporter}</span>
                    <span className="text-emerald-400 font-semibold font-mono">+{report.xp} XP {report.status === 'verified' ? 'earned' : 'pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Accountability Footer */}
      <div className="bg-navy-900/60 border border-navy-700 rounded-xl p-4 text-xs text-slate-400 leading-relaxed flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <strong>Democratic Environmental Moderation:</strong> Reports receiving 3+ citizen confirmations are escalated with high priority to Municipal Zonal Enforcement. False reports are flagged by community peer-review to protect sensor telemetry integrity.
        </div>
      </div>
    </div>
  );
}

