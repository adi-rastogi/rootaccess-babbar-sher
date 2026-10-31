import { useEffect, useRef, useState } from 'react';
import { Layers, Wind, Info, AlertTriangle, Radio, Sparkles, Navigation, Activity, ShieldAlert, Sliders } from 'lucide-react';
import { SENSORS, NEIGHBORHOODS, getAQICategory, getStatusColor } from '../../data/demoData';
import { useApp } from '../../App';

declare const L: any;

export default function PollutionMap() {
  const { selectedNeighborhood } = useApp();
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const windMarkersRef = useRef<any[]>([]);
  const heatLayerRef = useRef<any[]>([]);
  const flowLinesRef = useRef<any[]>([]);

  const [layers, setLayers] = useState({
    heatmap: true,
    flowStreamlines: true,
    windVectors: true,
    sensors: true,
    hotspots: true,
  });

  const [activeMetric, setActiveMetric] = useState<'pm25' | 'pm10' | 'aqi'>('pm25');
  const [selectedSensor, setSelectedSensor] = useState<any>(SENSORS[0]);
  const [windSimulationSpeed, setWindSimulationSpeed] = useState<'stagnant' | 'normal' | 'gusty'>('normal');

  // Wind speed factors based on selection
  const windSpeedMap = {
    stagnant: { speed: 2.4, label: 'Stagnant (2.4 km/h)', dispersionText: 'Severe Particulate Accumulation', effectiveness: 24, spreadArea: 86, plumeWidth: 2.2 },
    normal: { speed: 6.8, label: 'Moderate (6.8 km/h)', dispersionText: 'Typical Urban Dispersion', effectiveness: 68, spreadArea: 164, plumeWidth: 4.8 },
    gusty: { speed: 14.5, label: 'High (14.5 km/h)', dispersionText: 'Accelerated Downwind Dilution', effectiveness: 94, spreadArea: 310, plumeWidth: 8.4 },
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    try {
      if (typeof L !== 'undefined') {
        const map = L.map(mapRef.current, {
          center: [28.65, 77.16],
          zoom: 11,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;

        renderAllLayers(map);
      }
    } catch (err) {
      console.error('PollutionMap Leaflet error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-render when metric, layer toggles, or wind speed change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    renderAllLayers(mapInstanceRef.current);
  }, [layers, activeMetric, windSimulationSpeed]);

  // Pan to selected neighborhood
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const n = NEIGHBORHOODS.find(nb => nb.id === selectedNeighborhood);
    if (n) {
      mapInstanceRef.current.flyTo([n.lat, n.lng], 13, { duration: 1.2 });
    }
  }, [selectedNeighborhood]);

  function renderAllLayers(map: any) {
    // Clear old layers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    windMarkersRef.current.forEach(m => m.remove());
    windMarkersRef.current = [];
    heatLayerRef.current.forEach(c => c.remove());
    heatLayerRef.current = [];
    flowLinesRef.current.forEach(l => l.remove());
    flowLinesRef.current = [];

    if (layers.heatmap) {
      renderPollutionFlowHeatmap(map);
    }
    if (layers.flowStreamlines) {
      renderFlowStreamlines(map);
    }
    if (layers.windVectors) {
      renderAnimatedWindVectors(map);
    }
    if (layers.hotspots) {
      renderCriticalHotspots(map);
    }
    if (layers.sensors) {
      renderSensors(map);
    }
  }

  // 1. DYNAMIC POLLUTION FLOW HEATMAP LAYER
  function renderPollutionFlowHeatmap(map: any) {
    SENSORS.forEach(sensor => {
      const val = activeMetric === 'pm25' ? sensor.pm25 : activeMetric === 'pm10' ? sensor.pm10 : sensor.aqi;
      const cat = getAQICategory(sensor.aqi);

      // Multiple concentric rings representing continuous gradient dispersion downwind
      const baseRadius = 900 + val * 4.5;
      const stretchFactor = windSimulationSpeed === 'gusty' ? 1.4 : windSimulationSpeed === 'stagnant' ? 0.8 : 1.1;

      // Outer halo
      const outerRing = L.circle([sensor.lat, sensor.lng], {
        radius: baseRadius * 1.6 * stretchFactor,
        fillColor: cat.color,
        fillOpacity: 0.08,
        color: cat.color,
        weight: 1,
        opacity: 0.15,
        className: 'pollution-wave',
      }).addTo(map);
      heatLayerRef.current.push(outerRing);

      // Mid concentration zone
      const midRing = L.circle([sensor.lat, sensor.lng], {
        radius: baseRadius * stretchFactor,
        fillColor: cat.color,
        fillOpacity: 0.18,
        color: cat.color,
        weight: 1.5,
        opacity: 0.4,
      }).addTo(map);
      midRing.bindTooltip(`
        <div style="font-family:Inter,sans-serif; padding:4px;">
          <div style="font-weight:700; color:#fff;">${sensor.label} — Spatial Dispersion</div>
          <div style="color:${cat.color}; font-weight:600; font-size:12px;">${val} ${activeMetric === 'aqi' ? 'AQI' : 'µg/m³'} (${cat.label})</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Inverse Distance Weighted interpolation · DEMO</div>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });
      heatLayerRef.current.push(midRing);

      // Core plume zone
      const core = L.circle([sensor.lat, sensor.lng], {
        radius: baseRadius * 0.45,
        fillColor: cat.color,
        fillOpacity: 0.35,
        color: cat.color,
        weight: 2,
        opacity: 0.7,
      }).addTo(map);
      heatLayerRef.current.push(core);
    });
  }

  // 2. POLLUTION FLOW STREAMLINES (NW to SE trajectory corridor)
  function renderFlowStreamlines(map: any) {
    const streamCorridors = [
      // Corridor 1: Narela downwind towards Central Delhi
      [[28.8549, 77.0934], [28.7600, 77.1400], [28.6800, 77.1800], [28.6315, 77.2167]],
      // Corridor 2: Janakpuri through RK Puram towards Lajpat Nagar
      [[28.6217, 77.0832], [28.5900, 77.1300], [28.5685, 77.1800], [28.5693, 77.2433]],
      // Corridor 3: Central CP towards Noida Sec 62
      [[28.6315, 77.2167], [28.6280, 77.2800], [28.6239, 77.3647]],
      // Corridor 4: West Dwarka to South
      [[28.5921, 77.0460], [28.5400, 77.0700], [28.4941, 77.0884]],
    ];

    streamCorridors.forEach((path, i) => {
      // Flow trajectory line with animated dashed pulse
      const flowLine = L.polyline(path, {
        color: '#22d3ee',
        weight: 2.5,
        opacity: 0.75,
        className: 'wind-vector-animated',
      }).addTo(map);

      flowLine.bindTooltip(`
        <div style="font-size:11px; color:#22d3ee; font-weight:600;">
          Atmospheric Pollution Flow Corridor #${i + 1}<br/>
          <span style="color:#94a3b8; font-weight:normal; font-size:10px;">
            Bearing: 135° (NW → SE) · Modeled plume trajectory
          </span>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });

      flowLinesRef.current.push(flowLine);
    });
  }

  // 3. MOVING WIND VECTORS (DYNAMIC ARROWS DRIFTING IN WIND DIRECTION)
  function renderAnimatedWindVectors(map: any) {
    const windNodes = [
      { lat: 28.82, lng: 77.08 },
      { lat: 28.75, lng: 77.16 },
      { lat: 28.71, lng: 77.24 },
      { lat: 28.66, lng: 77.10 },
      { lat: 28.64, lng: 77.18 },
      { lat: 28.63, lng: 77.29 },
      { lat: 28.58, lng: 77.12 },
      { lat: 28.55, lng: 77.22 },
      { lat: 28.52, lng: 77.30 },
      { lat: 28.48, lng: 77.14 },
    ];

    windNodes.forEach((node, idx) => {
      // Custom divIcon with animated drifting arrow
      const windIcon = L.divIcon({
        className: '',
        html: `
          <div class="wind-arrow-drift" style="animation-delay: ${(idx * 0.25).toFixed(2)}s; display: flex; align-items: center; justify-content: center;">
            <div style="
              transform: rotate(135deg);
              color: #22d3ee;
              font-size: 20px;
              filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.7));
            ">
              ➤
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const m = L.marker([node.lat, node.lng], { icon: windIcon }).addTo(map);
      m.bindTooltip(`
        <div style="font-size:11px; color:#22d3ee;">
          <strong>Live Wind Vector:</strong> NW 315° at ${windSpeedMap[windSimulationSpeed].speed} km/h<br/>
          <span style="color:#94a3b8; font-size:10px;">Vectors show meteorological movement</span>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });

      windMarkersRef.current.push(m);
    });
  }

  // 4. CRITICAL BLINKING HOTSPOTS
  function renderCriticalHotspots(map: any) {
    const hotspots = [
      { lat: 28.8549, lng: 77.0934, name: 'Narela Industrial Hub', pm25: 224, aqi: 289 },
      { lat: 28.5685, lng: 77.1800, name: 'RK Puram Hotspot', pm25: 198, aqi: 248 },
    ];

    hotspots.forEach(hp => {
      // Blinking sonar pulse ring
      const sonarIcon = L.divIcon({
        className: '',
        html: `
          <div style="position: relative; width: 44px; height: 44px;">
            <div class="critical-sonar" style="
              position: absolute; inset: 0;
              border-radius: 50%;
              background: rgba(239, 68, 68, 0.45);
              border: 2px solid #ef4444;
            "></div>
            <div class="critical-blink" style="
              position: absolute; top: 10px; left: 10px;
              width: 24px; height: 24px;
              border-radius: 50%;
              background: #ef4444;
              border: 2px solid #ffffff;
              display: flex; align-items: center; justify-content: center;
              color: #ffffff; font-size: 11px; font-weight: 800;
              box-shadow: 0 0 16px #ef4444;
            ">
              !
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const hotspotMarker = L.marker([hp.lat, hp.lng], { icon: sonarIcon, zIndexOffset: 1000 }).addTo(map);
      hotspotMarker.bindTooltip(`
        <div style="font-family:Inter,sans-serif; padding:4px;">
          <div style="font-weight:800; color:#ef4444; font-size:12px;">CRITICAL ACCUMULATION ZONE</div>
          <div style="font-weight:700; color:#fff; margin-top:2px;">${hp.name}</div>
          <div style="font-size:11px; color:#fca5a5; margin-top:2px;">PM2.5: ${hp.pm25} µg/m³ · AQI: ${hp.aqi} (Hazardous)</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:3px;">Continuous low wind dispersion trapping particulates</div>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });

      heatLayerRef.current.push(hotspotMarker);
    });
  }

  // 5. SENSOR TELEMETRY MARKERS
  function renderSensors(map: any) {
    SENSORS.forEach(sensor => {
      const val = activeMetric === 'pm25' ? sensor.pm25 : activeMetric === 'pm10' ? sensor.pm10 : sensor.aqi;
      const cat = getAQICategory(sensor.aqi);
      const statusColor = getStatusColor(sensor.status);

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 38px; height: 38px;
            background: #0f2044;
            border: 2px solid ${cat.color};
            border-radius: 50%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 800; color: #ffffff;
            box-shadow: 0 0 14px ${cat.color}66;
            cursor: pointer;
            position: relative;
            transition: transform 0.2s ease;
          ">
            <span>${val}</span>
            <div style="
              position: absolute; bottom: -3px; right: -3px;
              width: 11px; height: 11px;
              background: ${statusColor};
              border-radius: 50%;
              border: 1.5px solid #0a1628;
            "></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([sensor.lat, sensor.lng], { icon }).addTo(map);

      marker.on('click', () => {
        setSelectedSensor(sensor);
      });

      marker.bindTooltip(`
        <div style="font-family:Inter,sans-serif; padding:5px;">
          <div style="font-weight:700; color:#ffffff; font-size:13px;">${sensor.label}</div>
          <div style="color:${cat.color}; font-size:12px; font-weight:700; margin-top:2px;">
            ${activeMetric.toUpperCase()}: ${val} ${activeMetric === 'aqi' ? '' : 'µg/m³'} — ${cat.label}
          </div>
          <div style="color:#94a3b8; font-size:11px; margin-top:4px; line-height:1.4;">
            Temp: ${sensor.temp}°C · Humidity: ${sensor.humidity}%<br/>
            Status: <span style="color:${statusColor}; font-weight:600;">${sensor.status.toUpperCase()}</span> · Batt: ${sensor.battery}%
          </div>
        </div>
      `, { className: 'leaflet-popup-content-wrapper' });

      markersRef.current.push(marker);
    });
  }

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in" style={{ minHeight: '85vh' }}>
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 hud-panel p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              Wind-Aware Pollution Flow Mapping
            </h1>
            <span className="badge bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs">
              GIS CORE INNOVATION
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Real-time geospatial dispersion modeling · OpenStreetMap tiles · Live atmospheric flow streamlines
          </p>
        </div>

        {/* Metric Selector & Simulation Speed */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-navy-950/70 p-1 rounded-lg border border-navy-700">
            {(['pm25', 'pm10', 'aqi'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeMetric === metric
                    ? 'bg-emerald-500 text-navy-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Wind Speed Control */}
          <div className="flex items-center gap-1.5 bg-navy-950/70 px-2.5 py-1.5 rounded-lg border border-navy-700">
            <Wind size={14} className="text-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-400 mr-1">Wind Mode:</span>
            {(['stagnant', 'normal', 'gusty'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setWindSimulationSpeed(mode)}
                className={`px-2 py-0.5 rounded text-xs transition-all ${
                  windSimulationSpeed === mode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-medium'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map + Side Telemetry Panel */}
      <div className="flex gap-4 flex-1 flex-col lg:flex-row min-h-0">
        {/* Map Canvas Container */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-navy-700 shadow-2xl" style={{ minHeight: '520px' }}>
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '520px' }} />

          {/* Floating Layer Controls */}
          <div className="absolute top-4 left-4 z-10 hud-panel p-3.5 space-y-2 max-w-xs shadow-xl">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-navy-700/60 pb-1.5">
              <Layers size={13} className="text-cyan-400" />
              Active GIS Overlays
            </div>
            {[
              { id: 'heatmap', label: `${activeMetric.toUpperCase()} Dispersion Heatmap` },
              { id: 'flowStreamlines', label: 'Pollution Flow Corridors' },
              { id: 'windVectors', label: 'Moving Wind Vectors' },
              { id: 'hotspots', label: 'Blinking Critical Hotspots' },
              { id: 'sensors', label: 'IoT Sensor Markers' },
            ].map(item => (
              <label key={item.id} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={(layers as any)[item.id]}
                  onChange={e => setLayers(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="accent-emerald-400 w-3.5 h-3.5 rounded"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          {/* Meteorological Vector Floating Card */}
          <div className="absolute top-4 right-4 z-10 hud-panel p-3.5 max-w-xs shadow-xl hidden sm:block">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
              <Wind size={14} className="animate-spin-slow" />
              ATMOSPHERIC VECTOR STATUS
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Direction:</span>
                <span className="font-mono text-cyan-300 font-bold">NW (315°)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flow Velocity:</span>
                <span className="font-mono text-white font-bold">{windSpeedMap[windSimulationSpeed].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispersion State:</span>
                <span className="font-mono text-emerald-400 text-right">{windSpeedMap[windSimulationSpeed].dispersionText}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 border-t border-navy-700/60 pt-1.5 leading-tight">
              Moving arrows show live wind direction. Flow corridors project potential particulate transit paths.
            </p>
          </div>

          {/* Scale Legend */}
          <div className="absolute bottom-6 left-4 z-10 hud-panel p-3 shadow-xl">
            <div className="text-[11px] font-bold text-white mb-1.5 flex items-center justify-between">
              <span>{activeMetric.toUpperCase()} Concentration Scale</span>
              <span className="text-[10px] text-slate-400">{activeMetric === 'aqi' ? 'Index' : 'µg/m³'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              {[
                { label: 'Good (≤50)', color: '#22c55e' },
                { label: 'Moderate (≤100)', color: '#eab308' },
                { label: 'Unhealthy Sens (≤150)', color: '#f97316' },
                { label: 'Unhealthy (≤200)', color: '#ef4444' },
                { label: 'Very Unhealthy (≤300)', color: '#a855f7' },
                { label: 'Hazardous (>300)', color: '#9f1239' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 bg-navy-950/40 px-1.5 py-0.5 rounded">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-300 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Telemetry & Sensor Inspector */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
          {/* Active Sensor Inspector */}
          {selectedSensor ? (
            <div className="hud-panel p-4 border-cyan-500/30 animate-fade-in">
              <div className="flex items-center justify-between mb-3 border-b border-navy-700/60 pb-2">
                <div>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">TELEMETRY NODE</span>
                  <h3 className="font-bold text-white text-base leading-tight">{selectedSensor.label}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black" style={{ color: getAQICategory(selectedSensor.aqi).color }}>
                    {activeMetric === 'pm25' ? selectedSensor.pm25 : activeMetric === 'pm10' ? selectedSensor.pm10 : selectedSensor.aqi}
                  </span>
                  <div className="text-[10px] text-slate-400">{activeMetric === 'aqi' ? 'AQI' : 'µg/m³'}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Zone ID', value: selectedSensor.id },
                  { label: 'Region', value: selectedSensor.neighborhood.toUpperCase() },
                  { label: 'PM2.5 Reading', value: `${selectedSensor.pm25} µg/m³`, color: '#ef4444' },
                  { label: 'PM10 Reading', value: `${selectedSensor.pm10} µg/m³`, color: '#f97316' },
                  { label: 'Calculated AQI', value: `${selectedSensor.aqi} (${getAQICategory(selectedSensor.aqi).label})`, color: getAQICategory(selectedSensor.aqi).color },
                  { label: 'Ambient Temp', value: `${selectedSensor.temp}°C` },
                  { label: 'Relative Humidity', value: `${selectedSensor.humidity}%` },
                  { label: 'Battery / Hardware', value: `${selectedSensor.battery}% (${selectedSensor.health.toUpperCase()})` },
                  { label: 'Node Status', value: selectedSensor.status.toUpperCase(), color: getStatusColor(selectedSensor.status) },
                  { label: 'Last Telemetry', value: selectedSensor.lastUpdate },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1 border-b border-navy-800/60">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-mono font-medium" style={{ color: (row as any).color || '#f1f5f9' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 rounded-lg bg-navy-950/80 border border-navy-700 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold">Downwind Path:</span> Particulates dispersing southeast toward {selectedSensor.neighborhood === 'nm' ? 'Central Delhi' : 'Yamuna corridor'} under {windSpeedMap[windSimulationSpeed].speed} km/h wind.
              </div>
            </div>
          ) : (
            <div className="hud-panel p-8 text-center text-slate-500">
              <Radio size={28} className="mx-auto mb-2 opacity-40 text-cyan-400 animate-pulse" />
              Select a sensor node on the map to inspect telemetry
            </div>
          )}

          {/* Sensor Quick Selector List */}
          <div className="hud-panel p-3.5">
            <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity size={13} className="text-emerald-400" />
                Network Sensors ({SENSORS.length})
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">LIVE DEMO</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {SENSORS.map(s => {
                const cat = getAQICategory(s.aqi);
                const isSelected = selectedSensor?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSensor(s)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-white'
                        : 'bg-navy-950/50 hover:bg-navy-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: getStatusColor(s.status) }} />
                      <span className="text-xs font-medium truncate">{s.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: cat.color }}>
                      {activeMetric === 'pm25' ? `${s.pm25} µg` : activeMetric === 'pm10' ? `${s.pm10} µg` : s.aqi}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Dispersion Effectiveness & Spread Analytics */}
      <div className="hud-panel p-5 border-cyan-500/30">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Pollution Spread Effectiveness & Ground Dispersion Modeling
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Downwind Vector: 135° (NW → SE Corridor)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span>Dispersion Dilution Efficiency</span>
              <span className="font-mono font-bold text-cyan-400">{windSpeedMap[windSimulationSpeed].effectiveness}%</span>
            </div>
            <div className="h-2 bg-navy-900 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-400"
                style={{ width: `${windSpeedMap[windSimulationSpeed].effectiveness}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {windSimulationSpeed === 'stagnant'
                ? 'Critically low ground mixing traps toxic particles in urban canyons.'
                : windSimulationSpeed === 'normal'
                ? 'Standard advection dilution across the 25km NCR corridor.'
                : 'Rapid boundary layer flushing clears local particulate accumulation.'}
            </p>
          </div>

          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-800">
            <div className="text-xs text-slate-400 mb-1">Downwind Plume Spread Area</div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              ~{windSpeedMap[windSimulationSpeed].spreadArea} <span className="text-xs font-normal text-slate-400">km²</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Modeled plume lateral boundary: {windSpeedMap[windSimulationSpeed].plumeWidth} km
            </div>
          </div>

          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-800">
            <div className="text-xs text-slate-400 mb-1">Ground Concentration Drop-off</div>
            <div className="text-xs text-slate-300 space-y-1 font-mono mt-2">
              <div className="flex justify-between"><span>Source (0 km):</span><span className="text-red-400">224 µg/m³</span></div>
              <div className="flex justify-between"><span>Mid-Stream (8 km):</span><span className="text-orange-400">168 µg/m³</span></div>
              <div className="flex justify-between"><span>Downwind Tail (20 km):</span><span className="text-yellow-400">92 µg/m³</span></div>
            </div>
          </div>

          <div className="bg-navy-950/70 p-4 rounded-xl border border-navy-800 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Atmospheric Inversion</div>
              <div className="text-sm font-bold text-amber-400 mt-1">Shallow Nocturnal Inversion</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Mixing Height: ~420 meters</div>
            </div>
            <div className="text-[10px] text-cyan-400/80 pt-2 border-t border-navy-800 mt-2">
              ✓ Heatmap contours actively conform to real-time wind vector velocity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
