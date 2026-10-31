// ============================================================
// POLLUTIONMITRA — SHARED DEMO DATASET
// ALL values labelled DEMO/SIMULATED — not real measurements
// ============================================================

export const NEIGHBORHOODS = [
  { id: 'cp', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, risk: 'high' },
  { id: 'rk', name: 'RK Puram', lat: 28.5685, lng: 77.1800, risk: 'very-high' },
  { id: 'dw', name: 'Dwarka', lat: 28.5921, lng: 77.0460, risk: 'moderate' },
  { id: 'nm', name: 'Narela', lat: 28.8549, lng: 77.0934, risk: 'very-high' },
  { id: 'jn', name: 'Janakpuri', lat: 28.6217, lng: 77.0832, risk: 'moderate' },
  { id: 'lr', name: 'Lajpat Nagar', lat: 28.5693, lng: 77.2433, risk: 'high' },
  { id: 'nd', name: 'Noida Sec 62', lat: 28.6239, lng: 77.3647, risk: 'high' },
  { id: 'gh', name: 'Gurgaon Cyber City', lat: 28.4941, lng: 77.0884, risk: 'moderate' },
] as const;

export type NeighborhoodId = typeof NEIGHBORHOODS[number]['id'];

export const SENSORS = [
  {
    id: 'S001', label: 'CP-Central', neighborhood: 'cp',
    lat: 28.6315, lng: 77.2167,
    pm25: 142, pm10: 198, temp: 24.2, humidity: 68, aqi: 193,
    battery: 87, status: 'online' as const, signal: 'strong' as const,
    lastUpdate: '2 min ago', calibrated: '2024-10-15', health: 'good' as const,
  },
  {
    id: 'S002', label: 'RK-Sector-3', neighborhood: 'rk',
    lat: 28.5685, lng: 77.1800,
    pm25: 198, pm10: 267, temp: 23.8, humidity: 72, aqi: 248,
    battery: 45, status: 'online' as const, signal: 'moderate' as const,
    lastUpdate: '5 min ago', calibrated: '2024-09-20', health: 'warning' as const,
  },
  {
    id: 'S003', label: 'Dwarka-Sec-10', neighborhood: 'dw',
    lat: 28.5921, lng: 77.0460,
    pm25: 78, pm10: 112, temp: 25.1, humidity: 61, aqi: 130,
    battery: 92, status: 'online' as const, signal: 'strong' as const,
    lastUpdate: '1 min ago', calibrated: '2024-10-20', health: 'good' as const,
  },
  {
    id: 'S004', label: 'Narela-Main', neighborhood: 'nm',
    lat: 28.8549, lng: 77.0934,
    pm25: 224, pm10: 312, temp: 22.4, humidity: 75, aqi: 289,
    battery: 23, status: 'online' as const, signal: 'weak' as const,
    lastUpdate: '12 min ago', calibrated: '2024-08-10', health: 'critical' as const,
  },
  {
    id: 'S005', label: 'Janakpuri-West', neighborhood: 'jn',
    lat: 28.6217, lng: 77.0832,
    pm25: 89, pm10: 134, temp: 24.8, humidity: 65, aqi: 148,
    battery: 78, status: 'online' as const, signal: 'strong' as const,
    lastUpdate: '3 min ago', calibrated: '2024-10-01', health: 'good' as const,
  },
  {
    id: 'S006', label: 'Lajpat-Central', neighborhood: 'lr',
    lat: 28.5693, lng: 77.2433,
    pm25: 156, pm10: 221, temp: 24.0, humidity: 70, aqi: 207,
    battery: 0, status: 'offline' as const, signal: 'none' as const,
    lastUpdate: '3 hrs ago', calibrated: '2024-07-15', health: 'offline' as const,
  },
  {
    id: 'S007', label: 'Noida-62-Alpha', neighborhood: 'nd',
    lat: 28.6239, lng: 77.3647,
    pm25: 131, pm10: 184, temp: 24.5, humidity: 69, aqi: 182,
    battery: 65, status: 'malfunction' as const, signal: 'moderate' as const,
    lastUpdate: '45 min ago', calibrated: '2024-06-01', health: 'warning' as const,
  },
  {
    id: 'S008', label: 'Gurgaon-Cyber', neighborhood: 'gh',
    lat: 28.4941, lng: 77.0884,
    pm25: 62, pm10: 94, temp: 25.8, humidity: 58, aqi: 103,
    battery: 95, status: 'online' as const, signal: 'strong' as const,
    lastUpdate: '1 min ago', calibrated: '2024-10-25', health: 'good' as const,
  },
];

// 24-hour hourly readings for dashboard charts
export function generateHourlyData(baseAQI: number, spread = 40) {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    // Morning/evening peaks
    const peakFactor = (hour >= 7 && hour <= 10) || (hour >= 18 && hour <= 21) ? 1.4 : 0.8;
    const noise = (Math.random() - 0.5) * spread;
    const aqi = Math.max(20, Math.round(baseAQI * peakFactor + noise));
    const pm25 = Math.round(aqi * 0.65);
    const pm10 = Math.round(aqi * 0.9);
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      aqi,
      pm25,
      pm10,
      temp: 22 + Math.sin(i / 4) * 4 + Math.random() * 2,
      humidity: 65 + Math.cos(i / 5) * 10 + Math.random() * 5,
    };
  });
}

// 7-day trend data
export function generateTrendData(baseAQI: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    aqi: Math.max(30, Math.round(baseAQI + (Math.random() - 0.5) * 60)),
    pm25: Math.max(10, Math.round(baseAQI * 0.6 + (Math.random() - 0.5) * 30)),
    pm10: Math.max(15, Math.round(baseAQI * 0.85 + (Math.random() - 0.5) * 40)),
  }));
}

// Community reports
export const COMMUNITY_REPORTS = [
  {
    id: 'R001', category: 'smoke', title: 'Black smoke from garbage burning',
    neighborhood: 'cp', lat: 28.6330, lng: 77.2190,
    description: 'Large pile of garbage being burned near Palika Bazaar parking. Heavy black smoke visible.',
    status: 'verified', xp: 50, timestamp: '2024-11-01T08:30:00', reporter: 'User_7821',
    photos: 1,
  },
  {
    id: 'R002', category: 'construction', title: 'Construction dust — no suppression',
    neighborhood: 'rk', lat: 28.5700, lng: 77.1850,
    description: 'Major construction site with no water spraying. Dust cloud visible 500m away.',
    status: 'under_review', xp: 10, timestamp: '2024-11-01T10:15:00', reporter: 'User_4532',
    photos: 2,
  },
  {
    id: 'R003', category: 'industrial', title: 'Factory chimney smoke',
    neighborhood: 'nm', lat: 28.8560, lng: 77.0950,
    description: 'Yellow-brown smoke from factory chimney, strong chemical smell.',
    status: 'submitted', xp: 10, timestamp: '2024-11-01T09:45:00', reporter: 'User_9901',
    photos: 0,
  },
  {
    id: 'R004', category: 'dust', title: 'Road dust — unpaved stretch',
    neighborhood: 'jn', lat: 28.6240, lng: 77.0800,
    description: 'Unpaved road causing massive dust when vehicles pass.',
    status: 'resolved', xp: 50, timestamp: '2024-10-30T14:20:00', reporter: 'User_3344',
    photos: 1,
  },
  {
    id: 'R005', category: 'smoke', title: 'Diwali firecracker smoke still lingering',
    neighborhood: 'lr', lat: 28.5700, lng: 77.2450,
    description: 'Residual smoke from last night still causing low visibility.',
    status: 'verified', xp: 50, timestamp: '2024-11-01T07:00:00', reporter: 'User_5512',
    photos: 3,
  },
];

// Rewards / gamification
export const DEMO_USER = {
  id: 'demo_user',
  name: 'Demo Explorer',
  level: 4,
  xp: 2340,
  nextLevelXp: 3000,
  rank: 12,
  badges: [
    { id: 'first_report', name: 'First Observer', icon: '🔭', earned: true },
    { id: 'verified_5', name: 'Trusted Reporter', icon: '✅', earned: true },
    { id: 'streak_7', name: '7-Day Streak', icon: '🔥', earned: true },
    { id: 'cleanup', name: 'Cleanup Champion', icon: '🌱', earned: true },
    { id: 'diwali_watcher', name: 'Diwali Watch', icon: '🎆', earned: true },
    { id: 'sensor_help', name: 'Sensor Ally', icon: '📡', earned: false },
    { id: 'gold', name: 'Gold Guardian', icon: '🏆', earned: false },
  ],
  contributions: [
    { type: 'Verified report', xp: 50, date: '2024-11-01' },
    { type: 'Useful evidence', xp: 15, date: '2024-10-31' },
    { type: 'Community cleanup', xp: 50, date: '2024-10-29' },
    { type: 'Valid report', xp: 10, date: '2024-10-28' },
  ],
};

export const LEADERBOARD = [
  { rank: 1, name: 'EcoWarrior_Priya', xp: 8920, level: 9, neighborhood: 'RK Puram', badge: '🏆' },
  { rank: 2, name: 'AirGuard_Raj', xp: 7840, level: 8, neighborhood: 'Narela', badge: '🥈' },
  { rank: 3, name: 'GreenStar_Anita', xp: 6650, level: 8, neighborhood: 'Dwarka', badge: '🥉' },
  { rank: 4, name: 'Breathe_Delhi_01', xp: 5230, level: 7, neighborhood: 'CP', badge: '' },
  { rank: 5, name: 'SensorSam', xp: 4810, level: 6, neighborhood: 'Noida 62', badge: '' },
  { rank: 12, name: 'Demo Explorer', xp: 2340, level: 4, neighborhood: 'Janakpuri', badge: '' },
];

// Diwali pollution data (clearly DEMO/SIMULATED)
export const DIWALI_DATA = {
  years: [2021, 2022, 2023, 2024],
  neighborhoods: ['RK Puram', 'Connaught Place', 'Narela', 'Dwarka'],
  periods: {
    before: { label: '3 days before (Oct 28-30)', window: 'Oct 28–30' },
    during: { label: 'Diwali night (Oct 31)', window: 'Oct 31' },
    after: { label: '2 days after (Nov 1-2)', window: 'Nov 1–2' },
  },
  // [year][neighborhood][period] -> {pm25, pm10, aqi, temp, humidity, windSpeed}
  readings: {
    2024: {
      'RK Puram': {
        before: { pm25: 98, pm10: 142, aqi: 162, temp: 26, humidity: 62, windSpeed: 8.2, samples: 144 },
        during: { pm25: 287, pm10: 398, aqi: 342, temp: 22, humidity: 78, windSpeed: 3.1, samples: 48 },
        after:  { pm25: 156, pm10: 218, aqi: 207, temp: 23, humidity: 72, windSpeed: 5.8, samples: 96 },
      },
      'Connaught Place': {
        before: { pm25: 112, pm10: 158, aqi: 178, temp: 25, humidity: 64, windSpeed: 9.1, samples: 144 },
        during: { pm25: 245, pm10: 342, aqi: 298, temp: 21, humidity: 80, windSpeed: 2.8, samples: 48 },
        after:  { pm25: 142, pm10: 199, aqi: 193, temp: 22, humidity: 74, windSpeed: 6.2, samples: 96 },
      },
      'Narela': {
        before: { pm25: 145, pm10: 198, aqi: 201, temp: 25, humidity: 67, windSpeed: 7.5, samples: 72 },
        during: { pm25: 356, pm10: 489, aqi: 402, temp: 21, humidity: 82, windSpeed: 2.2, samples: 24 },
        after:  { pm25: 198, pm10: 278, aqi: 248, temp: 22, humidity: 76, windSpeed: 4.9, samples: 48 },
      },
      'Dwarka': {
        before: { pm25: 65, pm10: 98, aqi: 118, temp: 26, humidity: 59, windSpeed: 10.4, samples: 144 },
        during: { pm25: 178, pm10: 252, aqi: 232, temp: 22, humidity: 73, windSpeed: 4.2, samples: 48 },
        after:  { pm25: 92, pm10: 138, aqi: 152, temp: 23, humidity: 68, windSpeed: 7.1, samples: 96 },
      },
    },
    2023: {
      'RK Puram': {
        before: { pm25: 88, pm10: 128, aqi: 148, temp: 28, humidity: 58, windSpeed: 9.8, samples: 144 },
        during: { pm25: 312, pm10: 428, aqi: 368, temp: 23, humidity: 76, windSpeed: 2.4, samples: 48 },
        after:  { pm25: 168, pm10: 234, aqi: 221, temp: 24, humidity: 70, windSpeed: 6.1, samples: 96 },
      },
      'Connaught Place': {
        before: { pm25: 102, pm10: 145, aqi: 166, temp: 27, humidity: 60, windSpeed: 10.2, samples: 144 },
        during: { pm25: 268, pm10: 371, aqi: 318, temp: 22, humidity: 78, windSpeed: 3.2, samples: 48 },
        after:  { pm25: 148, pm10: 208, aqi: 199, temp: 23, humidity: 72, windSpeed: 6.8, samples: 96 },
      },
      'Narela': {
        before: { pm25: 132, pm10: 182, aqi: 188, temp: 27, humidity: 63, windSpeed: 8.6, samples: 72 },
        during: { pm25: 389, pm10: 521, aqi: 438, temp: 22, humidity: 84, windSpeed: 1.8, samples: 24 },
        after:  { pm25: 212, pm10: 298, aqi: 264, temp: 23, humidity: 78, windSpeed: 4.4, samples: 48 },
      },
      'Dwarka': {
        before: { pm25: 58, pm10: 89, aqi: 108, temp: 28, humidity: 55, windSpeed: 11.8, samples: 144 },
        during: { pm25: 198, pm10: 279, aqi: 249, temp: 23, humidity: 71, windSpeed: 4.8, samples: 48 },
        after:  { pm25: 98, pm10: 145, aqi: 162, temp: 24, humidity: 66, windSpeed: 7.8, samples: 96 },
      },
    },
  } as Record<number, Record<string, Record<string, { pm25: number; pm10: number; aqi: number; temp: number; humidity: number; windSpeed: number; samples: number }>>>,
};

// Weather data (DEMO)
export const WEATHER_DATA = {
  current: {
    temp: 24.2, feelsLike: 23.1, humidity: 68, pressure: 1012,
    windSpeed: 6.8, windDir: 'NW', windDeg: 315,
    condition: 'Hazy', icon: '🌫️',
    visibility: 4.2, uvIndex: 3, dewPoint: 17.8,
    rainfall: 0, description: 'Hazy with moderate pollution',
  },
  hourlyForecast: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    temp: 22 + Math.sin((i - 6) / 4) * 5 + Math.random() * 2,
    humidity: 65 + Math.cos(i / 5) * 12,
    windSpeed: 5 + Math.random() * 8,
    condition: i >= 6 && i <= 18 ? '☀️' : '🌙',
    rainfall: i >= 14 && i <= 16 ? 2.1 : 0,
  })),
  weeklyForecast: [
    { day: 'Today', high: 26, low: 19, condition: '🌫️', rain: 0, windSpeed: 7 },
    { day: 'Tomorrow', high: 25, low: 18, condition: '⛅', rain: 0, windSpeed: 9 },
    { day: 'Thu', high: 24, low: 17, condition: '🌧️', rain: 12, windSpeed: 14 },
    { day: 'Fri', high: 22, low: 16, condition: '🌧️', rain: 8, windSpeed: 18 },
    { day: 'Sat', high: 23, low: 17, condition: '⛅', rain: 2, windSpeed: 11 },
    { day: 'Sun', high: 25, low: 18, condition: '☀️', rain: 0, windSpeed: 8 },
    { day: 'Mon', high: 27, low: 19, condition: '☀️', rain: 0, windSpeed: 6 },
  ],
  correlations: [
    { windSpeed: 2, pm25: 245 }, { windSpeed: 4, pm25: 178 }, { windSpeed: 6, pm25: 142 },
    { windSpeed: 8, pm25: 98 }, { windSpeed: 10, pm25: 72 }, { windSpeed: 12, pm25: 58 },
    { windSpeed: 14, pm25: 44 }, { windSpeed: 16, pm25: 38 },
  ],
};

// Forecast data (DEMO/SIMULATED — NOT a real prediction)
export function generateForecast(baseAQI: number, hours = 48) {
  return Array.from({ length: hours }, (_, i) => {
    const hour = i;
    const trend = Math.sin(hour / 8) * 20;
    const noise = (Math.random() - 0.5) * 30;
    const aqi = Math.max(30, Math.round(baseAQI + trend + noise));
    const lower = Math.max(20, aqi - 25 - Math.round(i * 0.5));
    const upper = aqi + 25 + Math.round(i * 0.5);
    return {
      hour: `+${hour}h`,
      aqi, pm25: Math.round(aqi * 0.65), pm10: Math.round(aqi * 0.9),
      lower, upper, confidence: Math.max(40, 95 - i * 1.2),
    };
  });
}

// Alert data (DEMO)
export const ALERTS = [
  {
    id: 'A001', type: 'spike', severity: 'critical',
    neighborhood: 'Narela', sensor: 'S004',
    value: 224, threshold: 150, pollutant: 'PM2.5',
    message: 'PM2.5 spike — 49% above unhealthy threshold',
    timestamp: '2024-11-01T06:00:00', reason: 'Low wind speed + stubble burning region',
  },
  {
    id: 'A002', type: 'persistent', severity: 'high',
    neighborhood: 'RK Puram', sensor: 'S002',
    value: 198, threshold: 150, pollutant: 'PM2.5',
    message: 'PM2.5 elevated for 6+ consecutive hours',
    timestamp: '2024-11-01T04:00:00', reason: 'Post-Diwali residual + traffic',
  },
  {
    id: 'A003', type: 'offline', severity: 'medium',
    neighborhood: 'Lajpat Nagar', sensor: 'S006',
    value: 0, threshold: 0, pollutant: 'N/A',
    message: 'Sensor S006 offline — data gap',
    timestamp: '2024-10-31T21:00:00', reason: 'Battery depleted',
  },
  {
    id: 'A004', type: 'aqi', severity: 'high',
    neighborhood: 'Connaught Place', sensor: 'S001',
    value: 193, threshold: 150, pollutant: 'AQI',
    message: 'AQI in Unhealthy range — sensitive groups at risk',
    timestamp: '2024-11-01T07:30:00', reason: 'Morning traffic peak + low mixing layer',
  },
];

// Eco-routes (DEMO — illustrative, not real routing)
export const ECO_ROUTES = [
  {
    id: 'route_green', label: 'Lower Estimated Exposure', color: '#22c55e',
    distance: 4.2, duration: 18, exposureCategory: 'lower',
    pm25Avg: 68, segments: ['Lodi Garden path', 'Tree-lined Boulevard', 'Park corridor'],
    description: 'Passes through green corridors with lower estimated PM2.5 exposure based on nearby sensor readings.',
    warning: 'Exposure estimate based on nearest sensors; actual conditions may vary.',
  },
  {
    id: 'route_amber', label: 'Shortest Route', color: '#f59e0b',
    distance: 2.8, duration: 12, exposureCategory: 'moderate',
    pm25Avg: 134, segments: ['Main road stretch', 'Market area', 'Flyover approach'],
    description: 'Shortest path but passes through higher-traffic main road with elevated estimated exposure.',
    warning: 'Passes near known pollution hotspot. Consider alternate timing.',
  },
  {
    id: 'route_red', label: 'Standard Route', color: '#ef4444',
    distance: 3.1, duration: 14, exposureCategory: 'higher',
    pm25Avg: 168, segments: ['Industrial area', 'Bus depot road', 'Construction zone'],
    description: 'Direct route passes through areas with higher estimated pollution exposure.',
    warning: 'Route passes near industrial area and active construction. Not recommended during peak hours.',
  },
];

// AI Copilot demo responses
export const COPILOT_RESPONSES: Record<string, string> = {
  default: `Based on current **DEMO** sensor data across monitored neighborhoods:

**Current snapshot (DEMO data — not real measurements):**
- Highest PM2.5: Narela at 224 µg/m³ (DEMO sensor S004)
- Lowest PM2.5: Gurgaon Cyber City at 62 µg/m³ (DEMO sensor S008)
- Offline sensor: S006 (Lajpat Nagar) — data gap since 21:00

**Key observation:** Low overnight wind speeds (2–4 km/h) appear correlated with elevated morning PM2.5 across northern neighborhoods. This is an educational association based on demo data — not a validated causal finding.

*Data quality: DEMO/SIMULATED | Source: PollutionMitra demo dataset | Not real environmental measurements.*`,

  narela: `**Narela — Critical Zone Analysis (DEMO)**

Sensor S004 (Narela-Main) shows PM2.5 at **224 µg/m³** — significantly above the Indian NAAQS 24h standard of 60 µg/m³.

**Possible contributing factors (educational — not verified attribution):**
- Regional stubble burning from nearby agricultural areas
- Low overnight wind speed limiting dispersion
- Industrial activity in the vicinity
- Post-Diwali residual particulate matter

**Important caveat:** PM2.5 sensors measure total particulate concentration. Without source apportionment data, the system cannot determine how much each source contributes. Multiple sources likely overlap.

**Sensor health:** Battery at 23% — may go offline soon. Calibration overdue (last: Aug 2024).

*All data: DEMO/SIMULATED | Not real measurements.*`,

  diwali: `**Diwali Pollution Analysis (DEMO educational data)**

Comparing DEMO records for Diwali 2024 vs baseline:

| Neighborhood | Baseline PM2.5 | Diwali Night PM2.5 | Change |
|---|---|---|---|
| RK Puram | 98 µg/m³ | 287 µg/m³ | +193% |
| Narela | 145 µg/m³ | 356 µg/m³ | +145% |
| Connaught Place | 112 µg/m³ | 245 µg/m³ | +119% |
| Dwarka | 65 µg/m³ | 178 µg/m³ | +174% |

**Scientific note:** The observed PM2.5 increases during Diwali night are **temporal associations**. Sensors measure total PM2.5 — they cannot independently determine what fraction came from firecrackers vs traffic, industry, stubble burning, or meteorological effects. Wind speed dropped to 2–3 km/h on Diwali night, which alone can significantly increase measured concentrations.

*This analysis uses DEMO/SIMULATED data — not real historical observations.*`,

  wind: `**Wind & Pollution Correlation (DEMO educational analysis)**

Current wind: **NW at 6.8 km/h** (DEMO)

Based on demo data correlation patterns:
- Wind speeds below 5 km/h correlate with PM2.5 values 2–3× higher than at 12+ km/h
- NW wind direction in this demo dataset corresponds to higher readings at southeastern sensors (RK Puram, Lajpat Nagar)
- This is an **illustrative association** based on the demo dataset

**Important distinction:** Wind vectors show meteorological direction/speed. They do not prove actual pollutant trajectories without dispersion modelling with validated emission inputs and boundary conditions.

*All values: DEMO/SIMULATED | Educational association only.*`,

  routes: `**Eco-Route Comparison (DEMO — illustrative estimates)**

For your current area, 3 route alternatives are shown:

🟢 **Lower Exposure Route** (~68 µg/m³ avg PM2.5 estimated)
- Passes: Lodi Garden path → Tree-lined Boulevard → Park corridor
- +6 min longer but estimated 60% lower PM2.5 exposure

🟡 **Shortest Route** (~134 µg/m³ avg PM2.5 estimated)  
- Passes: Main road → Market area
- 2.8 km, 12 min

🔴 **Standard Route** (~168 µg/m³ avg PM2.5 estimated)
- Passes industrial area + construction zone — not recommended

**Estimation method:** Route exposure estimated by interpolating PM2.5 from nearest demo sensors weighted by distance. This is an illustrative indicator, not a measurement of inhaled dose.

*All values: DEMO/SIMULATED | Routing not connected to real provider in demo mode.*`,
};

// AQI category helper
export function getAQICategory(aqi: number): { label: string; color: string; bg: string; emoji: string } {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e', bg: '#166534', emoji: '😊' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308', bg: '#713f12', emoji: '😐' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#f97316', bg: '#7c2d12', emoji: '😷' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444', bg: '#7f1d1d', emoji: '🤢' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7', bg: '#581c87', emoji: '🚨' };
  return { label: 'Hazardous', color: '#9f1239', bg: '#4c0519', emoji: '☠️' };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online': return '#22c55e';
    case 'offline': return '#ef4444';
    case 'malfunction': return '#f97316';
    case 'calibration': return '#eab308';
    default: return '#94a3b8';
  }
}

