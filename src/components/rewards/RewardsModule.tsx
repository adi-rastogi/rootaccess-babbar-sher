import { useState } from 'react';
import { Trophy, Star, Shield, Flame, Leaf, Target, Gift, Ticket, Copy, Check, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { DEMO_USER, LEADERBOARD } from '../../data/demoData';

interface Coupon {
  id: string;
  title: string;
  sponsor: string;
  costXp: number;
  discount: string;
  category: string;
  icon: string;
  description: string;
  terms: string;
}

interface RedeemedVoucher {
  id: string;
  couponId: string;
  title: string;
  sponsor: string;
  code: string;
  discount: string;
  redeemedAt: string;
  expiresInDays: number;
}

const STORE_COUPONS: Coupon[] = [
  {
    id: 'metro-5',
    title: 'Delhi Metro 5-Ride Smog Shield Pass',
    sponsor: 'DMRC Green Mobility',
    costXp: 400,
    discount: '100% OFF 5 Trips',
    category: 'Transit',
    icon: '🚇',
    description: 'Free travel across all DMRC metro lines on declared Severe/Very Poor AQI days to promote public transit.',
    terms: 'Valid on smart card / QR tickets within 30 days of redemption.',
  },
  {
    id: 'n95-respirator',
    title: 'Vogmask / Cambridge N95 Certified Mask',
    sponsor: 'Apollo Pharmacy & Netmeds',
    costXp: 550,
    discount: '₹350 Instant OFF',
    category: 'Health',
    icon: '😷',
    description: 'Flat discount voucher on dual-valved military-grade N95 particulate respirators.',
    terms: 'Valid online or at any Apollo Pharmacy outlet nationwide.',
  },
  {
    id: 'yulu-ride',
    title: 'Yulu Miracle EV Bike 60-Min Free Ride',
    sponsor: 'Yulu Urban Mobility',
    costXp: 300,
    discount: '60 Min Free Rental',
    category: 'EV Transit',
    icon: '⚡',
    description: 'Zero-emission micro-mobility commute voucher for last-mile metro connectivity.',
    terms: 'Apply in Yulu app wallet before unlocking vehicle.',
  },
  {
    id: 'snake-plant',
    title: 'Air-Purifying Snake Plant & Peace Lily Combo',
    sponsor: 'NurseryLive & Urvann',
    costXp: 750,
    discount: 'Free Nursery Plant Kit',
    category: 'Nature',
    icon: '🪴',
    description: 'NASA clean air study verified indoor botanical duo absorbing formaldehyde & benzene.',
    terms: 'Free doorstep shipping included across Delhi-NCR.',
  },
  {
    id: 'hepa-filter',
    title: 'Philips / Coway HEPA Filter Replacement',
    sponsor: 'Coway India & Philips',
    costXp: 900,
    discount: 'Flat ₹600 OFF',
    category: 'Clean Air',
    icon: '💨',
    description: 'Discount coupon for genuine True HEPA H13 anti-microbial replacement filter cartridge.',
    terms: 'Valid on official brand store checkouts.',
  },
  {
    id: 'ac-cleaning',
    title: 'Home AC Anti-Smog Deep Foam Cleaning',
    sponsor: 'Urban Company',
    costXp: 500,
    discount: 'Flat ₹250 OFF',
    category: 'Home',
    icon: '❄️',
    description: 'High-pressure anti-bacterial coil wash to unclog winter smog particles and dust from indoor ACs.',
    terms: 'Valid on booking 1 or more split/window AC services.',
  },
];

export default function RewardsModule() {
  const [userXp, setUserXp] = useState<number>(1450);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([
    {
      id: 'v-sample-1',
      couponId: 'metro-5',
      title: 'Delhi Metro 5-Ride Smog Shield Pass',
      sponsor: 'DMRC Green Mobility',
      code: 'MITRA-DMRC-8392',
      discount: '100% OFF 5 Trips',
      redeemedAt: 'Yesterday',
      expiresInDays: 28,
    },
  ]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'vouchers' | 'leaderboard'>('store');

  const user = DEMO_USER;
  const progressPct = ((userXp % 500) / 500) * 100;

  const handleRedeem = (coupon: Coupon) => {
    if (userXp < coupon.costXp) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newVoucher: RedeemedVoucher = {
      id: 'v-' + Date.now(),
      couponId: coupon.id,
      title: coupon.title,
      sponsor: coupon.sponsor,
      code: `MITRA-${coupon.category.toUpperCase().slice(0, 4)}-${randomSuffix}`,
      discount: coupon.discount,
      redeemedAt: 'Just now',
      expiresInDays: 30,
    };

    setUserXp(prev => prev - coupon.costXp);
    setRedeemedVouchers(prev => [newVoucher, ...prev]);
    setSelectedCoupon(null);
    setActiveTab('vouchers');
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Eco-Rewards & Coupon Redemption Store
            <span className="badge badge-demo">EARN & REDEEM</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Redeem verified environmental citizen XP points for metro passes, N95 respirators, EV bike rentals & botanical air filters
          </p>
        </div>

        {/* Live User Balance Pill */}
        <div className="flex items-center gap-3 bg-navy-950 p-2 px-4 rounded-2xl border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Available Balance</div>
            <div className="text-2xl font-black font-mono text-emerald-400">{userXp} <span className="text-xs text-slate-300 font-normal">XP</span></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'store'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={14} />
          Eco-Rewards Store ({STORE_COUPONS.length})
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'vouchers'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ticket size={14} />
          My Active Vouchers
          {redeemedVouchers.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-navy-950 text-[10px] font-black flex items-center justify-center ml-1">
              {redeemedVouchers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy size={14} />
          Leaderboard & Badges
        </button>
      </div>

      {/* STORE VIEW */}
      {activeTab === 'store' && (
        <div className="space-y-6 animate-fade-in">
          {/* User Status Banner */}
          <div className="hud-panel p-5 bg-gradient-to-r from-navy-950 via-emerald-950/20 to-navy-950 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf size={14} />
                Eco Guardian Tier {user.level}
              </span>
              <h3 className="text-lg font-bold text-white">Turn Clean Air Contributions into Tangible Rewards</h3>
              <p className="text-xs text-slate-300">
                You receive verified XP every time your smoke report, cleanup event, or sensor node calibration is confirmed.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400">Total Redeemed</div>
                <div className="text-lg font-bold font-mono text-white">{redeemedVouchers.length} Vouchers</div>
              </div>
            </div>
          </div>

          {/* Coupon Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STORE_COUPONS.map(coupon => {
              const canAfford = userXp >= coupon.costXp;
              return (
                <div
                  key={coupon.id}
                  className="hud-panel p-5 rounded-2xl flex flex-col justify-between border border-navy-700/80 hover:border-emerald-500/40 transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2.5 rounded-xl bg-navy-950 border border-navy-800">
                          {coupon.icon}
                        </span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {coupon.category} · {coupon.sponsor}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{coupon.title}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                      {coupon.discount}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{coupon.description}</p>
                  </div>

                  <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Redemption Cost</div>
                      <div className="text-base font-black font-mono text-white">
                        {coupon.costXp} <span className="text-xs text-slate-400 font-normal">XP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCoupon(coupon)}
                      disabled={!canAfford}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-navy-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-navy-900 border border-navy-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Gift size={13} />
                      {canAfford ? 'Redeem Coupon' : 'Need More XP'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY ACTIVE VOUCHERS VIEW */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6 animate-fade-in">
          {redeemedVouchers.length === 0 ? (
            <div className="hud-panel p-12 text-center space-y-3">
              <Ticket size={48} className="mx-auto text-slate-600" />
              <h3 className="text-lg font-bold text-white">No Redeemed Vouchers Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Visit the Eco-Rewards store tab and use your XP points to unlock metro passes, masks, and discount vouchers!
              </p>
              <button
                onClick={() => setActiveTab('store')}
                className="btn-primary text-xs py-2 px-4 mx-auto"
              >
                Go to Rewards Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemedVouchers.map(v => (
                <div
                  key={v.id}
                  className="hud-panel p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        Active Voucher · {v.sponsor}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{v.title}</h4>
                      <div className="text-xs text-emerald-300 font-bold mt-1">{v.discount}</div>
                    </div>
                    <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                      READY TO USE
                    </span>
                  </div>

                  {/* Promo Code Box */}
                  <div className="bg-navy-950 p-3.5 rounded-xl border border-dashed border-cyan-500/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Voucher Promo Code</div>
                      <div className="text-lg font-black font-mono text-cyan-300 tracking-wider mt-0.5">
                        {v.code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(v.code)}
                      className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      {copiedCode === v.code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedCode === v.code ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Voucher metadata & Barcode */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-navy-800">
                    <span>Redeemed: {v.redeemedAt}</span>
                    <span className="font-mono text-amber-400 font-semibold">Expires in {v.expiresInDays} days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD & BADGES VIEW */}
      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          {/* Profile card */}
          <div className="hud-panel lg:col-span-1 flex flex-col items-center text-center p-6">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center text-2xl font-black text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
              DE
            </div>
            <h2 className="text-white font-bold text-lg">{user.name}</h2>
            <div className="badge bg-emerald-500/20 text-emerald-400 mt-1">Level {user.level} — Eco Guardian</div>
            <div className="text-slate-400 text-xs mt-1">Rank #{user.rank} of 1,248 contributors</div>

            {/* XP progress */}
            <div className="w-full mt-6">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{userXp} XP Available</span>
                <span>Level {user.level + 1} Target (2,000 XP)</span>
              </div>
              <div className="h-2.5 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6">
              {[
                { label: 'Reports', value: '14' },
                { label: 'Verified', value: '9' },
                { label: 'Cleanups', value: '2' },
              ].map(s => (
                <div key={s.label} className="bg-navy-950 rounded-xl p-3 text-center border border-navy-800">
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="hud-panel p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
              <Trophy size={16} className="text-amber-400" />
              Citizen Environmental Achievements
            </div>
            <div className="grid grid-cols-4 gap-3">
              {user.badges.map(badge => (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                    badge.earned
                      ? 'border-amber-500/40 bg-amber-500/10 shadow-md shadow-amber-500/10'
                      : 'border-navy-800 bg-navy-950 opacity-40'
                  }`}
                  title={badge.name}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-[11px] text-slate-300 mt-1 font-semibold leading-tight">{badge.name}</span>
                  {!badge.earned && <span className="text-[9px] text-slate-500 mt-0.5">Locked</span>}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-navy-800 pt-4">
              <div className="text-xs font-semibold text-slate-400 mb-2">XP Earning Opportunities</div>
              {[
                { action: 'Geo-tagged smoke/fire report submitted', xp: '+10 XP' },
                { action: 'Moderator / satellite verification confirmed', xp: '+40 XP' },
                { action: 'Validated camera/sensor upload', xp: '+15 XP' },
                { action: 'Community cleanup drive participation', xp: '+50 XP' },
              ].map(r => (
                <div key={r.action} className="flex justify-between text-xs py-1">
                  <span className="text-slate-400">{r.action}</span>
                  <span className="text-emerald-400 font-mono font-bold">{r.xp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard list */}
          <div className="hud-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Trophy size={16} className="text-amber-400" />
                Monthly Citizen Leaderboard
              </div>
              <span className="badge badge-demo">DELHI NCR</span>
            </div>

            <div className="space-y-2.5">
              {LEADERBOARD.map((item, i) => {
                const isUser = item.name === user.name;
                return (
                  <div
                    key={item.rank}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isUser
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-white font-bold'
                        : 'border-navy-800 bg-navy-950 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        i === 0 ? 'bg-amber-400 text-navy-950' :
                        i === 1 ? 'bg-slate-300 text-navy-950' :
                        i === 2 ? 'bg-amber-600 text-white' : 'bg-navy-800 text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                      <div>
                        <div className="text-xs font-semibold">{item.name} {isUser && '(You)'}</div>
                        <div className="text-[10px] text-slate-500">{item.neighborhood} · Level {item.level}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-emerald-400 font-bold">{item.xp} XP</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REDEEM CONFIRMATION MODAL */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="hud-panel max-w-md w-full p-6 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCoupon.icon}</span>
                <h3 className="text-base font-bold text-white">Confirm Coupon Redemption</h3>
              </div>
              <button
                onClick={() => setSelectedCoupon(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedCoupon.sponsor}</span>
                <h4 className="text-lg font-black text-white">{selectedCoupon.title}</h4>
                <div className="text-emerald-400 font-mono font-bold text-sm mt-0.5">{selectedCoupon.discount}</div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-navy-950 p-3 rounded-xl border border-navy-800">
                {selectedCoupon.description}
              </p>

              <div className="text-[11px] text-slate-400">
                <strong>Terms:</strong> {selectedCoupon.terms}
              </div>

              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Current Balance: <span className="text-white font-mono">{userXp} XP</span></div>
                  <div className="text-[10px] text-slate-400">After Redemption: <span className="text-emerald-400 font-mono">{userXp - selectedCoupon.costXp} XP</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black font-mono text-emerald-300">-{selectedCoupon.costXp} XP</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedCoupon(null)}
                className="btn-secondary text-xs py-2.5 flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRedeem(selectedCoupon)}
                className="btn-primary text-xs py-2.5 flex-1 justify-center bg-emerald-500 hover:bg-emerald-400 text-navy-950 shadow-lg shadow-emerald-500/20"
              >
                Confirm & Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
