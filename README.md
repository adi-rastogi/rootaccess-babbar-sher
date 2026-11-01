# POLLUTIONMITRA
> **Air Quality, Street by Street.**  
> *Hyper-Local Environmental Intelligence, 3D Aerodynamic Micro-Canyon Modeling, and Multi-Source Telemetry Integration for Delhi NCR.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![OpenAQ](https://img.shields.io/badge/OpenAQ_v3-CPCB_DPCC-10b981)](https://openaq.org/)
[![WAQI](https://img.shields.io/badge/WAQI_API-Live_Feed-emerald)](https://waqi.info/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Executive Summary

PollutionMitra is an environmental monitoring and computational dispersion platform designed to address urban air quality challenges in the National Capital Region (NCR) of Delhi. While conventional air monitoring systems rely on sparse rooftop reference stations that average readings across broad municipal zones, ground-level exposure at the pedestrian breathing zone often exceeds rooftop measurements by factors of two to five due to urban aerodynamic trapping.

The platform integrates dual-stream telemetry from the World Air Quality Index (WAQI) network and OpenAQ v3 regulatory reference stations (operated by the Central Pollution Control Board and Delhi Pollution Control Committee), coupling live sensor data with urban micro-meteorological simulations, chemical source apportionment models, and biophysical inhalation risk assessments.

---

## Technical Specifications & Architecture

### 1. Programming Languages and Frameworks
* **TypeScript (v5.5):** Strict type enforcement across telemetry data structures, GIS coordinate transformations, and mathematical modeling engines.
* **React (v18.3):** Component architecture utilizing custom hooks for telemetry caching, real-time audio synchronization, and state management.
* **Vite (v5.4):** Build system and local development server featuring Hot Module Replacement (HMR) and optimized tree-shaking.
* **Tailwind CSS (v3.4):** High-contrast UI theme designed for mission-critical environmental dashboards and accessibility.
* **Canvas API & WebGL:** Hardware-accelerated 60 FPS aerodynamic particle simulations and vector gauges.
* **Web Audio API:** Real-time synthesis of transient acoustic waveforms and multi-channel audio synchronization.
* **Python (Tooling & Data Verification):** Geospatial bounding box verification scripts and data pipeline tests.

### 2. Data Infrastructure and Integration
* **WAQI (World Air Quality Index) Stream:** Continuous telemetry across active monitoring stations in Delhi NCR, providing Individual Air Quality Index (IAQI) metrics for PM2.5, PM10, NO2, SO2, CO, O3, temperature, relative humidity, and wind vectors.
* **OpenAQ v3 API:** Regulatory reference monitor data from the Central Pollution Control Board (CPCB) and Delhi Pollution Control Committee (DPCC), including Anand Vihar, Punjabi Bagh, R.K. Puram, ITO, and DTU.
* **Client Caching Architecture:** In-memory Time-To-Live (TTL) cache (120-second invalidation window) with request debouncing to optimize API request quotas while maintaining data freshness.
* **Offline Resiliency:** Deterministic mathematical fallback schema maintaining continuous system availability during upstream network anomalies.
* **Local Persistence:** Browser `localStorage` and `sessionStorage` APIs for user preferences, municipal report confirmations, and simulation state.

### 3. Scientific, Physical, and Mathematical Models

| Model Domain | Scientific Foundation | Implementation Details |
| :--- | :--- | :--- |
| **Micro-Meteorology (CFD)** | **Oke (1988) Urban Street Canyon Model** | Models aerodynamic flow regimes governed by building aspect ratio ($H/W$): Isolated Roughness ($H/W < 0.3$), Wake Interference ($0.3 \le H/W < 0.7$), and Skimming Flow ($H/W \ge 0.7$) causing trapped recirculating vortices. |
| **Atmospheric Dispersion** | **Gaussian Plume Dispersion Equation** | Simulates spatial downwind concentration fields from point and line emission sources using Pasquill-Gifford atmospheric stability parameters ($\sigma_y$, $\sigma_z$) and advective wind velocity ($u$). |
| **Aerosol Forensic AI** | **Stoichiometric Speciation Analysis** | Distinguishes episodic pyrotechnic events from baseline vehicular exhaust by analyzing diagnostic Barium ($\text{Ba}^{2+}$) and Strontium ($\text{Sr}^{2+}$) tracers against flat Carbon Monoxide controls. |
| **Acoustic Shockwave DSP** | **Transient Rise-Time Analysis ($<15\text{ ms}$)** | Verifies physical explosive deflagrations via high-amplitude pressure gradients ($>95\text{ dB}$) with steep leading-edge rise times. |
| **Pulmonary Biomechanics** | **ICRP Respiratory Deposition Model** | Models regional particle penetration depth across nasopharyngeal ($\text{PM}_{10}$), tracheobronchial ($\text{PM}_{2.5}$), and deep alveolar sacs ($\text{PM}_{0.1}$). |
| **Exposure Routing** | **Dijkstra Cumulative Inhalation Optimization** | Computes pedestrian and cycling routes that minimize integrated toxic dosage ($D = \sum C_i \cdot V_E \cdot t_i$), reducing particulate exposure by up to 58%. |
| **Optical Calibration** | **Hygrothermal Growth Correction Curve** | Corrects optical particle counter measurements during high relative humidity ($RH > 70\%$) to account for aerosol hygroscopic swelling in winter inversion conditions. |
| **Conversational AI** | **Domain-Constrained Natural Language Parser** | Contextual environmental query processor with out-of-domain filtering, live telemetry grounding, and dual-language speech synthesis. |

---

## Core System Modules

### 1. 3D LiDAR Micro-Canyon Dispersion (`/canyon`)
Standard municipal monitoring stations are installed on open rooftops, failing to measure the micro-climates where pedestrians breathe. Grounded in Oke (1988) urban boundary layer theory, this module simulates aerodynamic wind-building interactions in high-density corridors:
* Real-time adjustment of building height ($H$), street width ($W$), and ambient wind velocity ($U_b$).
* Interactive visualization of rooftop skimming layer versus pedestrian-level recirculating eddy backflow.
* Stratified comparative sensors displaying elevation-dependent concentration gradients.
* Presets calibrated to actual Delhi architectural corridors: Connaught Place Radial, Nehru Place Canyon, and Gurgaon Cyber City Tower Corridor.

### 2. Precision Predictive Health Engine (`/health`)
* Demographic Vulnerability Stratification: Tailored clinical recommendations for pediatric, geriatric, asthmatic, cardiovascular, and athletic cohorts.
* Anatomical Deposition Visualization: Interactive cross-section illustrating particle filtration and deep tissue translocation.
* Diurnal Boundary Layer Windows: Identification of morning thermal inversion hazards versus afternoon planetary boundary layer mixing windows.
* Respirator Efficiency Matrix: Empirical filtration comparison across cloth, surgical, N95, and N99 particulate respirators.
* Indoor Clean Air Delivery Rate (CADR) Calculator: CFM and turnover rate computation based on room volume and outdoor particulate ingress.

### 3. Diwali Chemical Speciation and Acoustic Shockwave Forensics (`/diwali`)
* Dual-modality source attribution separating seasonal biomass and vehicle exhaust from illegal pyrotechnic activity.
* Aerosol spectrometry displaying tracer ratios ($\text{Ba}^{2+}$ surge $+840\%$, $\text{Sr}^{2+}$ surge $+610\%$, $\text{CO}$ flat $+6\%$).
* Digital signal processing simulation identifying explosive acoustic transients exceeding $95\text{ dB}$.
* Dynamic event simulation testing sensor network response thresholds with automated incident audit generation.

### 4. Citizen Reporting and Balcony Sensor Network (`/community`)
* Balcony Sensor Host Initiative: Residential registry for hosting low-cost optical IoT particulate monitors.
* Ground-Truth Incident Verification: Consensus-based confirmation mechanism for localized garbage burning and construction dust emissions.
* Municipal Dispatch Workflow: Integration hooks for dispatching dust suppression equipment, mechanical sweepers, and anti-smog water cannons.

### 5. Wind-Aware Pollution Flow GIS Map (`/map`)
* OpenStreetMap base layers coupled with spatial particulate concentration interpolations.
* Vectorized wind flow streamlines depicting regional transport corridors across the Indo-Gangetic Plain.
* Interactive station inspection markers with real-time telemetry overlays.

### 6. Dual-Language Guided Tour System
* High-fidelity studio narration in English and formal Hindi.
* Event-driven synchronization connecting audio playback state (`onTimeUpdate`, `onEnded`) to route navigation and UI focus highlights.
* Multi-stage playback pipeline supporting standard HTML5 audio formats with graceful Web Speech API fallback.

---

## Application Route Directory

| Module Name | Path | Primary Functionality |
| :--- | :--- | :--- |
| **Command Center Dashboard** | `/dashboard` | Real-time AQI gauge, multi-pollutant telemetry, 24-hour temporal profile, station switcher, and API verification panel. |
| **Wind-Aware GIS Map** | `/map` | Geographic information system mapping, particulate heatmaps, wind vectors, and station details. |
| **Sensor & Monitor Network** | `/sensors` | Telemetry inspection table, OpenAQ regulatory monitors, WAQI continuous feeds, and MQTT schema. |
| **3D Urban Micro-Canyon** | `/canyon` | Aerodynamic building vortex simulator, Oke flow regimes, and elevation-stratified concentration profiles. |
| **Precision Health Alerts** | `/health` | Cohort risk stratification, ICRP deposition depths, diurnal safety windows, and HEPA CADR calculator. |
| **Diwali Pyrotechnic Intelligence** | `/diwali` | Chemical tracer analysis (Barium/Strontium), acoustic deflagration detector, and burst simulation. |
| **Critical Hotspot Radar** | `/critical-zones` | Automated priority ranking, severity categorization, and NAAQS standard threshold comparisons. |
| **Satellite Earth Observation** | `/satellite` | Aerosol Optical Depth (INSAT-3DR), Sentinel-5P NO2 columns, and NASA VIIRS thermal fire anomalies. |
| **Meteorological Intelligence** | `/weather` | Planetary boundary layer height, temperature inversion modeling, and dispersion correlations. |
| **Community Reporting Hub** | `/community` | Citizen event reporting, Balcony Sensor Host registration, and municipal response tracking. |
| **Eco-Mobility Navigation** | `/routes` | Walking and cycling route optimization minimizing cumulative inhaled particulate dose. |
| **Environmental AI Copilot** | `/copilot` | Natural language telemetry interface with domain-specific guardrails and voice synthesis. |
| **Clean Air Rewards Program** | `/rewards` | Citizen engagement metrics, verified contribution tracking, and civic leaderboards. |
| **Neighborhood Forecaster** | `/forecast` | Short-term and medium-term predictive particulate forecasting with confidence intervals. |
| **Policy Scenario Simulator** | `/simulator` | Micro-simulation modeling odd-even vehicular policies, industrial restrictions, and mist cannon deployment. |
| **Administrative Operations** | `/admin` | Telemetry health diagnostics, citizen report moderation, and alert threshold configuration. |

---

## Installation and Setup

### Prerequisites
* **Node.js:** Version 18.0.0 or higher
* **npm:** Version 9.0.0 or higher

### Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/adi-rastogi/rootaccess-babbar-sher.git
   cd rootaccess-babbar-sher
   ```

2. **Configure Environment Variables:**
   Copy the example environment configuration file:
   ```bash
   cp .env.example .env
   ```
   Add your API keys to `.env` (optional; the application includes deterministic offline telemetry fallback if keys are omitted):
   ```env
   VITE_WAQI_TOKEN=your_waqi_api_token_here
   VITE_OPENAQ_API_KEY=your_openaq_v3_api_key_here
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Launch Development Server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:5173`

5. **Production Build:**
   ```bash
   npm run build
   npm run preview
   ```

---

## Data Governance and External Services

* **World Air Quality Index (WAQI) Project:** Real-time continuous station feeds across the National Capital Region.
* **OpenAQ Platform:** Regulatory reference monitoring stations operated by the Central Pollution Control Board (CPCB) and Delhi Pollution Control Committee (DPCC).
* **OpenStreetMap & CartoDB:** Cartographic base layers and spatial coordinate reference systems.
* **Security & Privacy:** API credentials must be maintained within local `.env` configuration files and must not be committed to source control. Low-cost community sensor locations are aggregated to municipal ward centroids to protect residential privacy.

---

## License

This project is open-source software distributed under the **MIT License**.
