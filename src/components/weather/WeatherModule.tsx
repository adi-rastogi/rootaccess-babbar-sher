import { Cloud, Wind, Droplets, Thermometer, Eye, Sun } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from 'recharts';
import { WEATHER_DATA } from '../../data/demoData';

function WeatherCard({ icon: Icon, label, value, unit, color, sub }: any) {
  return (
    <div className="card-hover flex items-center gap-3 p-4">
      <div className="p-2 rounded-lg" style={{ background: color + '22' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-bold text-white">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></div>
        {sub && <div className="text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

function WindCompass({ deg, speed }: { deg: number; speed: number }) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dir = dirs[Math.round(deg / 45) % 8];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="54" fill="#0a1628" stroke="#162d5e" strokeWidth="2" />
          {dirs.map((d, i) => {
            const angle = (i * 45 - 90) * Math.PI / 180;
            const x = 60 + 42 * Math.cos(angle);
            const y = 60 + 42 * Math.sin(angle);
            return <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={d === 'N' ? '#22c55e' : '#475569'} fontSize="10" fontWeight="bold">{d}</text>;
          })}
          {/* Wind arrow */}
          <g transform={`rotate(${deg}, 60, 60)`}>
            <polygon points="60,20 55,50 60,45 65,50" fill="#22d3ee" opacity="0.9" />
            <polygon points="60,100 55,70 60,75 65,70" fill="#475569" opacity="0.5" />
          </g>
          <circle cx="60" cy="60" r="4" fill="#22d3ee" />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-cyan-400 font-bold">{WEATHER_DATA.current.windDir}</div>
        <div className="text-slate-400 text-sm">{speed} km/h</div>
      </div>
    </div>
  );
}

export default function WeatherModule() {
  const w = WEATHER_DATA.current;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Weather Intelligence
          <span className="badge badge-demo">DEMO weather data</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Integrated meteorological analysis · Pollution correlation · Configurable weather API provider</p>
      </div>

      {/* Current conditions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <WeatherCard icon={Thermometer} label="Temperature" value={w.temp.toFixed(1)} unit="°C" color="#06b6d4" sub={`Feels ${w.feelsLike}°C`} />
        <WeatherCard icon={Droplets} label="Humidity" value={w.humidity} unit="%" color="#8b5cf6" sub={`Dew: ${w.dewPoint}°C`} />
        <WeatherCard icon={Wind} label="Wind Speed" value={w.windSpeed} unit="km/h" color="#22d3ee" sub={w.windDir} />
        <WeatherCard icon={Eye} label="Visibility" value={w.visibility} unit="km" color="#f59e0b" />
        <WeatherCard icon={Cloud} label="Pressure" value={w.pressure} unit="hPa" color="#6366f1" />
        <WeatherCard icon={Sun} label="UV Index" value={w.uvIndex} unit="" color="#eab308" sub="Moderate" />
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wind compass */}
        <div className="card flex flex-col items-center py-6">
          <div className="section-title justify-center mb-4">Wind Compass</div>
          <WindCompass deg={w.windDeg} speed={w.windSpeed} />
          <div className="mt-4 text-xs text-slate-500 text-center">
            Direction: {w.windDir} · Speed: {w.windSpeed} km/h<br />
            <span className="text-slate-600">Illustrative DEMO data</span>
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="card lg:col-span-2">
          <div className="section-title">7-Day Forecast <span className="badge badge-demo ml-auto">DEMO</span></div>
          <div className="grid grid-cols-7 gap-1">
            {WEATHER_DATA.weeklyForecast.map((day, i) => (
              <div key={i} className="text-center bg-navy-900 rounded-lg p-2">
                <div className="text-xs text-slate-500 font-medium">{day.day}</div>
                <div className="text-2xl my-1">{day.condition}</div>
                <div className="text-xs font-bold text-white">{day.high}°</div>
                <div className="text-xs text-slate-500">{day.low}°</div>
                {day.rain > 0 && <div className="text-xs text-blue-400">{day.rain}mm</div>}
                <div className="text-xs text-slate-600">{day.windSpeed}km/h</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly chart */}
      <div className="card">
        <div className="section-title">
          Hourly Temperature & Humidity
          <span className="badge badge-demo ml-auto">DEMO</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={WEATHER_DATA.hourlyForecast.slice(0, 24)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} interval={3} />
            <YAxis yAxisId="temp" orientation="left" tick={{ fill: '#64748b', fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="humid" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#06b6d4" strokeWidth={2} dot={false} name="Temp (°C)" />
            <Line yAxisId="humid" type="monotone" dataKey="humidity" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Humidity (%)" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wind vs PM2.5 correlation */}
      <div className="card">
        <div className="section-title">Wind Speed vs PM2.5 — Illustrative Correlation</div>
        <p className="text-xs text-slate-500 mb-3">
          DEMO data showing an inverse association between wind speed and PM2.5. This is an illustrative pattern, not a validated causal relationship.
          Higher wind speed may dilute pollutants, but local sources, atmospheric stability, and other factors all contribute.
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={WEATHER_DATA.correlations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162d5e" />
            <XAxis dataKey="windSpeed" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Wind Speed (km/h)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f2044', border: '1px solid #162d5e', borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} name="PM2.5 µg/m³" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

