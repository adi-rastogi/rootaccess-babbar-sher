import { useState } from 'react';
import { Route, MapPin, Clock, Wind, Info, Navigation, Bike, Footprints } from 'lucide-react';
import { ECO_ROUTES } from '../../data/demoData';
import { useEffect, useRef } from 'react';

declare const L: any;

export default function EcoRoutes() {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mode, setMode] = useState<'walk' | 'cycle'>('cycle');
  const [selectedRoute, setSelectedRoute] = useState<string>(ECO_ROUTES[0].id);
  const [from, setFrom] = useState('Connaught Place');
  const [to, setTo] = useState('Lajpat Nagar');

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { center: [28.60, 77.22], zoom: 12, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Demo route polylines (illustrative paths — not real routing)
    const routes = [
      { color: '#22c55e', path: [[28.6315, 77.2167], [28.6100, 77.2200], [28.5950, 77.2300], [28.5693, 77.2433]], id: 'route_green' },
      { color: '#f59e0b', path: [[28.6315, 77.2167], [28.6000, 77.2350], [28.5800, 77.2400], [28.5693, 77.2433]], id: 'route_amber' },
      { color: '#ef4444', path: [[28.6315, 77.2167], [28.6200, 77.2450], [28.5900, 77.2500], [28.5693, 77.2433]], id: 'route_red' },
    ];

    routes.forEach(r => {
      L.polyline(r.path, {
        color: r.color,
        weight: r.id === selectedRoute ? 5 : 3,
        opacity: r.id === selectedRoute ? 0.9 : 0.4,
        dashArray: r.id === selectedRoute ? undefined : '8 4',
      }).addTo(map).bindTooltip(
        `<div style="font-size:11px; color:#94a3b8;">ILLUSTRATIVE route · Not real routing<br/><em>Demo only — not connected to routing provider</em></div>`
      );
    });

    // Start/end markers
    const startIcon = L.divIcon({
      className: '',
      html: `<div style="background:#22c55e;color:#030712;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;box-shadow:0 0 10px #22c55e44">A</div>`,
      iconSize: [28, 28], iconAnchor: [14, 14],
    });
    const endIcon = L.divIcon({
      className: '',
      html: `<div style="background:#ef4444;color:#030712;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;box-shadow:0 0 10px #ef444444">B</div>`,
      iconSize: [28, 28], iconAnchor: [14, 14],
    });
    L.marker([28.6315, 77.2167], { icon: startIcon }).addTo(map).bindTooltip('Start: Connaught Place (DEMO)');
    L.marker([28.5693, 77.2433], { icon: endIcon }).addTo(map).bindTooltip('End: Lajpat Nagar (DEMO)');

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  const selectedRouteData = ECO_ROUTES.find(r => r.id === selectedRoute)!;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Smart Eco-Routes
          <span className="badge badge-demo">DEMO — not real routing</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Pollution-aware walking & cycling routes · Illustrative exposure estimates · Real routing requires OSRM/GraphHopper</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300/80">
        <strong>Demo mode:</strong> Routes shown are illustrative paths on OpenStreetMap tiles, not real computed routes.
        In production, this connects to OSRM, GraphHopper, or OpenRouteService for actual road-network routing.
        Exposure estimates are interpolated from nearest DEMO sensors — not real measurements of inhaled dose.
      </div>

      {/* Route planner input */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-40">
          <label className="text-xs text-slate-400 block mb-1">From</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input value={from} onChange={e => setFrom(e.target.value)} className="input-field pl-8" />
          </div>
        </div>
        <div className="flex-1 min-w-40">
          <label className="text-xs text-slate-400 block mb-1">To</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
            <input value={to} onChange={e => setTo(e.target.value)} className="input-field pl-8" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Mode</label>
          <div className="flex gap-1">
            <button onClick={() => setMode('cycle')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all ${mode === 'cycle' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-navy-600 bg-navy-900 text-slate-400'}`}>
              <Bike size={14} />Cycling
            </button>
            <button onClick={() => setMode('walk')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all ${mode === 'walk' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-navy-600 bg-navy-900 text-slate-400'}`}>
              <Footprints size={14} />Walking
            </button>
          </div>
        </div>
        <button className="btn-primary">
          <Navigation size={14} />
          Find Routes (DEMO)
        </button>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row" style={{ minHeight: '500px' }}>
        {/* Route options */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
          {ECO_ROUTES.map(route => (
            <div
              key={route.id}
              onClick={() => setSelectedRoute(route.id)}
              className={`card cursor-pointer transition-all ${
                selectedRoute === route.id
                  ? 'border-2'
                  : 'hover:border-navy-600'
              }`}
              style={selectedRoute === route.id ? { borderColor: route.color } : {}}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: route.color }} />
                <span className="font-semibold text-white text-sm">{route.label}</span>
                {route.id === 'route_green' && <span className="badge bg-emerald-500/20 text-emerald-400 ml-auto text-xs">Recommended</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <div className="text-sm font-bold text-white">{route.distance} km</div>
                  <div className="text-xs text-slate-500">Distance</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{route.duration} min</div>
                  <div className="text-xs text-slate-500">Duration</div>
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: route.color }}>{route.pm25Avg}</div>
                  <div className="text-xs text-slate-500">Est. PM2.5</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-2">{route.description}</p>
              <div className="text-xs text-amber-400/80 flex items-start gap-1">
                <Info size={11} className="flex-shrink-0 mt-0.5" />
                {route.warning}
              </div>
              {selectedRoute === route.id && (
                <div className="mt-2 text-xs text-slate-500">
                  Via: {route.segments.join(' → ')}
                </div>
              )}
            </div>
          ))}

          <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-3 text-xs text-slate-500">
            Exposure estimate method: linear interpolation of PM2.5 from nearest DEMO sensors, weighted by distance.
            This is an <em>illustrative indicator</em>, not a measurement of inhaled dose.
            Actual exposure depends on breathing rate, activity level, mask use, and many other factors.
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-navy-700 relative" style={{ minHeight: '460px' }}>
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '460px' }} />
          <div className="absolute top-3 left-3 z-10 bg-navy-900/90 rounded-xl p-3 border border-navy-700">
            <div className="text-xs font-semibold text-slate-400 mb-2">Route Legend</div>
            {ECO_ROUTES.map(r => (
              <div key={r.id} className="flex items-center gap-2 mb-1">
                <div className="w-8 h-1.5 rounded-full" style={{ background: r.color }} />
                <span className="text-xs text-slate-400">{r.label}</span>
              </div>
            ))}
            <div className="text-xs text-slate-600 mt-2 border-t border-navy-700 pt-2">ILLUSTRATIVE paths only<br/>Not real routing data</div>
          </div>
        </div>
      </div>
    </div>
  );
}

