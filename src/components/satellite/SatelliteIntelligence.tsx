import { useState, useEffect, useRef } from 'react';
import {
  Satellite, Flame, Globe, Radio, Eye, Layers, ShieldAlert,
  ArrowUpRight, Wind, AlertTriangle, Compass, Sparkles, Activity,
  Info, BarChart3, CheckCircle2, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import {
  SATELLITE_CITIES, SATELLITE_FIRE_HOTSPOTS,
  type SatelliteCity
} from '../../data/satelliteData';

declare const L: any;

export default function SatelliteIntelligence() {
  const [selectedCity, setSelectedCity] = useState<SatelliteCity>(SATELLITE_CITIES[0]);
  const [activeLayers, setActiveLayers] = useState({
    aod: true,
    fires: true,
    no2: true,
    cities: true,
  });
  const [basemapType, setBasemapType] = useState<'satellite' | 'dark' | 'topo'>('satellite');
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [syncing, setSyncing] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const layersRef = useRef<{ aod?: any; fires?: any[]; no2?: any }>({});

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleSyncPass = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  // Filtered cities by region
  const filteredCities = SATELLITE_CITIES.filter(c => {
    if (activeRegion === 'all') return true;
    if (activeRegion === 'igp') return c.region.includes('Indo-Gangetic') || c.region.includes('Stubble');
    if (activeRegion === 'critical') return c.aqi >= 300;
    if (activeRegion === 'south') return c.region.includes('Plateau') || c.region.includes('Coastal');
    return true;
  });

  // Top 5 polluted cities
  const topPolluted = [...SATELLITE_CITIES].sort((a, b) => b.aqi - a.aqi).slice(0, 5);

  // Initialize National Satellite GIS Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    if (mapInstance.current) {
      try { mapInstance.current.remove(); } catch (e) {}
      mapInstance.current = null;
    }

    try {
      if (typeof L !== 'undefined') {
        const map = L.map(mapRef.current, {
          center: [23.5, 80.5], // Geographic center of India
          zoom: 5,
          minZoom: 4,
          maxZoom: 12,
          zoomControl: true,
          attributionControl: false,
        });

        // ESRI High-Resolution World Imagery (Real Earth Satellite Photos)
        const tileUrl = basemapType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : basemapType === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
          maxZoom: 18,
        }).addTo(map);

        mapInstance.current = map;
        renderSatelliteOverlays(map);
      }
    } catch (err) {
      console.error('Satellite map init error:', err);
    }

    return () => {
      if (mapInstance.current) {
        try { mapInstance.current.remove(); } catch (e) {}
        mapInstance.current = null;
      }
    };
  }, [basemapType]);

  // Re-render markers and overlays when layers or selected city changes
  useEffect(() => {
    if (!mapInstance.current) return;
    renderSatelliteOverlays(mapInstance.current);
  }, [activeLayers, selectedCity, activeRegion]);

  function renderSatelliteOverlays(map: any) {
    if (!map || typeof L === 'undefined') return;

    // Clear previous elements
    markersRef.current.forEach(m => {
      try { m.remove(); } catch (e) {}
    });
    markersRef.current = [];

    // 1. MODIS AEROSOL OPTICAL DEPTH (AOD) SMOG CORRIDOR OVERLAY
    if (activeLayers.aod) {
      // Indo-Gangetic Basin polygon (Punjab -> Haryana -> Delhi -> UP -> Bihar -> West Bengal)
      const igpCoords = [
        [32.2, 74.8],
        [30.8, 77.2],
        [29.8, 79.5],
        [27.6, 83.8],
        [26.2, 87.5],
        [24.5, 88.8],
        [22.8, 88.5],
        [24.2, 85.0],
        [25.4, 81.2],
        [27.5, 77.0],
        [29.2, 74.5],
      ];

      const aodPolygon = L.polygon(igpCoords, {
        color: '#f97316',
        weight: 1.5,
        fillColor: '#dc2626',
        fillOpacity: 0.28,
        dashArray: '4, 4',
      }).addTo(map);

      aodPolygon.bindTooltip(
        '<div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #dc2626;">' +
        '🛰️ NASA MODIS / TERRA: INDO-GANGETIC SMOG TRAP (AOD: 0.88 - 0.95)' +
        '</div>',
        { sticky: true }
      );

      markersRef.current.push(aodPolygon);
    }

    // 2. VIIRS S-NPP THERMAL FARM FIRE HOTSPOTS
    if (activeLayers.fires) {
      SATELLITE_FIRE_HOTSPOTS.forEach(fire => {
        const fireMarker = L.circleMarker([fire.lat, fire.lng], {
          radius: 9,
          fillColor: '#f97316',
          fillOpacity: 0.9,
          color: '#ffffff',
          weight: 2,
        }).addTo(map);

        fireMarker.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px; padding: 2px;">
            <b style="color: #ea580c;">🔥 VIIRS THERMAL FIRE CLUSTER</b><br/>
            ${fire.district}<br/>
            Active Anomalies: <b>${fire.fires}</b><br/>
            Radiative Power: ${fire.intensity}
          </div>`,
          { sticky: true }
        );

        markersRef.current.push(fireMarker);
      });
    }

    // 3. SENTINEL-5P TROPOSPHERIC NO2 HOTSPOTS
    if (activeLayers.no2) {
      // Key industrial NO2 clusters (NCR, Singrauli power belt, Korba)
      const no2Zones = [
        { lat: 28.5, lng: 77.2, r: 85000, name: 'Delhi-NCR Mega Industrial/Vehicular Cluster' },
        { lat: 24.1, lng: 82.6, r: 95000, name: 'Singrauli Thermal Power Generation Belt' },
        { lat: 22.3, lng: 82.7, r: 75000, name: 'Korba Industrial & Coal Fired Zone' },
      ];

      no2Zones.forEach(z => {
        const circle = L.circle([z.lat, z.lng], {
          radius: z.r,
          fillColor: '#8b5cf6',
          fillOpacity: 0.22,
          color: '#a855f7',
          weight: 1.5,
        }).addTo(map);

        circle.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px;">
            <b style="color: #a855f7;">🛰️ SENTINEL-5P TROPOMI NO₂ PLUME</b><br/>
            ${z.name}
          </div>`,
          { sticky: true }
        );

        markersRef.current.push(circle);
      });
    }

    // 4. NATIONAL HIGH POLLUTION CITIES GEOSPATIAL PINS
    if (activeLayers.cities) {
      filteredCities.forEach(city => {
        const isSelected = selectedCity.id === city.id;

        const pinHtml = `
          <div style="
            background: #0a1628;
            border: 2px solid ${isSelected ? '#ffffff' : city.color};
            box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${city.color};
            border-radius: 9999px;
            padding: 3px 8px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-family: monospace;
            cursor: pointer;
            transform: scale(${isSelected ? 1.25 : 1});
            transition: all 0.2s ease;
          ">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${city.color};"></span>
            <span style="color: #ffffff; font-size: 11px; font-weight: 800;">${city.name}</span>
            <span style="color: ${city.color}; font-size: 10px; font-weight: 900;">${city.aqi}</span>
          </div>
        `;

        const icon = L.divIcon({
          className: '',
          html: pinHtml,
          iconSize: [110, 26],
          iconAnchor: [55, 13],
        });

        const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);

        marker.on('click', () => {
          setSelectedCity(city);
          map.flyTo([city.lat, city.lng], 8, { duration: 1 });
        });

        markersRef.current.push(marker);
      });
    }
  }

  const flyToCity = (city: SatelliteCity) => {
    setSelectedCity(city);
    if (mapInstance.current) {
      mapInstance.current.flyTo([city.lat, city.lng], 8, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 critical-sonar" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Earth Observation & Remote Sensing Fleet
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-0.5">
            National Satellite Earth Observation & Smog Radar
            <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
              PAN-INDIA RADAR
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-Time Space Radiometry · NASA MODIS Aerosol Optical Depth (AOD) · ESA Sentinel-5P NO₂ · VIIRS Stubble Fires
          </p>
        </div>

        {/* Orbit Telemetry Passes Ticker */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncPass}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-cyan-500/30 hover:border-cyan-400"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin text-cyan-400' : 'text-slate-400'} />
            <span className="text-slate-300 font-mono">Sync Orbit Pass</span>
          </button>
          <div className="bg-navy-900/90 border border-navy-700 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2">
            <Satellite size={14} className="text-cyan-400" />
            <span className="text-slate-400">INSAT-3DR:</span>
            <span className="text-emerald-400 font-bold">74°E ACTIVE</span>
          </div>
        </div>
      </div>

      {/* SATELLITE CONTROLS & LAYER SWITCHER BAR */}
      <div className="hud-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Layer Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers size={13} className="text-cyan-400" />
            Sensors:
          </span>

          <button
            onClick={() => toggleLayer('aod')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
              activeLayers.aod
                ? 'bg-red-500/20 border-red-500 text-red-300 shadow-sm'
                : 'bg-navy-950 border-navy-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            MODIS AOD Smog Corridor
          </button>

          <button
            onClick={() => toggleLayer('fires')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
              activeLayers.fires
                ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm'
                : 'bg-navy-950 border-navy-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Flame size={12} className="text-orange-400" />
            VIIRS Stubble Fires ({SATELLITE_FIRE_HOTSPOTS.length} Clusters)
          </button>

          <button
            onClick={() => toggleLayer('no2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
              activeLayers.no2
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                : 'bg-navy-950 border-navy-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Zap size={12} className="text-purple-400" />
            Sentinel-5P NO₂ Gas
          </button>

          <button
            onClick={() => toggleLayer('cities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
              activeLayers.cities
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-navy-950 border-navy-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Radio size={12} className="text-cyan-400" />
            City Telemetry Pins
          </button>
        </div>

        {/* Basemap Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Basemap:</span>
          <div className="flex gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800">
            {(['satellite', 'dark', 'topo'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBasemapType(b)}
                className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-all ${
                  basemapType === b ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN SATELLITE EARTH OBSERVATION GIS STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Full Interactive Indian Satellite View */}
        <div className="lg:col-span-8 space-y-3">
          <div className="hud-panel p-3 relative overflow-hidden border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Indian Subcontinent Orbital Telemetry
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                Aerosol Optical Depth (AOD) &gt; 0.70 In Indo-Gangetic Basin
              </span>
            </div>

            {/* Leaflet Satellite Map Container */}
            <div className="relative rounded-xl overflow-hidden border border-navy-700 h-[520px]">
              <div ref={mapRef} className="w-full h-full" />

              {/* In-Map Floating Legend */}
              <div className="absolute bottom-3 left-3 z-[400] bg-navy-950/90 backdrop-blur-md p-3 rounded-xl border border-navy-700 shadow-xl space-y-1.5 text-[11px] font-mono max-w-xs">
                <div className="font-bold text-slate-200 uppercase tracking-wide">Radiometric Severity</div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-red-600 shadow-sm" />
                  <span>Hazardous / Severe (AOD &gt; 0.80)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
                  <span>Very Poor (AOD 0.55 - 0.79)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span>Moderate (AOD 0.35 - 0.54)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span>Clean / Plateau (AOD &lt; 0.35)</span>
                </div>
              </div>

              {/* Quick Centering Pill */}
              <div className="absolute top-3 right-3 z-[400] flex gap-2">
                <button
                  onClick={() => {
                    if (mapInstance.current) {
                      mapInstance.current.flyTo([23.5, 80.5], 5, { duration: 1 });
                    }
                  }}
                  className="bg-navy-950/85 hover:bg-navy-900 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono font-bold shadow-md"
                >
                  Reset India View
                </button>
              </div>
            </div>
          </div>

          {/* INDO-GANGETIC PLAIN (IGP) BASIN ENTANGLEMENT EXPLAINER */}
          <div className="hud-panel p-4 border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 flex-shrink-0 mt-0.5">
                <ShieldAlert size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  The Indo-Gangetic Basin Geographic Entrapment Phenomenon
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Indo-Gangetic Plain (IGP) is the world's most severe particulate entrapment corridor.
                  The 8,000-meter Himalayan mountain range acts as an impenetrable topographic barrier to the north,
                  trapping emissions from agricultural fires, coal plants, and 50+ million vehicles within a narrow surface bowl
                  where winter wind velocities fall below 4 km/h.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected City Diagnostic & High-Pollution Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected City Satellite Dossier Card */}
          <div className="hud-panel p-5 border border-cyan-500/40 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 space-y-4">
            <div className="flex items-start justify-between border-b border-navy-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Target Station · {selectedCity.state}
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">{selectedCity.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{selectedCity.region}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-mono" style={{ color: selectedCity.color }}>
                  {selectedCity.aqi}
                </div>
                <div className="text-xs font-black uppercase" style={{ color: selectedCity.color }}>
                  {selectedCity.category}
                </div>
              </div>
            </div>

            {/* Satellite Radiometric Stats Bento */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Aerosol Optical Depth</div>
                <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
                  {selectedCity.aod.toFixed(2)} <span className="text-xs text-slate-500 font-normal">AOD</span>
                </div>
                <div className="text-[9px] text-slate-500">MODIS Radiance</div>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Surface PM2.5</div>
                <div className="text-xl font-black font-mono text-red-400 mt-0.5">
                  {selectedCity.pm25} <span className="text-xs text-slate-500 font-normal">µg/m³</span>
                </div>
                <div className="text-[9px] text-slate-500">WHO Limit: 15 µg</div>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Thermal Fires</div>
                <div className="text-xl font-black font-mono text-orange-400 mt-0.5">
                  {selectedCity.thermalAnomalies} <span className="text-xs text-slate-500 font-normal">Fires</span>
                </div>
                <div className="text-[9px] text-slate-500">VIIRS 375m detection</div>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Tropospheric NO₂</div>
                <div className="text-xl font-black font-mono text-purple-400 mt-0.5">
                  {selectedCity.no2} <span className="text-xs text-slate-500 font-normal">ppb</span>
                </div>
                <div className="text-[9px] text-slate-500">Sentinel-5P Column</div>
              </div>
            </div>

            {/* Satellite details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-slate-400">Primary Emission Driver:</span>
                <span className="text-slate-200 font-semibold">{selectedCity.primaryPollutant}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-slate-400">Smoke Inflow Vector:</span>
                <span className="text-cyan-400 font-mono font-bold">{selectedCity.smokeInflowVector}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-slate-400">Active CPCB Ground Nodes:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedCity.cpcbStationCount} Stations Synced</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 italic bg-navy-950 p-3 rounded-xl border border-navy-800 leading-relaxed">
              "{selectedCity.notes}"
            </p>
          </div>

          {/* NATIONAL HIGH POLLUTION CITIES RANKING */}
          <div className="hud-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-red-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Top High-Pollution Cities Leaderboard
                </span>
              </div>
              <span className="badge badge-demo">RANKED BY AOD</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {topPolluted.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => flyToCity(c)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedCity.id === c.id
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-navy-800 bg-navy-950/80 hover:bg-navy-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-xs font-mono font-bold text-slate-400 flex items-center justify-center border border-navy-700">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {c.name}
                        <span className="text-[10px] text-slate-500 font-normal">({c.state})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        AOD: <b className="text-amber-400">{c.aod}</b> · {c.primaryPollutant.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black font-mono" style={{ color: c.color }}>
                      {c.aqi}
                    </div>
                    <div className="text-[9px] uppercase font-bold" style={{ color: c.color }}>
                      {c.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
