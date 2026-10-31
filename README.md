# 🌿 POLLUTIONMITRA
> **"Air Quality, Street by Street."**

PollutionMitra is an AI-powered neighborhood-level environmental intelligence platform designed to monitor air pollution, understand meteorological influences, visualize pollution movement, identify critical pollution hotspots, and help citizens make healthier everyday travel and environmental decisions.

---

## 🏆 Two Primary Innovations

1. **Wind-Aware Pollution Flow Mapping**
   - High-resolution interactive GIS map rendering OpenStreetMap tiles.
   - Live spatial interpolation of particulate gradients (`PM2.5` / `PM10` / `AQI`).
   - Integrated meteorological wind direction vectors contextualizing potential downwind dispersion.
   - Explicit scientific qualification: wind vectors indicate atmospheric flow direction, not verified pollutant trajectories without validated dispersion modelling.

2. **Smart Sensor Network & Critical-Zone Identification**
   - Multi-sensor IoT telemetry dashboard with real-time health classifications (`ONLINE`, `OFFLINE`, `SUSPECTED MALFUNCTION`, `NEEDS CALIBRATION`).
   - Automated threshold violations triggering localized alerts with transparent rationale (comparing measured values directly against Indian NAAQS 24h standards).
   - Sensor search, filtering, battery monitoring, and calibration tracking.

---

## 📦 Complete Platform Modules

| Module | Route | Key Capabilities |
|---|---|---|
| **Home Command Center** | `/dashboard` | Current AQI gauge, PM2.5, PM10, temp, humidity, wind, 24h trend graph, neighborhood comparisons, and active alerts. |
| **Voice-Guided Product Tour** | *Top Nav Button* | 15-step synchronized demonstration with spoken audio narration, subtitles, and automatic page navigation for hackathon judges. |
| **Wind-Aware Pollution Flow Map** | `/map` | Interactive Leaflet GIS map, layer toggles, sensor inspection popups, and spatial heat gradients. |
| **Smart Sensor Network** | `/sensors` | Sensor telemetry table, 24h reading charts, battery indicators, calibration records, and MQTT-ready architecture. |
| **Critical Pollution Zones** | `/critical-zones` | Zone rankings, severity badges (`CRITICAL`, `HIGH`, `MEDIUM`), and NAAQS threshold comparisons. |
| **Diwali Analytics & Smog Visualizer** | `/diwali` | Multi-year before/during/after Diwali comparisons, historical peaks, sample counts, and an interactive **Firecracker Smog Visualizer** with animated plume simulation and mandatory scientific honesty disclaimers. |
| **Weather Intelligence** | `/weather` | Wind compass, 7-day forecast, hourly metrics, and wind speed vs PM2.5 correlation scatter plots. |
| **Community Reporting** | `/community` | Citizen pollution incident submission (smoke, dust, construction, industrial), moderation workflow, and privacy protection. |
| **PollutionMitra Rewards** | `/rewards` | Quality-weighted XP gamification, user levels, achievement badges, and monthly neighborhood leaderboards. |
| **Neighborhood Forecasting** | `/forecast` | 6h to 48h predictive forecasts with widening uncertainty confidence bands and Future Hotspot Explorer. |
| **Environmental Scenario Lab** | `/simulator` | Interactive sandbox modifying wind, temperature, humidity, rain, traffic, and festival emissions, with side-by-side scenario comparisons. |
| **AI Environmental Copilot** | `/copilot` | Deterministic data-grounded assistant with microphone voice input and spoken answers. |
| **Smart Eco-Routes** | `/routes` | Walking and cycling route comparisons (Lower Estimated Exposure vs Shortest vs Standard) with segment breakdowns. |
| **Upcoming Innovations** | `/innovations` | Technology roadmap covering 6 planned capabilities (AI CCTV Traffic Intelligence, Multilingual Voice, 3D Simulation, Smart Mobility, City-Wide Scale, Intelligent Alerts). |
| **Admin Dashboard** | `/admin` | Protected administrative controls for sensors, reports moderation, system health, and configurable alert thresholds. |

---

## 🔬 Scientific Responsibility & Data Quality Standards

PollutionMitra enforces strict data provenance labelling across the UI:
- **`MEASURED`**: Physical hardware or authoritative observation (e.g. CPCB station).
- **`ESTIMATED`**: Distance-weighted spatial interpolation across nearby sensor readings.
- **`PREDICTED`**: Statistical or ML forecast model output.
- **`SIMULATED`**: Hypothetical scenario lab calculation or educational simulation.
- **`DEMO`**: Coherent sample data for live hackathon evaluation without active physical sensors.

> **Diwali Attribution Notice**: Particulate sensors measure mass concentration, not particle source. Observed peaks during Diwali are temporal associations; firecracker contribution is presented strictly as an educational/hypothetical scenario.

---

## 🚀 Running the Project

### Prerequisites
- Node.js v18+ (tested on Node.js v26.13)
- npm v9+

### Quick Start (Frontend Development)
```bash
# Clone or navigate to the directory
cd pollutionmitra

# Dependencies are already installed
# To start the dev server:
npm run dev
```

The application will be accessible at: **`http://localhost:5173`**

### Production Build
```bash
npm run build
```
Creates an optimized, production-ready bundle in `dist/`.

---

## 🛠️ Full-Stack Target Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet GIS, Recharts, Lucide Icons.
- **Backend API**: Python FastAPI, Pydantic v2, REST endpoints, WebSockets.
- **Database**: PostgreSQL 16 + PostGIS extension for spatial queries.
- **IoT Telemetry**: MQTT broker ready (`pollutionmitra/sensors/#`).
- **AI/ML**: Scikit-learn forecasting models, YOLOv8 traffic vision (planned).

